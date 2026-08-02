"""
Quita emojis de archivos .tsx y .ts en src/.
Mantiene intacta la lógica y los strings sin emoji.
Reporta cada reemplazo para verificación.
"""
import re
import os
import unicodedata

# Rango extendido de emojis + pictográficos + símbolos comunes
# Basado en Unicode 15 emoji ranges
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001F6FF"   # symbols & pictographs
    "\U0001F700-\U0001F77F"   # alchemical symbols
    "\U0001F780-\U0001F7FF"   # geometric shapes
    "\U0001F800-\U0001F8FF"   # supplemental arrows
    "\U0001F900-\U0001F9FF"   # supplemental symbols and pictographs
    "\U0001FA00-\U0001FA6F"   # chess symbols
    "\U0001FA70-\U0001FAFF"   # symbols and pictographs extended-a
    "\U00002600-\U000026FF"   # misc symbols (☀ ☁ ☂ ☃ ☄ ★ ☆ ☎ ☑ etc.)
    "\U00002700-\U000027BF"   # dingbats (✂ ✈ ✉ ✏ ✔ ✖ ✨ ✳ etc.)
    "\U0000FE00-\U0000FE0F"   # variation selectors
    "\U0001F1E6-\U0001F1FF"   # regional indicators (flags)
    "\U0001F018-\U0001F270"   # various (still emojis)
    "\U0001F004"               # mahjong tile
    "\U0001F0CF"               # playing card
    "]+",
    flags=re.UNICODE,
)

# Solo procesar .tsx y .ts en src/
TARGETS = [
    "src/lib/facts-data.ts",
    "src/lib/game.ts",
    "src/lib/profile-catalog.tsx",
    "src/lib/gacha-catalog.tsx",
    "src/components/screens/results-screen.tsx",
    "src/components/screens/welcome-screen.tsx",
    "src/components/screens/game-screen.tsx",
    "src/components/screens/login-screen.tsx",
    "src/components/wisdom-capsule.tsx",
]

# Lista blanca: NO tocar emojis DENTRO de strings que sean datos
# (en facts-data.ts los emojis son parte del dato). Para facts-data.ts,
# reemplazamos el campo "emoji" por "" (cadena vacía) y mantenemos la estructura.
# Para game.ts/profile-catalog.tsx/gacha-catalog.tsx, los emojis son de UI
# (iconos de categorías, iconos de perfil) — también se eliminan.

BASE = "/home/z/my-project"

total_emojis_removed = 0
files_modified = 0

for rel in TARGETS:
    path = os.path.join(BASE, rel)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Encontrar todos los matches para reportar
    matches = EMOJI_PATTERN.findall(content)
    if not matches:
        print(f"[skip] {rel}: 0 emojis")
        continue

    new_content = EMOJI_PATTERN.sub("", content)

    # Limpiar espacios en blanco sobrantes en líneas que quedaron solo con espacios
    # (típico: `emoji: "🐙",` → `emoji: "",`)
    # Y limpiar strings vacíos que quedaron como "  "
    new_content = re.sub(r'"""', '""', new_content)  # triple quote artifact
    new_content = re.sub(r'"(\s*)"', '""', new_content)

    # Para archivos .tsx, limpiar sitios donde el emoji era el único contenido
    # de un elemento (ej: <span>🧠</span> → <span></span> o eliminar)
    # Lo dejamos como string vacío — mejor que el componente colapse naturalmente.

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    total_emojis_removed += len(matches)
    files_modified += 1
    print(f"[ok] {rel}: {len(matches)} emojis removidos")

print(f"\nTotal: {total_emojis_removed} emojis en {files_modified} archivos")
