#!/usr/bin/env python3
"""
Migración V5: blanco → arena cálida
Cambia las superficies blancas por tonos arena cálida para reducir fatiga visual.
"""
import re
from pathlib import Path

REPLACEMENTS = [
    # White surfaces → warm sand surfaces
    (r'\bbg-white/95\b', 'bg-[#F2ECDD]/95'),
    (r'\bbg-white/90\b', 'bg-[#F2ECDD]/90'),
    (r'\bbg-white/80\b', 'bg-[#F2ECDD]/80'),
    (r'\bbg-white/70\b', 'bg-[#F2ECDD]/70'),
    (r'\bbg-white/60\b', 'bg-[#F2ECDD]/60'),
    (r'\bbg-white/50\b', 'bg-[#F2ECDD]/50'),
    (r'\bbg-white/40\b', 'bg-[#F2ECDD]/40'),
    (r'\bbg-white\b', 'bg-[#F2ECDD]'),

    # Slate-200 → warmer
    (r'\bbg-slate-200\b', 'bg-[#E5DCC5]'),
    (r'\bbg-slate-300\b', 'bg-[#D9CFB8]'),
    (r'\bbg-slate-400/(\d+)\b', r'bg-[#7A8492]/\1'),
    (r'\bbg-slate-400\b', 'bg-[#7A8492]'),

    # Slate text colors → deeper warm tones
    (r'\btext-slate-900\b', 'text-[#2A3340]'),
    (r'\btext-slate-800\b', 'text-[#2A3340]'),
    (r'\btext-slate-700\b', 'text-[#3D4A60]'),
    (r'\btext-slate-600\b', 'text-[#4E5A6C]'),
    (r'\btext-slate-500\b', 'text-[#7A8492]'),
    (r'\btext-slate-400\b', 'text-[#8E9DB4]'),
    (r'\btext-slate-300\b', 'text-[#BFCBDB]'),
    (r'\btext-slate-200\b', 'text-[#DDE3EC]'),

    # Slate borders → warmer
    (r'\bborder-slate-300/(\d+)\b', r'border-[#7A8492]/\1'),
    (r'\bborder-slate-300\b', 'border-[#BFB39A]'),
    (r'\bborder-slate-200/(\d+)\b', r'border-[#BFB39A]/\1'),
    (r'\bborder-slate-200\b', 'border-[#D9CFB8]'),
    (r'\bborder-slate-500/(\d+)\b', r'border-[#5C6E8A]/\1'),
    (r'\bborder-slate-500\b', 'border-[#5C6E8A]'),
    (r'\bborder-slate-400/(\d+)\b', r'border-[#7A8492]/\1'),
    (r'\bborder-slate-400\b', 'border-[#7A8492]'),

    # Sage class fix (was using slate mapping for sage-300/500/700)
    (r'\bbg-sage-300/(\d+)\b', r'bg-[#97A894]/\1'),
    (r'\bbg-sage-300\b', 'bg-[#97A894]'),
    (r'\bborder-sage-500/(\d+)\b', r'border-[#718C6F]/\1'),
    (r'\btext-sage-700\b', 'text-[#4D6450]'),

    # Slate bg with opacity for accents
    (r'\bbg-slate-400/15\b', 'bg-[#5C6E8A]/15'),
    (r'\bbg-slate-400/25\b', 'bg-[#5C6E8A]/25'),
    (r'\bborder-slate-400/40\b', 'border-[#7A8492]/40'),
    (r'\bborder-slate-400/50\b', 'border-[#7A8492]/50'),

    # Amber tones slightly warmer
    (r'\bbg-amber-100/30\b', 'bg-[#F0E0C0]/40'),
    (r'\bbg-amber-100/20\b', 'bg-[#F0E0C0]/30'),
    (r'\bbg-amber-50/50\b', 'bg-[#F5E8C8]/50'),
    (r'\bbg-amber-200/40\b', 'bg-[#E8D4A8]/40'),
    (r'\bborder-amber-400/(\d+)\b', r'border-[#C99A50]/\1'),
    (r'\bborder-amber-300/(\d+)\b', r'border-[#D9A85E]/\1'),
    (r'\btext-amber-700\b', 'text-[#8A6428]'),
    (r'\btext-amber-800\b', 'text-[#6B4D1C]'),
    (r'\btext-amber-600\b', 'text-[#A8782E]'),

    # Rose warm
    (r'\bbg-rose-100/30\b', 'bg-[#F0D4D8]/40'),
    (r'\bbg-rose-100/20\b', 'bg-[#F0D4D8]/30'),
    (r'\bborder-rose-400/(\d+)\b', r'border-[#B57482]/\1'),
    (r'\bborder-rose-300/(\d+)\b', r'border-[#C98896]/\1'),
    (r'\btext-rose-700\b', 'text-[#8B4A56]'),
    (r'\btext-rose-800\b', 'text-[#6F3A45]'),
    (r'\bfill-rose-400\b', 'fill-[#C98896]'),
    (r'\bfill-rose-500\b', 'fill-[#B57482]'),

    # Emerald tones migrated to sage (since we use sage palette)
    (r'\btext-emerald-700\b', 'text-[#4D6450]'),
    (r'\btext-emerald-600\b', 'text-[#4D6450]'),

    # Gray (login screen)
    (r'\btext-gray-900\b', 'text-[#2A3340]'),
    (r'\bbg-gray-100\b', 'bg-[#E5DCC5]'),
    (r'\bbg-gray-50\b', 'bg-[#F2ECDD]'),
]

def migrate(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    for pattern, repl in REPLACEMENTS:
        text = re.sub(pattern, repl, text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False

if __name__ == "__main__":
    base = Path("/home/z/my-project/src")
    files = list(base.glob("components/screens/*.tsx")) + \
            list(base.glob("components/*.tsx"))
    total = 0
    for f in sorted(files):
        if migrate(f):
            print(f"  migrated: {f.relative_to(base.parent)}")
            total += 1
    print(f"\nTotal files migrated: {total}")
