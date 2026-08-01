#!/usr/bin/env python3
"""
Migrate Tailwind warm-color utility classes to neon palette arbitrary values.
Operates on .tsx and .ts files in /home/z/my-project/src.
"""
import os
import re
import sys

# Direct substring replacements (Tailwind class → arbitrary value with neon hex)
REPLACEMENTS = [
    # amber family → neon gold #FFEA00
    ("bg-amber-50/70",   "bg-[#FFEA00]/10"),
    ("bg-amber-50",      "bg-[#FFEA00]/10"),
    ("bg-amber-100/80",  "bg-[#FFEA00]/15"),
    ("bg-amber-100",     "bg-[#FFEA00]/15"),
    ("bg-amber-300/40",  "bg-[#FFEA00]/30"),
    ("bg-amber-300/30",  "bg-[#FFEA00]/25"),
    ("bg-amber-300",     "bg-[#FFEA00]/40"),
    ("bg-amber-400/20",  "bg-[#FFEA00]/20"),
    ("bg-amber-400/30",  "bg-[#FFEA00]/30"),
    ("bg-amber-400/40",  "bg-[#FFEA00]/40"),
    ("bg-amber-400",     "bg-[#FFEA00]"),
    ("bg-amber-500",     "bg-[#FFEA00]"),
    ("bg-amber-600/20",  "bg-[#FFEA00]/20"),
    ("bg-amber-600/40",  "bg-[#FFEA00]/30"),
    ("bg-amber-600",     "bg-[#FFEA00]"),
    ("bg-amber-700",     "bg-[#C77D00]"),
    ("text-amber-100",   "text-[#FFEA00]"),
    ("text-amber-200",   "text-[#FFEA00]"),
    ("text-amber-300",   "text-[#FFEA00]"),
    ("text-amber-400",   "text-[#FFEA00]"),
    ("text-amber-500",   "text-[#FFEA00]"),
    ("text-amber-600",   "text-[#FFEA00]"),
    ("text-amber-700",   "text-[#C77D00]"),
    ("text-amber-900",   "text-[#0A0E27]"),
    ("border-amber-300", "border-[#FFEA00]/60"),
    ("border-amber-400", "border-[#FFEA00]/60"),
    ("border-amber-500", "border-[#FFEA00]/60"),
    ("border-amber-600", "border-[#FFEA00]/60"),
    ("from-amber-500",   "from-[#FFEA00]"),
    ("to-amber-500",     "to-[#FFEA00]"),
    ("via-amber-400",    "via-[#FFEA00]"),
    ("via-amber-500",    "via-[#FFEA00]"),

    # yellow family → neon gold
    ("bg-yellow-400",    "bg-[#FFEA00]"),
    ("bg-yellow-500",    "bg-[#FFEA00]"),
    ("text-yellow-400",  "text-[#FFEA00]"),
    ("text-yellow-500",  "text-[#FFEA00]"),
    ("border-yellow-400","border-[#FFEA00]/60"),
    ("via-yellow-400",   "via-[#FFEA00]"),
    ("via-yellow-500",   "via-[#FFEA00]"),

    # orange family → neon amber #FFB300
    ("bg-orange-300",    "bg-[#FFB300]/40"),
    ("bg-orange-400/15", "bg-[#FFB300]/15"),
    ("bg-orange-400/20", "bg-[#FFB300]/20"),
    ("bg-orange-400/30", "bg-[#FFB300]/30"),
    ("bg-orange-400",    "bg-[#FFB300]"),
    ("bg-orange-500",    "bg-[#FFB300]"),
    ("bg-orange-600",    "bg-[#C77D00]"),
    ("text-orange-300",  "text-[#FFB300]"),
    ("text-orange-400",  "text-[#FFB300]"),
    ("text-orange-500",  "text-[#FFB300]"),
    ("text-orange-600",  "text-[#C77D00]"),
    ("border-orange-400/40", "border-[#FFB300]/40"),
    ("border-orange-400",    "border-[#FFB300]/60"),
    ("border-orange-500",    "border-[#FFB300]/60"),
    ("border-orange-600",    "border-[#FFB300]/60"),

    # rose family → neon magenta/coral
    ("bg-rose-50/70",    "bg-[#FF3366]/10"),
    ("bg-rose-50",       "bg-[#FF3366]/10"),
    ("bg-rose-100",      "bg-[#FF3366]/15"),
    ("bg-rose-400/30",   "bg-[#FF3366]/30"),
    ("bg-rose-400",      "bg-[#FF3366]"),
    ("bg-rose-500",      "bg-[#FF3366]"),
    ("bg-rose-900",      "bg-[#5C0A1F]"),
    ("text-rose-400",    "text-[#FF3366]"),
    ("text-rose-500",    "text-[#FF3366]"),
    ("text-rose-600",    "text-[#FF3366]"),
    ("text-rose-700",    "text-[#FF2D95]"),
    ("text-rose-900",    "text-[#0A0E27]"),
    ("border-rose-400",  "border-[#FF3366]/60"),
    ("border-rose-500",  "border-[#FF3366]/60"),
    ("border-rose-600",  "border-[#FF3366]/60"),

    # pink family → neon magenta
    ("bg-pink-400",      "bg-[#FF2D95]"),
    ("bg-pink-500",      "bg-[#FF2D95]"),
    ("bg-pink-600",      "bg-[#C70060]"),
    ("text-pink-400",    "text-[#FF2D95]"),
    ("text-pink-500",    "text-[#FF2D95]"),
    ("text-pink-600",    "text-[#FF2D95]"),
    ("border-pink-400",  "border-[#FF2D95]/60"),
    ("border-pink-500",  "border-[#FF2D95]/60"),

    # red family → neon coral
    ("bg-red-400",       "bg-[#FF3366]"),
    ("bg-red-500",       "bg-[#FF3366]"),
    ("bg-red-600",       "bg-[#C70060]"),
    ("text-red-400",     "text-[#FF3366]"),
    ("text-red-500",     "text-[#FF3366]"),
    ("text-red-600",     "text-[#FF3366]"),
    ("border-red-400",   "border-[#FF3366]/60"),
    ("border-red-500",   "border-[#FF3366]/60"),
    ("border-red-600",   "border-[#FF3366]/60"),

    # purple/violet family → neon purple #B026FF
    ("bg-purple-400",    "bg-[#B026FF]"),
    ("bg-purple-500",    "bg-[#B026FF]"),
    ("bg-purple-600",    "bg-[#7A1AB3]"),
    ("text-purple-400",  "text-[#B026FF]"),
    ("text-purple-500",  "text-[#B026FF]"),
    ("text-purple-600",  "text-[#B026FF]"),
    ("border-purple-400","border-[#B026FF]/60"),
    ("border-purple-500","border-[#B026FF]/60"),
    ("border-purple-600","border-[#B026FF]/60"),

    ("bg-violet-400",    "bg-[#B026FF]"),
    ("bg-violet-500",    "bg-[#B026FF]"),
    ("text-violet-400",  "text-[#B026FF]"),
    ("text-violet-500",  "text-[#B026FF]"),
    ("border-violet-400","border-[#B026FF]/60"),
    ("border-violet-500","border-[#B026FF]/60"),

    # green family → neon green #39FF14
    ("bg-green-400",     "bg-[#39FF14]"),
    ("bg-green-500",     "bg-[#39FF14]"),
    ("text-green-400",   "text-[#39FF14]"),
    ("text-green-500",   "text-[#39FF14]"),
    ("border-green-400", "border-[#39FF14]/60"),
    ("border-green-500", "border-[#39FF14]/60"),

    # emerald family → neon green
    ("bg-emerald-400",   "bg-[#39FF14]"),
    ("bg-emerald-500",   "bg-[#39FF14]"),
    ("text-emerald-400", "text-[#39FF14]"),
    ("text-emerald-500", "text-[#39FF14]"),
    ("border-emerald-400","border-[#39FF14]/60"),

    # sky family → neon cyan
    ("bg-sky-400",       "bg-[#00E5FF]"),
    ("bg-sky-500",       "bg-[#00E5FF]"),
    ("text-sky-400",     "text-[#00E5FF]"),
    ("text-sky-500",     "text-[#00E5FF]"),
    ("border-sky-400",   "border-[#00E5FF]/60"),
    ("border-sky-500",   "border-[#00E5FF]/60"),

    # cyan family → neon cyan
    ("bg-cyan-400",      "bg-[#00E5FF]"),
    ("bg-cyan-500",      "bg-[#00E5FF]"),
    ("text-cyan-400",    "text-[#00E5FF]"),
    ("text-cyan-500",    "text-[#00E5FF]"),
    ("border-cyan-400",  "border-[#00E5FF]/60"),
    ("border-cyan-500",  "border-[#00E5FF]/60"),
]


def migrate_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            original = f.read()
    except Exception as e:
        print(f"  ! Error reading {path}: {e}", file=sys.stderr)
        return 0
    new_content = original
    count = 0
    for old, new in REPLACEMENTS:
        # Use word-boundary-ish replacement to avoid touching class names with similar prefixes
        # but since these are Tailwind classes inside string literals, simple replace is fine
        n = new_content.count(old)
        if n > 0:
            new_content = new_content.replace(old, new)
            count += n
    if count > 0 and new_content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  ✓ {path}: {count} replacement(s)")
        return count
    return 0


def main():
    base = "/home/z/my-project/src"
    extensions = (".tsx", ".ts")
    total = 0
    files_changed = 0
    for root, dirs, files in os.walk(base):
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
