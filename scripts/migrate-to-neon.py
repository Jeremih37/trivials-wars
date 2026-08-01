#!/usr/bin/env python3
"""
Migrate hardcoded warm-palette hex colors to neon palette across all TSX/TS files.
Preserves Tailwind alpha modifiers (e.g. bg-[#F2ECDD]/70 → bg-[#131838]/70).
"""
import re
import os
import sys

# Mapping: warm palette hex → neon palette hex (case-insensitive)
COLOR_MAP = {
    # Whites / creams (too bright)
    "#FAF7F1": "#0A0E27",  # cream white → deep void
    "#F2ECDD": "#131838",  # cream → void-700
    "#F2EDE3": "#131838",
    "#EFE7D4": "#0A0E27",  # sand bg → deep void
    "#E8E0CC": "#131838",  # soft sand → void-700
    "#E5DCC5": "#1A1F4A",  # mid sand → void-600
    "#D9CFB8": "#1A1F4A",  # dark sand → void-600
    "#BFB39A": "#252B5C",  # darker sand → void-500
    "#F0E0C0": "#1A1F4A",  # warm light → void-600
    "#F0D4D8": "#2A1A2E",  # pink light → dark purple
    "#F8F0DE": "#131838",
    "#FCF6E8": "#131838",
    "#FFF8E6": "#0A0E27",
    "#FFFCF7": "#0A0E27",

    # Dusty blue family → neon cyan/blue
    "#6E82A0": "#00E5FF",   # primary dusty → neon cyan
    "#5C6E8A": "#00E5FF",   # dusty 500 → neon cyan
    "#4C5C75": "#1E90FF",   # deep blue → electric blue
    "#3D4A60": "#C8D0F0",   # ink soft → soft text
    "#A4B3C8": "#00E5FF",   # light blue → neon cyan
    "#D6DEEA": "#80F4FF",   # sky light → light cyan
    "#8E9DB4": "#4A5BA8",   # dusty 300 → mid blue
    "#BFCBDB": "#4A5BA8",   # dusty 100 → mid blue
    "#DDE3EC": "#4A5BA8",

    # Sage family → neon green/teal
    "#8AA088": "#39FF14",   # sage → neon green
    "#718C6F": "#39FF14",   # sage accent → neon green
    "#B0BFAE": "#00FFB3",   # light sage → neon teal
    "#97A894": "#39FF14",
    "#4D6450": "#00B377",
    "#DEE5DC": "#1A2E1F",
    "#5F7560": "#00B377",

    # Amber/gold family → neon gold
    "#D9A85E": "#FFEA00",
    "#C99A50": "#FFEA00",
    "#6B4D1C": "#FFEA00",
    "#7A5641": "#FFB300",
    "#C9A082": "#FF6EC7",
    "#A87859": "#FF6EC7",

    # Rose/coral family → neon magenta/coral
    "#C98492": "#FF3366",
    "#B57482": "#FF2D95",
    "#6F3A45": "#FF2D95",

    # Violet family → neon purple
    "#8A8AB5": "#B026FF",
    "#9D9DC4": "#B026FF",

    # Slate ink (text) → bright text
    "#2A3340": "#F0F4FF",   # main text → bright
    "#4E5A6C": "#8090C0",   # secondary text → muted
    "#7A8492": "#8090C0",   # tertiary text → muted

    # Amber/gold legacy (Tailwind-like hex)
    "#E8D4A8": "#1A1F4A",   # warm amber bg → void-600
    "#8A6428": "#FFEA00",   # dark amber text → neon gold
    "#92400E": "#FFEA00",
    "#92400e": "#FFEA00",
    "#F59E0B": "#FFEA00",
    "#f59e0b": "#FFEA00",
    "#FBBF24": "#FFEA00",
    "#fbbf24": "#FFEA00",
    "#B8862E": "#C77D00",
    "#b8862e": "#C77D00",
    "#3D2914": "#0A0E27",
    "#3d2914": "#0A0E27",
    "#806B00": "#806B00",   # already neon amber dark

    # Warm rose family → neon magenta/coral
    "#C98896": "#FF3366",
    "#8B4A56": "#FF2D95",
    "#8b4a56": "#FF2D95",

    # Sky blue (Tailwind-like)
    "#0EA5E9": "#00E5FF",
    "#0ea5e9": "#00E5FF",
}

# Build case-insensitive regex
# Match: #XXXXXX (with optional alpha /NN suffix preserved)
HEX_RE = re.compile(r"(#)([0-9A-Fa-f]{6})((/\d+)?)")


def replace_color(match):
    hex_val = match.group(2).upper()
    alpha = match.group(3) or ""
    # Keys in COLOR_MAP include the leading '#'
    key = "#" + hex_val
    if key in COLOR_MAP:
        new_hex = COLOR_MAP[key].lstrip("#").upper()
        return f"#{new_hex}{alpha}"
    # Try case-insensitive lookup
    for k, v in COLOR_MAP.items():
        if k.upper() == key:
            new_hex = v.lstrip("#").upper()
            return f"#{new_hex}{alpha}"
    return match.group(0)


def migrate_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            original = f.read()
    except Exception as e:
        print(f"  ! Error reading {path}: {e}", file=sys.stderr)
        return 0
    new_content, n = HEX_RE.subn(replace_color, original)
    if n > 0 and new_content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  ✓ {path}: {n} replacement(s)")
        return n
    return 0


def main():
    base = "/home/z/my-project/src"
    extensions = (".tsx", ".ts")
    total = 0
    files_changed = 0
    for root, dirs, files in os.walk(base):
        # Skip node_modules
        if "node_modules" in root:
            continue
        for fname in files:
            if not fname.endswith(extensions):
                continue
            fpath = os.path.join(root, fname)
            n = migrate_file(fpath)
            if n > 0:
                total += n
                files_changed += 1
    print(f"\nDone. {total} replacements across {files_changed} files.")


if __name__ == "__main__":
    main()
