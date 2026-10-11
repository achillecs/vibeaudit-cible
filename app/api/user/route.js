// VULN-4
import { Client } from 'pg';

export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");

    // Validate input: must be a non-negative integer
    if (!idParam || !/^\d+$/.test(idParam)) {
        return Response.json({ error: "Invalid 'id' parameter: must be a positive integer" }, { status: 400 });
    }
    const id = Number.parseInt(idParam, 10);
    if (!Number.isSafeInteger(id) || id < 0) {
        return Response.json({ error: "Invalid 'id' parameter: must be a positive integer" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        try {
            const res = await client.query("SELECT * FROM users WHERE id = $1", [id]);
            return Response.json(res.rows);
        } finally {
            await client.end();
        }
    }
    return Response.json({ error: "No DATABASE_URL configured" });
}
