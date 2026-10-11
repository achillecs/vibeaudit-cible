// VULN-11
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aucun en-tête de sécurité (pas de CSP, X-Frame-Options, HSTS) n'est configuré ici.
};
module.exports = nextConfig;
