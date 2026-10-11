// VULN-6
export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const target = url.searchParams.get("url");
    const res = await fetch(target);
    const data = await res.text();
    return new Response(data, { headers: { "Content-Type": "text/html" } });
}
