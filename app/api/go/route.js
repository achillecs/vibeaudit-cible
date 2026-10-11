// VULN-9 (active en ligne : sans danger, et testable par les tests actifs)
export async function GET(req) {
    const url = new URL(req.url);
    const next = url.searchParams.get("next") || "/";
    return Response.redirect(next, 302);
}
