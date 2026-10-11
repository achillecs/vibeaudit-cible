// VULN-4
import { Client } from 'pg';

export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (process.env.DATABASE_URL) {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        const res = await client.query("SELECT * FROM users WHERE id = " + id);
        return Response.json(res.rows);
    }
    return Response.json({ error: "No DATABASE_URL configured" });
}
