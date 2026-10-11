// VULN-3
export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const expr = url.searchParams.get("expr") || "1+1";
    const result = eval(expr);
    return Response.json({ result });
}
