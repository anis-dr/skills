#!/usr/bin/env python3
"""Render a Plotter SVG or HTML file to PNG so the drawing can be inspected."""

import argparse
import base64
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


FONT = Path(__file__).resolve().parents[1] / "assets" / "fonts" / "CalSansVF.woff2"
INK = {"light": "#171717", "dark": "#ededed"}
SURFACE = {"light": "#ffffff", "dark": "#0a0a0a"}
BROWSER_NAMES = (
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
    "chrome", "microsoft-edge", "msedge", "brave-browser",
)
BROWSER_PATHS = (
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
)
RENDERERS = ("browser", "rsvg-convert", "resvg", "inkscape", "magick", "qlmanage")


def find_browser():
    override = os.environ.get("PLOTTER_BROWSER")
    if override:
        return override
    for name in BROWSER_NAMES:
        found = shutil.which(name)
        if found:
            return found
    for path in BROWSER_PATHS:
        if Path(path).is_file():
            return path
    return None


def svg_size(source):
    opening = re.search(r"<svg\b[^>]*>", source)
    if not opening:
        raise SystemExit("No <svg> element found.")
    view_box = re.search(r'\bviewBox="([^"]+)"', opening.group(0))
    if view_box:
        values = [float(value) for value in re.split(r"[\s,]+", view_box.group(1).strip())]
        if len(values) == 4 and values[2] > 0 and values[3] > 0:
            return values[2], values[3]
    size = [re.search(rf'\b{name}="([\d.]+)', opening.group(0)) for name in ("width", "height")]
    if all(size):
        return float(size[0].group(1)), float(size[1].group(1))
    return 560.0, 440.0


def run(command, timeout=60):
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as error:
        return False, str(error)
    return result.returncode == 0, (result.stderr or result.stdout).strip()


def written(path):
    return path.is_file() and path.stat().st_size > 0


def browser_shot(browser, page, output, width, height, scale, workdir):
    base = [
        browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--no-first-run", "--no-default-browser-check",
        f"--force-device-scale-factor={scale}",
        f"--window-size={width},{height}",
        f"--user-data-dir={workdir / 'profile'}",
        f"--screenshot={output}",
    ]
    detail = ""
    # A container or agent sandbox can refuse the browser's own sandbox.
    for extra in ([], ["--no-sandbox"]):
        output.unlink(missing_ok=True)
        ok, detail = run([*base, *extra, page.as_uri()])
        if ok and written(output):
            return True, ""
    return False, detail


def themed_svg(source, theme, background):
    """A copy with resolved ink and surface, for renderers without a host page."""
    opening = re.search(r"<svg\b[^>]*>", source)
    tag = opening.group(0)
    color = f"color:{INK[theme]}"
    if re.search(r'\bstyle="[^"]*"', tag):
        # Appended so it wins over a color the drawing declares for itself.
        themed = re.sub(r'\bstyle="([^"]*)"', lambda m: f'style="{m.group(1)};{color}"', tag, count=1)
    else:
        themed = tag[:-1] + f' style="{color}">'
    surface = f'<rect width="100%" height="100%" fill="{background}" stroke="none"/>'
    return source.replace(tag, themed + surface, 1)


