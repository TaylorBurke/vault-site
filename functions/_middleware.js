// Cloudflare Pages Function: HTTP Basic Auth in front of every request.
// Set SITE_PASSWORD (and optionally SITE_USER) as encrypted variables in the
// Pages project. Without SITE_PASSWORD everything is refused (fails closed).

const encoder = new TextEncoder()

// Compare via fixed-length hashes so timingSafeEqual works on any input
async function same(a, b) {
  const [x, y] = await Promise.all(
    [a, b].map((s) => crypto.subtle.digest("SHA-256", encoder.encode(s))),
  )
  return crypto.subtle.timingSafeEqual(x, y)
}

function unauthorized() {
  return new Response("Login required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="vault", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  })
}

function parseBasic(header) {
  const [scheme, encoded] = (header ?? "").split(" ")
  if (scheme !== "Basic" || !encoded) return null
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
    const decoded = new TextDecoder().decode(bytes)
    const i = decoded.indexOf(":")
    if (i < 0) return null
    return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) }
  } catch {
    return null
  }
}

export async function onRequest({ request, env, next }) {
  if (!env.SITE_PASSWORD) {
    return new Response("Site password not configured", { status: 503 })
  }

  const creds = parseBasic(request.headers.get("Authorization"))
  if (!creds) return unauthorized()

  // SITE_USER is optional; when unset any username is accepted
  const userOk = await same(creds.user, env.SITE_USER ?? creds.user)
  const passOk = await same(creds.pass, env.SITE_PASSWORD)
  if (!(userOk && passOk)) return unauthorized()

  const res = await next()
  const out = new Response(res.body, res)
  out.headers.set("Cache-Control", "private, no-cache")
  out.headers.set("X-Robots-Tag", "noindex, nofollow")
  return out
}
