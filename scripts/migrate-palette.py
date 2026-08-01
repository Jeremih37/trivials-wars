#!/usr/bin/env python3
"""
Migración de paleta: azul saturado → neutro (slate/sage)
Aplica reemplazos de clases Tailwind en todos los screen components.
"""
import re
from pathlib import Path

# Reemplazos de clases Tailwind (orden importa: más específicos primero)
REPLACEMENTS = [
    # Text colors
    (r'\btext-blue-950\b', 'text-slate-800'),
    (r'\btext-blue-900/80\b', 'text-slate-600'),
    (r'\btext-blue-900/70\b', 'text-slate-600'),
    (r'\btext-blue-900/60\b', 'text-slate-500'),
    (r'\btext-blue-900/50\b', 'text-slate-500'),
    (r'\btext-blue-900/40\b', 'text-slate-400'),
    (r'\btext-blue-900\b', 'text-slate-700'),
    (r'\btext-blue-800\b', 'text-slate-700'),
    (r'\btext-blue-700/80\b', 'text-slate-500'),
    (r'\btext-blue-700/70\b', 'text-slate-500'),
    (r'\btext-blue-700/60\b', 'text-slate-400'),
    (r'\btext-blue-700\b', 'text-slate-600'),
    (r'\btext-blue-600\b', 'text-slate-600'),
    (r'\btext-blue-500\b', 'text-slate-500'),

    # Border colors
    (r'\bborder-blue-300/60\b', 'border-slate-300/60'),
    (r'\bborder-blue-300/50\b', 'border-slate-300/50'),
    (r'\bborder-blue-300/40\b', 'border-slate-300/40'),
    (r'\bborder-blue-300/30\b', 'border-slate-300/30'),
    (r'\bborder-blue-300\b', 'border-slate-300'),
    (r'\bborder-blue-200/60\b', 'border-slate-200/60'),
    (r'\bborder-blue-200/40\b', 'border-slate-200/40'),
    (r'\bborder-blue-200\b', 'border-slate-200'),
    (r'\bborder-blue-500/80\b', 'border-slate-500/60'),
    (r'\bborder-blue-500/70\b', 'border-slate-500/50'),
    (r'\bborder-blue-500/60\b', 'border-slate-500/40'),
    (r'\bborder-blue-500/50\b', 'border-slate-500/40'),
    (r'\bborder-blue-500/40\b', 'border-slate-500/30'),
    (r'\bborder-blue-500\b', 'border-slate-500'),

    # Background colors
    (r'\bbg-blue-500/25\b', 'bg-slate-400/25'),
    (r'\bbg-blue-500/20\b', 'bg-slate-400/20'),
    (r'\bbg-blue-500/15\b', 'bg-slate-400/15'),
    (r'\bbg-blue-500/10\b', 'bg-slate-400/10'),
    (r'\bbg-blue-400/25\b', 'bg-slate-400/25'),
    (r'\bbg-blue-400/20\b', 'bg-slate-400/20'),
    (r'\bbg-blue-400/15\b', 'bg-slate-400/15'),
    (r'\bbg-blue-600\b', 'bg-slate-600'),
    (r'\bbg-blue-700\b', 'bg-slate-700'),

    # Hex colors direct (paleta anterior → neutra)
    (r'from-\[#1046AA\]/?(\d+)?', lambda m: f'from-[#6E82A0]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'to-\[#1046AA\]/?(\d+)?', lambda m: f'to-[#6E82A0]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'from-\[#4E9215\]/?(\d+)?', lambda m: f'from-[#8AA088]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'to-\[#4E9215\]/?(\d+)?', lambda m: f'to-[#8AA088]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'from-\[#7BBE3A\]/?(\d+)?', lambda m: f'from-[#B0BFAE]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'to-\[#7BBE3A\]/?(\d+)?', lambda m: f'to-[#B0BFAE]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'text-\[#4E9215\]', 'text-[#8AA088]'),
    (r'text-\[#1046AA\]', 'text-[#6E82A0]'),
    (r'bg-\[#7BBE3A\]/?(\d+)?', lambda m: f'bg-[#B0BFAE]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'bg-\[#4E9215\]/?(\d+)?', lambda m: f'bg-[#8AA088]{"/"+m.group(1) if m.group(1) else ""}'),
    (r'bg-\[#1046AA\]/?(\d+)?', lambda m: f'bg-[#6E82A0]{"/"+m.group(1) if m.group(1) else ""}'),

    # RGBA hex literals in styles
    (r'rgba\(16,\s*70,\s*170', 'rgba(110, 130, 160'),
    (r'rgba\(78,\s*146,\s*21', 'rgba(138, 160, 136'),
    (r'rgba\(123,\s*190,\s*58', 'rgba(176, 191, 174'),
    (r'rgba\(10,\s*46,\s*120', 'rgba(76, 92, 117'),
    (r'rgba\(59,\s*123,\s*217', 'rgba(164, 179, 200'),
    (r'rgba\(111,\s*167,\s*232', 'rgba(164, 179, 200'),
    (r'rgba\(251,\s*255,\s*254', 'rgba(255, 252, 247'),

    # Hex color literals (no var) in inline styles
    (r'#1046AA', '#6E82A0'),
    (r'#4E9215', '#8AA088'),
    (r'#7BBE3A', '#B0BFAE'),
    (r'#0A2E78', '#4C5C75'),
    (r'#3B7BD9', '#A4B3C8'),
    (r'#6FA7E8', '#D6DEEA'),
    (r'#FBFFFE', '#FAF7F1'),

    # Ring/focus
    (r'focus:ring-blue-500/40', 'focus:ring-slate-500/40'),
    (r'focus:border-blue-500', 'focus:border-slate-500'),
    (r'focus:ring-blue-500', 'focus:ring-slate-500'),

    # Amber suave
    (r'\bbg-amber-500/15\b', 'bg-amber-200/40'),
    (r'\bbg-amber-500/25\b', 'bg-amber-300/40'),
    (r'\bborder-amber-500/50\b', 'border-amber-400/50'),
    (r'\bborder-amber-500/40\b', 'border-amber-400/40'),
    (r'\btext-amber-600\b', 'text-amber-700'),

    # Emerald suave
    (r'\btext-emerald-600\b', 'text-sage-700'),
    (r'\bbg-emerald-400/15\b', 'bg-sage-300/25'),
    (r'\bborder-emerald-400/50\b', 'border-sage-500/40'),

    # Rose suave
    (r'\bbg-rose-500/15\b', 'bg-rose-300/25'),
    (r'\bborder-rose-500/40\b', 'border-rose-400/40'),
    (r'\btext-rose-700\b', 'text-rose-700'),
]

def migrate(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text
    for pattern, repl in REPLACEMENTS:
        if callable(repl):
            text = re.sub(pattern, repl, text)
        else:
            text = re.sub(pattern, repl, text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return sum(1 for _ in re.finditer('|'.join(p if isinstance(p, str) else p for p, _ in REPLACEMENTS), original))
    return 0

if __name__ == "__main__":
    base = Path("/home/z/my-project/src")
    files = list(base.glob("components/screens/*.tsx")) + \
            list(base.glob("components/*.tsx")) + \
            list(base.glob("lib/*.{ts,tsx}"))
    total = 0
    for f in sorted(files):
        n = migrate(f)
        if n > 0:
            print(f"  {f.relative_to(base.parent)}: migrated")
            total += 1
    print(f"\nTotal files migrated: {total}")
