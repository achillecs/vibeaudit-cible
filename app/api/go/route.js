// VULN-9 (active en ligne : sans danger, et testable par les tests actifs)
// Fix: only allow relative paths (single leading '/', not '//' or '/\\') to prevent open redirect.
function isSafeRelativePath(value) {
    if (typeof value !== "string" || value.length === 0) return false;
    // Must start with exactly one '/' and not be followed by another '/' or '\\'
    // (which browsers can interpret as protocol-relative URLs).
    if (!/^\/(?!\/|\\)/.test(value)) return false;
    // Reject any embedded scheme (e.g. "/\tjavascript:" or "/..%2fhttp://") attempts.
    if (/^\/\s*(https?:)?[\\/]{2}/i.test(value)) return false;
    return true;
}

export async function GET(req) {
    const url = new URL(req.url);
    const requested = url.searchParams.get("next");
    const next = isSafeRelativePath(requested) ? requested : "/";
    return Response.redirect(new URL(next, url.origin), 302);
}
