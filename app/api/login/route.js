// VULN-10 (active en ligne : sans danger, et visible par les tests passifs)
export async function GET(req) {
    return new Response("Connecté", {
        headers: { "Set-Cookie": "session=random_session_id_123; path=/" }
    });
}
