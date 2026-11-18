#!/usr/bin/env python3
"""Check a Plotter SVG against the rules a render cannot be trusted to show."""

import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


SHAPES = {"path", "line", "circle", "rect", "ellipse", "polyline", "polygon"}
STANDARD = json.loads((Path(__file__).resolve().parents[1] / "assets" / "foundation" / "standard.json").read_text())
# Every catalogue label sits between these: about 0.72 for names, 0.5 for values and notes.
INK_MIN, INK_MAX = 0.45, 0.8
INHERITED = (
    "stroke", "stroke-width", "font-weight", "font-size", "font-style",
    "letter-spacing", "text-transform", "fill-opacity",
)
# The tenth percentile of the bundled catalogue: fewer marks than this is sparse.
SPARSE_SHAPES, SPARSE_LABELS = 10, 3


def local(tag):
    return tag.rsplit("}", 1)[-1] if isinstance(tag, str) else ""


def own_styles(node):
    styles = {name: node.get(name) for name in (*INHERITED, "vector-effect", "transform", "opacity") if node.get(name) is not None}
    for declaration in (node.get("style") or "").split(";"):
        name, separator, value = declaration.partition(":")
        if separator:
            styles[name.strip()] = value.strip()
    return styles


def number(value):
    match = re.match(r"\s*(-?[\d.]+)", value or "")
    return float(match.group(1)) if match else None


def check(source, compact=False):
    errors, warnings = [], []
    try:
        root = ET.fromstring(source)
    except ET.ParseError as error:
        return [f"Not well-formed SVG: {error}"], []

    view_box = (root.get("viewBox") or "").replace(",", " ").split()
    if not compact and view_box[2:] != ["560", "440"]:
        errors.append(
            f"Canvas is viewBox {' '.join(view_box) or 'missing'}; draw at 0 0 560 440. "
            "For a small placement, derive a compact version and check it with --compact."
        )

    counts = {"shapes": 0, "labels": 0, "stroked": 0, "non_scaling": 0}

    def walk(node, inherited, in_defs, opacity=1.0, turn=0.0):
        name = local(node.tag)
        styles = own_styles(node)
        current = {**inherited, **{key: value for key, value in styles.items() if key in INHERITED}}
        in_defs = in_defs or name == "defs"
        role = STANDARD["roles"].get(node.get("data-plotter-role") or "")
        if "opacity" in styles:
            opacity *= number(styles["opacity"]) or 1.0
        elif role:
            opacity *= STANDARD["tokens"][role["opacity"]]
        turn += sum(float(angle) for angle in re.findall(r"rotate\(\s*(-?[\d.]+)", styles.get("transform", "")))

        if name in ("linearGradient", "radialGradient", "filter"):
            errors.append(f"<{name}> found: no gradients, shadows, or lighting.")
        if re.search(r"skew|matrix|rotate3d|perspective", styles.get("transform", "")):
            errors.append(f"<{name}> uses transform “{styles['transform']}”: no skew or perspective.")

        if name == "text":
            label = " ".join("".join(node.itertext()).split())
            shown = f"“{label[:40]}”"
            if not in_defs:
                counts["labels"] += 1
            if current.get("stroke", "none") != "none":
                errors.append(f"Text {shown} is stroked, which makes it look bold. Set stroke=\"none\" on the text or its group.")
            weight = current.get("font-weight", "400")
            if weight not in ("400", "normal"):
                errors.append(f"Text {shown} has font-weight {weight}; every label is weight 400.")
            size = number(current.get("font-size"))
            if not compact and (size is None or size < 10 or size > 12):
                errors.append(f"Text {shown} has font-size {current.get('font-size', 'unset')}; labels are 10 to 12 units.")
            ink = opacity * (number(current.get("fill-opacity")) if current.get("fill-opacity") else 1.0)
            if not compact and not INK_MIN <= ink <= INK_MAX:
                errors.append(
                    f"Text {shown} is at {ink:.2f} ink; labels are never full ink. "
                    "Use opacity 0.72 for names and 0.5 for values and notes."
                )
            if 90 < turn % 360 < 270:
                errors.append(f"Text {shown} is rotated {turn:g}° and reads upside down; turn it to read from the bottom or the right.")
            if current.get("font-style", "normal") != "normal":
                errors.append(f"Text {shown} is {current['font-style']}; no italic.")
            if current.get("letter-spacing", "normal") not in ("normal", "0", "0px"):
                errors.append(f"Text {shown} has letter-spacing; none is added.")
            if current.get("text-transform", "none") != "none" or (re.search(r"[A-Z]{4,}", label) and label.upper() == label):
                errors.append(f"Text {shown} is all caps; labels are never all caps.")
            if compact:
                warnings.append(f"Compact version still contains text {shown}; remove text that cannot be read at the target size.")

        if name in SHAPES and not in_defs:
            counts["shapes"] += 1
            if current.get("stroke", "none") != "none":
                counts["stroked"] += 1
                counts["non_scaling"] += styles.get("vector-effect") == "non-scaling-stroke"
                width = current.get("stroke-width", "1")
                if "var(" not in width and number(width) not in (1.0, None):
                    errors.append(f"<{name}> has stroke-width {width}; every stroke is 1 unit, and emphasis comes from opacity.")

        for child in node:
            walk(child, current, in_defs, opacity, turn)

    walk(root, {}, False)

    if compact and counts["stroked"] and counts["non_scaling"] < counts["stroked"]:
        errors.append(
            f"{counts['stroked'] - counts['non_scaling']} stroked elements lack vector-effect=\"non-scaling-stroke\"; "
            "a compact version keeps every stroke one pixel wide."
        )
    if not compact and (counts["shapes"] < SPARSE_SHAPES or counts["labels"] < SPARSE_LABELS):
        warnings.append(
            f"Sparse: {counts['shapes']} shapes and {counts['labels']} labels, fewer than nine in ten catalogue drawings. "
            "Show how the form is built: axes, generating circles, radius leaders, tangent points, a unit, and part names."
        )
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, nargs="+")
    parser.add_argument("--compact", action="store_true", help="Check a compact version: any canvas, non-scaling strokes, no text.")
    args = parser.parse_args()
    failed = False
    for path in args.input:
        errors, warnings = check(path.read_text(encoding="utf-8"), args.compact)
        seen = set()
        for kind, messages in (("error", errors), ("warning", warnings)):
            for message in messages:
                if message not in seen:
                    seen.add(message)
                    print(f"{path}: {kind}: {message}")
        if errors:
            failed = True
        elif not warnings:
            print(f"{path}: ok")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
