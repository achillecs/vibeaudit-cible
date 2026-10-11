// VULN-10 bis : cookie de session posé sur TOUTES les pages, sans Secure / HttpOnly / SameSite
// (les tests passifs ne lisent que la page d'accueil : c'est ce qui rend la faille visible en ligne)
import { NextResponse } from "next/server";
export function middleware() {
    const res = NextResponse.next();
    res.headers.append("Set-Cookie", "session=demo_session_value; Path=/");
    return res;
}
