#!/usr/bin/env python3
"""estimates.py - a calibration log for estimates of agent runs and human work.

It uses only the Python standard library.

Usage:
    python3 estimates.py start --id ID --kind agent|human|quote --type TYPE
        --low N --expected N --high N --unit rounds|minutes|hours [--note TEXT]
    python3 estimates.py finish --id ID [--rounds N]
    python3 estimates.py actual --id ID --value N --unit hours|minutes
    python3 estimates.py report [--kind K] [--type T]

Log file: docs/agents/estimates.tsv in the current git repo when that file or
docs/agents/ exists; otherwise $XDG_DATA_HOME/agent-estimates/estimates.tsv
(default ~/.local/share/agent-estimates/estimates.tsv). --log PATH overrides.
Every command prints the file it used. Timestamps come from the clock.
"""

import argparse
import csv
import os
import statistics
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

FIELDS = [
    "id", "kind", "type", "unit", "low", "expected", "high",
    "started", "finished", "rounds", "minutes", "actual", "note",
]
KINDS = ("agent", "human", "quote")
UNITS = ("rounds", "minutes", "hours")
MIN_N = 5       # no ratio below this many measured rows
CAP = 0.20      # one correction moves a multiplier at most this much
PRED_LEVEL = 0.25
TO_MINUTES = {"minutes": 1.0, "hours": 60.0}


def git_root(cwd):
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=cwd, capture_output=True, text=True, check=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return None
    return Path(out.stdout.strip())


def resolve_log(explicit=None, root=None, env=None):
    """Pick the log file: --log, then the repo's docs/agents, then the user data dir."""
    if explicit:
        return Path(explicit)
    env = os.environ if env is None else env
    if root is not None:
        agents = Path(root) / "docs" / "agents"
        if (agents / "estimates.tsv").exists() or agents.is_dir():
            return agents / "estimates.tsv"
    data = env.get("XDG_DATA_HOME") or str(Path(env.get("HOME", "~")).expanduser() / ".local" / "share")
    return Path(data) / "agent-estimates" / "estimates.tsv"


def read_rows(path):
    if not path.exists():
        return []
    with path.open(newline="") as f:
        return list(csv.DictReader(f, delimiter="\t"))


