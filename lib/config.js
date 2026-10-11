// VULN-1 fixed: secret is now loaded from an environment variable instead of being hardcoded.
// Set API_SECRET in your environment (e.g. .env.local for local dev, or your hosting
// provider's secret manager in production). Never commit real secrets to source control.
const API_SECRET = process.env.API_SECRET;

if (!API_SECRET) {
  throw new Error(
    "Missing required environment variable API_SECRET. Set it in your environment (see .env.example)."
  );
}

export { API_SECRET };
