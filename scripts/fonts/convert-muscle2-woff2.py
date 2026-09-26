#!/usr/bin/env python3
"""Regenerate the muscle2 WOFF2 files in src/styles/ from the original WOFF files.

muscle2 is a custom static serif (400, 600, 700, 400 italic, 700 italic) with no variable
version, so it stays static. This script changes only the container format: every table is
decoded from the WOFF (zlib) file and re-encoded as WOFF2 (Brotli). Glyph outlines, metrics,
kerning and cmap coverage are unchanged, so the text renders the same.

Source: the WOFF files committed at SOURCE_COMMIT, read with `git show` so the script can be
rerun after the WOFF files were removed from the working tree.

Usage (from any directory):
  python3 -m pip install 'fonttools[woff]==4.60.2' 'brotli==1.2.0'
  python3 scripts/fonts/convert-muscle2-woff2.py

The committed output was made with fontTools 4.60.2 and brotli 1.2.0. The same versions
produce the same bytes.
"""

import io
import subprocess
from pathlib import Path

from fontTools.ttLib import TTFont

REPO = Path(__file__).resolve().parents[2]
OUT_DIR = REPO / "src" / "styles"
# Last commit that still holds the WOFF originals in src/styles/.
SOURCE_COMMIT = "2bb67a0"

# Source WOFF name -> output WOFF2 name. Names only change extension.
FILES = [
    "muscle2-reg-latin",
    "muscle2-reg",
    "muscle2-sem",
    "muscle2-bol_latin",
    "muscle2-bol",
    "muscle2-ita-latin",
    "muscle2-ita",
    "muscle2-bol-ita-latin",
    "muscle2-bol-ita",
]

for stem in FILES:
    source = subprocess.run(
        ["git", "-C", str(REPO), "show", f"{SOURCE_COMMIT}:src/styles/{stem}.woff"],
        check=True,
        capture_output=True,
    ).stdout
    # Keep head.modified from the source so reruns produce identical bytes.
    font = TTFont(io.BytesIO(source), recalcTimestamp=False)
    font.flavor = "woff2"
    target = OUT_DIR / f"{stem}.woff2"
    font.save(target)
    print(f"{stem}: {len(source) / 1024:.1f} KB woff -> {target.stat().st_size / 1024:.1f} KB woff2")
