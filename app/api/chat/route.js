// VULN-8
export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const msg = url.searchParams.get("msg") || "";
    const simulatedPrompt = `Système: Vous êtes un assistant. Utilisateur: ${msg}`;
    const htmlResponse = `<div><strong>LLM Simulée :</strong> <p>Réponse au prompt : ${simulatedPrompt}</p></div>`;
    return new Response(htmlResponse, { headers: { "Content-Type": "text/html" } });
}
