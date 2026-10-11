// VULN-7
export async function GET() {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    return Response.json([
        { id: 1, email: "admin@example.com" },
        { id: 2, email: "user@example.com" }
    ]);
}
