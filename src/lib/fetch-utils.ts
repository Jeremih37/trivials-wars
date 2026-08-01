/**
 * Parsea JSON de un Response de forma segura.
 * Si el body está vacío o no es JSON válido, devuelve null.
 */
export async function parseJsonSafe<T = unknown>(r: Response): Promise<T | null> {
  try {
    const text = await r.text()
    if (!text) return null
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

/**
 * Lee un error de un Response de forma segura.
 * Si el body está vacío o no es JSON, devuelve un mensaje genérico.
 */
export async function readApiError(r: Response, fallback: string): Promise<string> {
  const data = await parseJsonSafe<{ error?: string; message?: string }>(r)
  return data?.error || data?.message || `${fallback} (HTTP ${r.status})`
}
