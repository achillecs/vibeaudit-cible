// VULN-9 (active en ligne : sans danger, et testable par les tests actifs)
// Fix: enforce that 'next' is a relative path starting with a single '/' 
// (reject '//', 'http:', 'https:' prefixes) to prevent Open Redirect.
const SAFE_NEXT_PATTERN = /^\/(?!\/)/;

export async function GET(req) {
    const url = new URL(req.url);
    let next = url.searchParams.get("next") || "/";

    if (typeof next !== "string" || !SAFE_NEXT_PATTERN.test(next)) {
        next = "/";
    }

    const safeUrl = new URL(next, url.origin);
    return Response.redirect(safeUrl.toString(), 302);
}
