#!/usr/bin/env python3
"""Tests for estimates.py. Run: python3 -m unittest test_estimates (from this folder)."""

import contextlib
import io
import tempfile
import unittest
from pathlib import Path

import estimates


def run(*argv):
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        estimates.main(list(argv))
    return out.getvalue()


def seed(log, actuals, expected=10):
    """Write one measured human/feature row per actual."""
    for i, actual in enumerate(actuals):
        run("--log", log, "start", "--id", f"r{i}", "--kind", "human", "--type", "feature",
            "--low", "5", "--expected", str(expected), "--high", "20", "--unit", "hours")
        run("--log", log, "actual", "--id", f"r{i}", "--value", str(actual), "--unit", "hours")


class EstimatesTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)
        self.log = str(Path(self.dir.name) / "e.tsv")

    def test_pred25_counts_rows_within_25_percent_of_actual(self):
        # actual 10 (hit), 12 (hit: 2/12), 8 (hit: 2/8 = 25%), 20 (miss), 4 (miss), 10 (hit)
        self.assertEqual(estimates.pred([1.0, 1.2, 0.8, 2.0, 0.4, 1.0]), 4 / 6)

    def test_report_on_empty_log_does_not_crash(self):
        self.assertIn("no measured rows", run("--log", self.log, "report"))

    def test_gate_hides_ratio_below_five_rows(self):
        seed(self.log, [10, 12, 14, 9])
        out = run("--log", self.log, "report")
        self.assertIn("insufficient data (n<5)", out)
        self.assertNotIn("PRED(25)", out)

    def test_report_with_six_rows_caps_the_suggestion(self):
        seed(self.log, [20, 18, 25, 15, 30, 22])  # median ratio 2.1, far past the cap
        out = run("--log", self.log, "report")
        self.assertIn("PRED(25)=0%", out)
        self.assertIn("x1.20", out)

    def test_cap_applies_downward_too(self):
        self.assertAlmostEqual(estimates.suggest([0.2, 0.3, 0.4]), 0.8)
        self.assertAlmostEqual(estimates.suggest([1.05, 1.1, 1.0]), 1.05)

    def test_agent_finish_records_clock_minutes_and_rate(self):
        for i in range(5):
            run("--log", self.log, "start", "--id", f"a{i}", "--kind", "agent", "--type", "script",
                "--low", "2", "--expected", "4", "--high", "8", "--unit", "rounds")
            run("--log", self.log, "finish", "--id", f"a{i}", "--rounds", "4")
        out = run("--log", self.log, "report")
        self.assertIn("minutes per round: median", out)

    def test_log_location(self):
        env = {"HOME": "/home/u"}
        self.assertEqual(estimates.resolve_log("x.tsv", "/repo", env), Path("x.tsv"))
        self.assertEqual(estimates.resolve_log(None, None, env),
                         Path("/home/u/.local/share/agent-estimates/estimates.tsv"))
        self.assertEqual(estimates.resolve_log(None, None, {"XDG_DATA_HOME": "/xdg"}),
                         Path("/xdg/agent-estimates/estimates.tsv"))
        with tempfile.TemporaryDirectory() as repo:
            self.assertEqual(estimates.resolve_log(None, repo, env),
                             Path("/home/u/.local/share/agent-estimates/estimates.tsv"))
            (Path(repo) / "docs" / "agents").mkdir(parents=True)
            self.assertEqual(estimates.resolve_log(None, repo, env),
                             Path(repo) / "docs" / "agents" / "estimates.tsv")


if __name__ == "__main__":
    unittest.main()
