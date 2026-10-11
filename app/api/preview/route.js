// VULN-6 - fixed: validate target URL against an allowlist and block SSRF vectors
import { isIP } from "net";

// Comma separated list of allowed hostnames for the preview feature.
// Nothing is allowed unless explicitly configured via PREVIEW_ALLOWED_HOSTS.
const ALLOWED_HOSTS = (process.env.PREVIEW_ALLOWED_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

function isPrivateOrReservedIp(hostname) {
    const version = isIP(hostname);
    if (!version) return false; // not a literal IP, will be checked by hostname allowlist / DNS resolution risk mitigated by host allowlist

    if (version === 4) {
        const parts = hostname.split(".").map(Number);
        const [a, b] = parts;
        if (a === 127) return true; // loopback
        if (a === 10) return true; // private
        if (a === 172 && b >= 16 && b <= 31) return true; // private
        if (a === 192 && b === 168) return true; // private
        if (a === 169 && b === 254) return true; // link-local / cloud metadata
        if (a === 0) return true;
        return false;
    }

    // IPv6
    const h = hostname.toLowerCase();
    if (h === "::1") return true; // loopback
    if (h.startsWith("fe80")) return true; // link-local
    if (h.startsWith("fc") || h.startsWith("fd")) return true; // unique local
    return false;
}

function isAllowedTarget(target) {
    let parsed;
    try {
        parsed = new URL(target);
    } catch {
        return false;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "localhost") return false;
    if (isPrivateOrReservedIp(hostname)) return false;

    if (ALLOWED_HOSTS.length === 0) return false;
    if (!ALLOWED_HOSTS.includes(hostname)) return false;

    return true;
}

export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });

    const url = new URL(req.url);
    const target = url.searchParams.get("url");

    if (!target || !isAllowedTarget(target)) {
        return new Response("Invalid or disallowed URL", { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const res = await fetch(target, {
            redirect: "manual", // do not follow redirects: avoids bypassing the allowlist
            signal: controller.signal,
        });

        if (res.status >= 300 && res.status < 400) {
            return new Response("Redirects are not allowed", { status: 400 });
        }

        const data = await res.text();
        return new Response(data, { headers: { "Content-Type": "text/html" } });
    } catch (e) {
        return new Response("Failed to fetch target URL", { status: 502 });
    } finally {
        clearTimeout(timeout);
    }
}
