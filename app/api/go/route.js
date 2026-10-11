// VULN-9 (active en ligne : sans danger, et testable par les tests actifs)
// Fix: resolve the candidate target against the request origin and explicitly
// verify the resulting origin matches before redirecting. This avoids relying
// on fragile string/regex matching that can be bypassed with protocol-relative
// URLs ('//evil.com'), backslash tricks ('/\\evil.com'), encoded variants, or
// embedded credentials/scheme tricks.
function resolveSafeUrl(value, origin) {
    if (typeof value !== "string" || value.length === 0) return null;
    let resolved;
    try {
        resolved = new URL(value, origin);
    } catch {
        return null;
    }
    const originUrl = new URL(origin);
    if (resolved.origin !== originUrl.origin) return null;
    return resolved;
}

export async function GET(req) {
    const url = new URL(req.url);
    const requested = url.searchParams.get("next");
    const safeUrl = resolveSafeUrl(requested, url.origin);
    const target = safeUrl ?? new URL("/", url.origin);
    return Response.redirect(target, 302);
}
