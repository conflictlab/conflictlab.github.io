#!/usr/bin/env python3
"""
Inspect and convert a sce_dictionary.pkl file to JSON for the website.

Usage:
  python scripts/inspect_scenarios.py --src /path/to/sce_dictionary.pkl \
    --out public/data/scenarios.json

Notes:
  - Unpickling may require compatible versions of numpy and pandas.
  - If you see ModuleNotFoundError for pandas/numpy, use Python 3.10 and:
      pip install "numpy==1.24.4" "pandas==1.5.3"
"""

from __future__ import annotations

import argparse
import json
import pickle
import sys
from typing import Any

try:
    import numpy as _np  # type: ignore
except Exception:
    _np = None

try:
    import pandas as _pd  # type: ignore
except Exception:
    _pd = None


def to_basic(x: Any) -> Any:
    """Convert numpy/pandas containers into plain Python structures."""
    try:
        if _np is not None and isinstance(x, _np.ndarray):
            return x.tolist()
    except Exception:
        pass
    try:
        if _pd is not None:
            if isinstance(x, (_pd.Series, _pd.Index)):
                return x.tolist()
            if isinstance(x, _pd.DataFrame):
                dct = x.to_dict(orient="list")
                # Ensure keys are strings and values are converted
                return {str(k): to_basic(v) for k, v in dct.items()}
    except Exception:
        pass
    if isinstance(x, dict):
        return {str(k): to_basic(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [to_basic(v) for v in x]
    return x


def summarize(data: Any) -> None:
    print("Root:", type(data).__name__,
          ("entries:" if isinstance(data, dict) else ""),
          (len(data) if isinstance(data, dict) else "n/a"))
    if isinstance(data, dict):
        keys = list(data.keys())
        print("Sample keys:", keys[:10])
        if keys:
            k0 = keys[0]
            v0 = data[k0]
            print("First key:", k0, "->", type(v0).__name__)
            if isinstance(v0, (list, tuple)):
                head = v0[:6] if v0 and isinstance(v0[0], (int, float)) else v0[:3]
                print("Series len:", len(v0), "head:", head)
            if isinstance(v0, dict):
                print("Nested keys:", list(v0.keys())[:10])


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--src", required=True, help="Path to sce_dictionary.pkl")
    p.add_argument("--out", required=True, help="Output JSON path")
    p.add_argument("--no-summary", action="store_true", help="Do not print summary")
    args = p.parse_args()

    try:
        with open(args.src, "rb") as f:
            obj = pickle.load(f)
    except ModuleNotFoundError as e:
        mod = getattr(e, "name", "a required module")
        print(
            f"Missing dependency while unpickling: {mod}.\n"
            "Install compatible versions, e.g. with Python 3.10:\n"
            "  pip install \"numpy==1.24.4\" \"pandas==1.5.3\"",
            file=sys.stderr,
        )
        return 2
    except Exception as e:
        print(f"Failed to load pickle: {e}", file=sys.stderr)
        return 1

    data = to_basic(obj)
    try:
        with open(args.out, "w") as out:
            json.dump(data, out, default=str)
    except Exception as e:
        print(f"Failed to write JSON: {e}", file=sys.stderr)
        return 1

    if not args.no_summary:
        summarize(data)
        print(f"Wrote {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
