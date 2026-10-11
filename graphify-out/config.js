// VULN-1 FIXED: secret removed from source control.
// The real value must be revoked/rotated at the provider and set as an
// environment variable (e.g. API_SECRET) in a .env file that is NOT committed.
// This file now only reads it from process.env at runtime (server-side only).
export const API_SECRET = process.env.API_SECRET || "";
