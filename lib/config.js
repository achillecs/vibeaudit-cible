// VULN-1 (fixed): secret moved out of source code into an environment variable.
// Set API_SECRET in your environment (e.g. .env.local, which must be gitignored)
// and never commit real secret values to the repository.
const API_SECRET = process.env.API_SECRET;

if (!API_SECRET) {
  throw new Error(
    "Missing required environment variable API_SECRET. Set it in your server environment (e.g. .env.local) and do not hardcode secrets in source code."
  );
}

export { API_SECRET };
