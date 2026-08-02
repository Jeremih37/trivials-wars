"""
Reemplaza los icon:"" (emoji eliminado) por iniciales significativas.
Mantiene el campo icon pero ahora contiene 1-2 letras en lugar de emoji.
"""
import re

# --- game.ts: categorías ---
path = "/home/z/my-project/src/lib/game.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Map: id → iniciales
initials_map = {
    "Entretenimiento": "EN",
    "Deporte": "DP",
    "Historia": "HI",
    "Matematicas": "MA",
    "Ciencia": "CI",
    "Videojuegos": "VG",
    "Geografia": "GE",
    "Arte": "AR",
    "Tecnologia": "TE",
    "Mitologia": "MI",
    "Retrofuturismo": "RF",
    "Oceano": "OC",
    "IA": "IA",
    "Astronomia": "AS",
    "CulturaPop": "CP",
    "Maravillas": "MA",
}

for cat_id, initials in initials_map.items():
    # Match: { id: "X", name: "...", icon: "", color: "..." }
    pattern = re.compile(
        r'(\{ id: "' + re.escape(cat_id) + r'", name: "[^"]+", icon: )""(, color: "[^"]+" \})'
    )
    new_content, n = pattern.subn(lambda m: f'{m.group(1)}"{initials}"{m.group(2)}', content)
    if n > 0:
        content = new_content

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print(f"[ok] game.ts: categorías con iniciales")

# --- profile-catalog.tsx: iconos de perfil ---
path2 = "/home/z/my-project/src/lib/profile-catalog.tsx"
with open(path2, "r", encoding="utf-8") as f:
    content2 = f.read()

profile_initials = {
    "icon_brain": "BR",  # Cerebro
    "icon_fire": "FR",   # Fuego
    "icon_star": "ST",   # Estrella
    "icon_trophy": "TR", # Trofeo
    "icon_crown": "CR",  # Corona
    "icon_diamond": "DI",# Diamante
    "icon_lightning": "LT",# Rayo
    "icon_phoenix": "PH",# Fénix
    "icon_galaxy": "GA", # Galaxia
    "icon_volcano": "VO",# Volcán
}

for icon_id, initials in profile_initials.items():
    pattern = re.compile(
        r'(\{ id: "' + re.escape(icon_id) + r'", emoji: )""(, name: "[^"]+"[^}]*\})'
    )
    new_content, n = pattern.subn(lambda m: f'{m.group(1)}"{initials}"{m.group(2)}', content2)
    if n > 0:
        content2 = new_content

with open(path2, "w", encoding="utf-8") as f:
    f.write(content2)
print(f"[ok] profile-catalog.tsx: iconos con iniciales")

# --- game.ts: modos de juego (line 51, 58, 65) - icon:"" → usar un glifo unicode puro ---
# Para classic/survival/suddendeath dejamos "" y los componentes usarán iconos lucide
# (eso ya lo hacen en home-screen.tsx: Swords/Heart/Skull)