def write_rows(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as f:
        w = csv.DictWriter(f, FIELDS, delimiter="\t", lineterminator="\n")
        w.writeheader()
        w.writerows(rows)


def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def find(rows, id_):
    for r in rows:
        if r["id"] == id_:
            return r
    sys.exit(f"error: no row with id {id_!r}")


def fmt(x):
    return f"{x:.4g}"


def pred(ratios, level=PRED_LEVEL):
    """Share of rows whose estimate is within `level` of the actual (PRED(25))."""
    # error relative to the actual: |actual - expected| / actual <= level, with ratio = actual / expected
    hit = sum(1 for r in ratios if abs(r - 1) / r <= level)
    return hit / len(ratios)


def suggest(ratios):
    """Multiplier for the next expected value, moved at most CAP from 1.0."""
    return 1 + max(-CAP, min(CAP, statistics.median(ratios) - 1))


def measured(rows):
    return [r for r in rows if r["actual"] != "" and float(r["expected"]) > 0]


def cmd_start(a, rows, path):
    if any(r["id"] == a.id for r in rows):
        sys.exit(f"error: id {a.id!r} already exists")
    if not 0 <= a.low <= a.expected <= a.high:
        sys.exit("error: need 0 <= low <= expected <= high")
    if a.kind != "agent" and a.unit == "rounds":
        sys.exit("error: rounds is only for agent estimates")
    row = dict.fromkeys(FIELDS, "")
    row.update(
        id=a.id, kind=a.kind, type=a.type, unit=a.unit, low=fmt(a.low),
        expected=fmt(a.expected), high=fmt(a.high), started=now(),
        note=" ".join((a.note or "").split()),
    )
    rows.append(row)
    write_rows(path, rows)
    print(f"started {a.id}")


def cmd_finish(a, rows, path):
    r = find(rows, a.id)
    r["finished"] = now()
    r["minutes"] = fmt((datetime.fromisoformat(r["finished"]) - datetime.fromisoformat(r["started"])).total_seconds() / 60)
    if a.rounds is not None:
        r["rounds"] = fmt(a.rounds)
    if r["unit"] == "rounds":
        r["actual"] = r["rounds"]  # stays empty (unmeasured) until --rounds is given
    else:
        r["actual"] = fmt(float(r["minutes"]) / TO_MINUTES[r["unit"]])
    write_rows(path, rows)
    print(f"finished {a.id}: {r['minutes']} min, actual {r['actual'] or 'unmeasured'} {r['unit']}")


def cmd_actual(a, rows, path):
    r = find(rows, a.id)
    if r["unit"] == "rounds":
        sys.exit("error: a rounds estimate takes its actual from `finish --rounds`")
    r["actual"] = fmt(a.value * TO_MINUTES[a.unit] / TO_MINUTES[r["unit"]])
    write_rows(path, rows)
    print(f"actual {a.id}: {r['actual']} {r['unit']}")


def cmd_report(a, rows, path):
    groups = {}
    for r in measured(rows):
        if (a.kind in (None, r["kind"])) and (a.type in (None, r["type"])):
            groups.setdefault((r["kind"], r["type"]), []).append(r)
    if not groups:
        print("no measured rows")
    for (kind, type_), rs in sorted(groups.items()):
        n = len(rs)
        head = f"{kind}/{type_} (n={n}, unit {rs[0]['unit']})"
        if n < MIN_N:
            print(f"{head}: insufficient data (n<{MIN_N})")
        else:
            ratios = [float(r["actual"]) / float(r["expected"]) for r in rs if float(r["actual"]) > 0]
            inside = sum(float(r["low"]) <= float(r["actual"]) <= float(r["high"]) for r in rs) / n
            print(
                f"{head}: PRED(25)={pred(ratios):.0%}, median actual/expected={statistics.median(ratios):.2f}, "
                f"inside low-high={inside:.0%}, suggested multiplier x{suggest(ratios):.2f} (capped at +/-{CAP:.0%})"
            )
        if kind == "agent":
            per_round = [float(r["minutes"]) / float(r["rounds"]) for r in rs if r["rounds"] and float(r["rounds"]) > 0 and r["minutes"]]
            if len(per_round) < MIN_N:
                print(f"  minutes per round: insufficient data (n<{MIN_N}, have {len(per_round)})")
            else:
                print(f"  minutes per round: median {statistics.median(per_round):.2f} (n={len(per_round)})")
    open_ = [r["id"] for r in rows if r["actual"] == ""]
    if open_:
        print(f"open rows without an actual: {', '.join(open_)}")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--log", help="log file path; overrides the default location")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("start")
    s.add_argument("--id", required=True)
    s.add_argument("--kind", required=True, choices=KINDS)
    s.add_argument("--type", required=True)
    for k in ("low", "expected", "high"):
        s.add_argument(f"--{k}", required=True, type=float)
    s.add_argument("--unit", required=True, choices=UNITS)
    s.add_argument("--note")

    s = sub.add_parser("finish")
    s.add_argument("--id", required=True)
    s.add_argument("--rounds", type=float)

    s = sub.add_parser("actual")
    s.add_argument("--id", required=True)
    s.add_argument("--value", required=True, type=float)
    s.add_argument("--unit", required=True, choices=tuple(TO_MINUTES))

    s = sub.add_parser("report")
    s.add_argument("--kind", choices=KINDS)
    s.add_argument("--type")

    a = p.parse_args(argv)
    path = resolve_log(a.log, git_root(Path.cwd()))
    print(f"log: {path}")
    rows = read_rows(path)
    {"start": cmd_start, "finish": cmd_finish, "actual": cmd_actual, "report": cmd_report}[a.cmd](a, rows, path)


if __name__ == "__main__":
    main()
