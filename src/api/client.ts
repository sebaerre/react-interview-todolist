/**
 * Thin fetch wrapper that throws on non-2xx responses and parses the body as
 * JSON. Returns `undefined` (cast to `T`) for empty 204 responses.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${url} failed: ${res.status}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** Builds a `RequestInit` with `Content-Type: application/json` and a serialized body. */
export const json = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})
