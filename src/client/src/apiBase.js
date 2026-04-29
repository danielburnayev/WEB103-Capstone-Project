const base = (
  import.meta.env.VITE_API_URL || "https://web103-capstone-project-1.onrender.com"
).replace(/\/$/, "")

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}
