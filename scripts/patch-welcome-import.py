"""
Reemplaza el bloque inline de FUN_FACTS en welcome-screen.tsx
con una importación desde src/lib/facts-data.ts
"""
import re

target = "/home/z/my-project/src/components/screens/welcome-screen.tsx"
with open(target, "r", encoding="utf-8") as f:
    content = f.read()

# Buscar el bloque desde "// ====== Datos curiosos" hasta el cierre del array "]" previo a "// ====== Ilustración"
pattern = re.compile(
    r"// ====== Datos curiosos de cultura general ======\n"
    r"interface FunFact \{[^}]+\}\n\n"
    r"const FACT_COLOR[^;]+?as const\n\n"
    r"const FUN_FACTS: FunFact\[\] = \[\n.*?\n\]\n\n",
    re.DOTALL,
)

replacement = """import { FUN_FACTS, type FunFact } from "@/lib/facts-data"

"""

new_content, n = pattern.subn(replacement, content)
if n != 1:
    print(f"ERROR: esperaba 1 reemplazo, encontré {n}")
    exit(1)

with open(target, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"OK: {n} reemplazo aplicado")
print(f"Archivo: {target}")