def render_svg(args, source, theme, output, workdir):
    native_width, native_height = svg_size(source)
    width = args.width or round(native_width)
    height = max(1, round(width * native_height / native_width))
    background = args.background or SURFACE[theme]
    order = [args.renderer] if args.renderer != "auto" else RENDERERS
    tried = []

    for renderer in order:
        if renderer == "browser":
            browser = find_browser()
            if not browser:
                tried.append("browser: no Chrome, Chromium, Edge, or Brave found")
                continue
            # Inlined, so the page needs no access to files outside its folder.
            font_file = args.font or (FONT if FONT.is_file() else None)
            font = ""
            if font_file:
                data = base64.b64encode(font_file.read_bytes()).decode("ascii")
                font = (
                    '@font-face{font-family:"Cal Sans";font-weight:400 700;'
                    f'src:url("data:font/{font_file.suffix.lstrip(".").lower()};base64,{data}")}}'
                )
            markup = re.sub(r"<\?xml[^>]*\?>|<!DOCTYPE[^>]*>", "", source)
            page = workdir / f"page-{theme}.html"
            page.write_text(
                "<!doctype html><meta charset='utf-8'><style>"
                f"{font}html,body{{margin:0;background:{background};color:{INK[theme]}}}"
                f"body>svg{{display:block;width:{width}px;height:{height}px;color:{INK[theme]} !important}}"
                f"</style>{markup}",
                encoding="utf-8",
            )
            ok, detail = browser_shot(browser, page, output, width, height, args.scale, workdir)
            if ok:
                return renderer, width, height
            tried.append(f"browser: {detail or 'no screenshot written'}")
            continue

        command = shutil.which(renderer)
        if not command:
            tried.append(f"{renderer}: not installed")
            continue
        copy = workdir / f"drawing-{theme}.svg"
        copy.write_text(themed_svg(source, theme, background), encoding="utf-8")
        pixels = str(round(width * args.scale))
        if renderer == "rsvg-convert":
            ok, detail = run([command, "-w", pixels, "-o", str(output), str(copy)])
        elif renderer == "resvg":
            ok, detail = run([command, "-w", pixels, str(copy), str(output)])
        elif renderer == "inkscape":
            ok, detail = run([command, str(copy), "--export-type=png", f"--export-width={pixels}", f"--export-filename={output}"])
        elif renderer == "magick":
            density = str(round(96 * args.scale * width / native_width))
            ok, detail = run([command, "-density", density, "-background", "none", str(copy), str(output)])
        else:
            # Quick Look writes a square thumbnail named after its input.
            ok, detail = run([command, "-t", "-s", pixels, "-o", str(workdir), str(copy)])
            thumbnail = workdir / f"{copy.name}.png"
            if ok and written(thumbnail):
                shutil.move(thumbnail, output)
                sips = shutil.which("sips")
                if sips and native_height < native_width:
                    # Trim the square thumbnail's empty band below the drawing.
                    rows = str(round(float(pixels) * native_height / native_width))
                    run([sips, "-c", rows, pixels, "--cropOffset", "0", "0", str(output)])
        if ok and written(output):
            return renderer, width, height
        tried.append(f"{renderer}: {detail or 'no image written'}")

    raise SystemExit(
        "Could not render. Tried:\n  " + "\n  ".join(tried)
        + "\nInstall a Chromium-based browser or rsvg-convert, or set PLOTTER_BROWSER"
        " to a browser executable. In an agent sandbox, run this command with the"
        " sandbox lifted. Until a render exists, report the visual review as pending."
    )


def render_html(args, output, workdir):
    browser = find_browser()
    if not browser:
        raise SystemExit("HTML needs a Chromium-based browser. Set PLOTTER_BROWSER to its executable.")
    width, height = args.width or 720, args.height or 620
    ok, detail = browser_shot(browser, args.input.resolve(), output, width, height, args.scale, workdir)
    if not ok:
        raise SystemExit(f"Could not render the page: {detail or 'no screenshot written'}")
    return "browser", width, height


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="An .svg drawing or an .html page.")
    parser.add_argument("output", type=Path, nargs="?", help="PNG path. Defaults to the input name with .png.")
    parser.add_argument("--width", type=int, help="CSS pixel width to render at. Defaults to the drawing's native width.")
    parser.add_argument("--height", type=int, help="CSS pixel height, for HTML pages only.")
    parser.add_argument("--theme", choices=("light", "dark", "both"), default="light")
    parser.add_argument("--background", help="Surface color. Defaults to the theme's.")
    parser.add_argument("--scale", type=float, default=2, help="Device pixels per CSS pixel.")
    parser.add_argument("--font", type=Path, help="A font file to render “Cal Sans” with. Defaults to the bundled Cal Sans.")
    parser.add_argument("--renderer", choices=("auto", *RENDERERS), default="auto")
    args = parser.parse_args()

    if not args.input.is_file():
        raise SystemExit(f"Not found: {args.input}")
    output = (args.output or args.input.with_suffix(".png")).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    is_html = args.input.suffix.lower() in (".html", ".htm")
    themes = ("light", "dark") if args.theme == "both" and not is_html else (args.theme,)

    # Work beside the output: an agent sandbox may not allow the system temp folder.
    with tempfile.TemporaryDirectory(prefix=".plotter-render-", dir=output.parent) as temporary:
        workdir = Path(temporary)
        for theme in themes:
            target = output
            if len(themes) > 1:
                target = output.with_name(f"{output.stem}-{theme}{output.suffix}")
            if is_html:
                renderer, width, height = render_html(args, target, workdir)
            else:
                source = args.input.read_text(encoding="utf-8")
                renderer, width, height = render_svg(args, source, theme, target, workdir)
            print(f"Wrote {target} ({width} × {height} CSS px, {theme}, {renderer})")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
