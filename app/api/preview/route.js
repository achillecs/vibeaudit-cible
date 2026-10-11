// VULN-6
import dns from "node:dns/promises";
import net from "node:net";

function isDisallowedIp(ip) {
    const type = net.isIP(ip);
    if (type === 0) return true; // unknown/invalid, be safe and block

    // Normalize IPv4-mapped IPv6 addresses (::ffff:127.0.0.1) to IPv4 form
    let addr = ip;
    if (type === 6 && addr.toLowerCase().startsWith("::ffff:")) {
        addr = addr.slice(7);
    }

    if (net.isIP(addr) === 4) {
        const parts = addr.split(".").map(Number);
        const [a, b] = parts;
        if (a === 127) return true; // loopback
        if (a === 10) return true; // private
        if (a === 172 && b >= 16 && b <= 31) return true; // private
        if (a === 192 && b === 168) return true; // private
        if (a === 169 && b === 254) return true; // link-local / metadata
        if (a === 0) return true; // "this" network
        if (a >= 224) return true; // multicast / reserved
        return false;
    }

    // IPv6 checks
    const lower = addr.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fe80:")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    if (lower.startsWith("ff")) return true; // multicast
    if (lower === "::") return true; // unspecified
    return false;
}

async function isSafeUrl(target) {
    let parsed;
    try {
        parsed = new URL(target);
    } catch {
        return false;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
    }

    const hostname = parsed.hostname;

    // If the hostname is already a literal IP, validate directly
    if (net.isIP(hostname) !== 0) {
        return !isDisallowedIp(hostname);
    }

    // Resolve the hostname and ensure none of the resolved addresses are internal
    let addresses;
    try {
        addresses = await dns.lookup(hostname, { all: true, verbatim: true });
    } catch {
        return false;
    }

    if (!addresses || addresses.length === 0) return false;

    for (const { address } of addresses) {
        if (isDisallowedIp(address)) return false;
    }

    return true;
}

export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const target = url.searchParams.get("url");

    if (!target || !(await isSafeUrl(target))) {
        return new Response("Invalid or disallowed URL", { status: 400 });
    }

    let res;
    try {
        res = await fetch(target, { redirect: "manual" });
    } catch {
        return new Response("Failed to fetch URL", { status: 502 });
    }

    // Reject redirects outright to prevent bypassing validation via redirect to internal targets
    if (res.status >= 300 && res.status < 400) {
        return new Response("Redirects are not allowed", { status: 400 });
    }

    const data = await res.text();
    return new Response(data, { headers: { "Content-Type": "text/html" } });
}
