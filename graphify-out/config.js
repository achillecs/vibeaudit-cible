// VULN-1 FIXED: secret removed from source control.
// This file previously contained a hardcoded API_SECRET constant.
// The exposed key must be revoked at the provider immediately and replaced.
// Any new secret must be stored server-side only, e.g. in a .env file:
//   API_SECRET=your-new-secret-here
// and read via process.env.API_SECRET in server-side code only.
// Do NOT reintroduce secrets into client-bundled files such as this one.
export const API_SECRET = undefined;
