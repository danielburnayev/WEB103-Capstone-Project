const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}
