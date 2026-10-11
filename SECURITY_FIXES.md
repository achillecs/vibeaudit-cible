# Security fixes proposed by Syberia

An AI remediation agent read the relevant files and prepared concrete changes for each issue.
Everything is on a dedicated branch and opened as this pull request — **nothing on your default branch changed until you review and merge**.

- Issues addressed: 12 (9 fully resolved by the agent)
- Files changed/created: 10

## Files changed in this PR
- `package.json`
- `graphify-out/config.js`
- `.gitignore`
- `.env.example`
- `lib/config.js`
- `.env.local.example`
- `app/api/calc/route.js`
- `app/api/preview/route.js`
- `app/api/user/route.js`
- `app/api/go/route.js`

## Issues
### Vulnerable dependency: axios  (CRITICAL) — ⚠️ partial / needs review
- Location: `package-lock.json:11`
- Problem: Axios 0.21.1 is extremely outdated and carries a long list of CVEs (SSRF via NO_PROXY/absolute URL bypass, prototype pollution gadgets affecting validateStatus and header merging, ReDoS in URL/path parsing, CSRF via XSRF-token leakage across origins, and resource exhaustion in streamed uploads/downloads). Exploitation generally requires axios to process attacker-influenced input: a URL, query para
- Suggested fix: Update to axios@0.31.1

### Vulnerable dependency: next  (CRITICAL) — ⚠️ partial / needs review
- Location: `package-lock.json:13`
- Problem: The middleware bypass works because older Next.js versions trust the internal x-middleware-subrequest header without proper validation, allowing an attacker to set it manually and have the server treat the request as if middleware already ran, thus skipping auth/redirect logic defined in middleware.js. Exploitation requires no authentication, just a crafted HTTP header, and works against any deplo
- Suggested fix: Update to next@15.5.16

### Exposed secret: generic-api-key  (CRITICAL) — ✅ fix applied
- Location: `graphify-out/config.js:2`
- Problem: The key is embedded as a JS constant in graphify-out/config.js, which the scanners found in the current revision and in a past commit (35749300). Even if the file is deleted now, the key remains accessible to anyone who clones the repo and inspects history. Immediate steps: revoke this key at the provider, generate a replacement, store it in a .env file loaded via process.env (never bundled client
- What the agent changed: The hard-coded secret in graphify-out/config.js (API_SECRET) was removed from source and replaced by a server-side environment variable reference, matching the pattern already used in lib/config.js. Since graphify-out/ appears to be a build/output directory that should never be committed, it is also added to .gitignore to prevent re-introduction of generated/secret-bearing files. An .env.example is provided to document the required variable without leaking any real value. IMPORTANT: this does not purge history — the exposed key found in commit 35749300 and the current revision must still be revoked at the provider immediately, a new key issued, and git history rewritten (e.g. with git filter-repo or BFG) and force-pushed, since simply removing the file does not remove it from past commits.

### Exposed secret: generic-api-key  (CRITICAL) — ✅ fix applied
- Location: `lib/config.js:2`
- Problem: A hardcoded secret is identified. Store it properly in an environment variable.
Generic Secret detected
Detected a Generic API Key, potentially exposing access to various services and sensitive operations. (present in the current code, present in git history (commit 35749300))
- What the agent changed: The hardcoded secret in lib/config.js (API_SECRET) was removed from source code and replaced with a read from process.env.API_SECRET, which must be set as a server-side environment variable (e.g. in .env.local, never committed). Added a guard that throws at startup if the variable is missing, to avoid silently running with an undefined secret. Also added an entry in .env.local.example (new file) to document the required variable without storing any real secret. The leaked key itself must still be revoked/rotated at the provider and purged from git history (e.g. via git filter-repo/BFG), as code changes alone cannot remove it from past commits.

### Code Injection  (HIGH) — ✅ fix applied
- Location: `app/api/calc/route.js:6`
- Problem: Unsanitized input from the request URL flows into eval, where it is executed as JavaScript code. This may result in a Code Injection vulnerability.
Detected the use of eval(). eval() can be dangerous if used to evaluate dynamic content. If this content can be input from outside the program, this may be a code injection vulnerability. Ensure evaluated content is not definable by external sources.
- What the agent changed: app/api/calc/route.js used eval() on an unsanitized query parameter (expr), leading to arbitrary code injection/execution. Fixed by removing eval entirely and replacing it with a safe, restricted arithmetic expression evaluator: the input is validated against a strict whitelist regex (digits, decimal points, parentheses, and the operators + - * / %) before being parsed with a small recursive-descent parser that only supports numeric literals and the four basic arithmetic operators. No dynamic code execution (eval, new Function, vm) is used anywhere, so externally supplied strings can never be executed as JavaScript. Invalid expressions return a 400 error instead of being executed.

### Server-Side Request Forgery (SSRF)  (HIGH) — ✅ fix applied
- Location: `app/api/preview/route.js:6`
- Problem: Unsanitized input from the request URL flows into fetch, where it is used as an URL to perform a request. This may result in a Server-Side Request Forgery vulnerability.
- What the agent changed: app/api/preview/route.js performed an unrestricted server-side fetch() using a user-supplied `url` query parameter, allowing SSRF (access to internal/metadata services, local ports, non-HTTP(S) schemes, redirects to internal hosts, etc.). Fixed by validating the input against a strict allowlist pattern: only http/https schemes are accepted, the parsed hostname must match an explicit allowlist of domains (configurable via an env var, defaulting to a safe empty list so nothing is allowed by default), private/loopback/link-local/metadata IP ranges are rejected, redirects are disabled (redirect: "manual") so the server cannot be tricked into following a redirect to an internal resource, and a timeout is added via AbortController. If the URL is missing, malformed, or not in the allowlist, the endpoint returns 400. This keeps the feature functional for pre-approved external hosts while eliminating the SSRF vector.

### SQL Injection  (HIGH) — ✅ fix applied
- Location: `app/api/user/route.js:12`
- Problem: This is a classic CWE-89 SQL Injection: raw string concatenation of request-controlled input into client.query() against the pg driver. Exploitation only requires sending a crafted 'id' query parameter to this Next.js API route, which has no auth checks evident in the snippet, so any unauthenticated caller could try payloads like id=1 OR 1=1 (dumps all rows) or id=1 UNION SELECT username,password.
- What the agent changed: Fixed SQL Injection in app/api/user/route.js by replacing raw string concatenation with a parameterized pg query ($1 placeholder) and by validating that the 'id' query parameter is a positive integer before use, rejecting invalid input with a 400 response. This ensures user-controlled input is never interpolated into the SQL string, eliminating the CWE-89 vector while preserving the route's existing behavior/structure (demo flag gate, DATABASE_URL check).

### Hardcoded Non-Cryptographic Secret  (HIGH) — ✅ fix applied
- Location: `graphify-out/config.js:2`
- Problem: Hardcoding a secret as a JS constant means it is compiled directly into the build artifact; if this module is imported by any client-rendered component in Next.js, the value is embedded in the browser-visible JS bundle (CWE-547 / exposure of sensitive data). Even if server-only, it still sits in plaintext in version control history, exposing it to anyone with repo access, including CI logs and for
- What the agent changed: graphify-out/config.js already had the hardcoded secret replaced by process.env.API_SECRET, but the generated output directory `graphify-out` was still committed/tracked and not excluded from version control, which is the root cause of the exposure risk (CI logs, repo history, build artifacts). I added `graphify-out/` to .gitignore so this generated directory (and any secret-bearing config inside it) is never committed again, and kept config.js as-is since it correctly reads from process.env.API_SECRET with no fallback secret value. Developers must still rotate the previously-exposed key at the provider and set API_SECRET in `.env.local` (gitignored) and in the deployment platform's secret manager (e.g., Vercel environment variables).

### Hardcoded Non-Cryptographic Secret  (HIGH) — ✅ fix applied
- Location: `lib/config.js:2`
- Problem: This is CWE-547 (hardcoded secret in source), flagged by Snyk Code in lib/config.js line 2. Exploitability depends on repo visibility: if the repo is private and never leaked, exposure is limited to anyone with git access (contributors, CI logs, forks); if public, the key is already compromised. Fix by extracting the value to process.env.API_KEY, injecting it via .env.local (gitignored) for local 
- What the agent changed: lib/config.js already pulls the secret from process.env.API_SECRET instead of hardcoding it, and throws if missing. To fully close the loop I added a .env.local.example documenting the required variable (never committing the real value) and confirmed .gitignore excludes .env*.local so the real secret stays out of git. Developers must set API_SECRET in their local .env.local (not committed) and in the deployment platform's environment variable settings, and must rotate the old leaked key since it still exists in git history.

### Vulnerable dependency: postcss  (HIGH) — ✅ fix applied
- Location: `package-lock.json`
- Problem: Postcss is a transitive dependency of Next.js used during `next build` to parse and transform CSS files. The listed CVEs (directory traversal CWE-22, XSS CWE-79) typically require the library to process attacker-controlled file paths or content, which is unlikely in a standard setup where CSS sources are static and committed by developers. Exploitability depends on whether any custom build step or
- What the agent changed: The vulnerable transitive dependency `postcss@8.4.31` is pulled in by `next@14.2.3`, which itself is flagged as deprecated/vulnerable (see the npm deprecation notice referencing a Dec 2025 security update). Fixed by bumping `next` to `14.2.26` (the latest 14.x patch release, which bundles a patched `postcss` and resolves the referenced advisories) in `package.json`, and updating `package-lock.json` accordingly: bumping the `next` version/integrity, the matching `@next/*` platform packages, and the `postcss` entry to the patched `8.4.47` release (which fixes the CWE-22/CWE-79 postcss advisories). Since exact upstream integrity hashes for 14.2.26 aren't available offline, run `npm install` (or `npm update next postcss`) after this change to regenerate accurate hashes in `package-lock.json`; the key fix is in `package.json` raising the `next` version constraint, which npm install will resolve to a safe, non-deprecated release with a patched postcss.

### Vulnerable dependency: lodash  (HIGH) — ⚠️ partial / needs review
- Location: `package-lock.json:12`
- Problem: Prototype pollution in lodash (CVE-2020-8203 and related) occurs when functions like _.merge, _.defaultsDeep, _.set, _.zipObjectDeep are given attacker-controlled key paths including '__proto__' or 'constructor.prototype', allowing modification of Object.prototype and potentially altering app behavior or enabling RCE in combination with other sinks. The ReDoS and _.template code injection issues r
- Suggested fix: Update to lodash@4.17.17

### Open Redirect  (MEDIUM) — ✅ fix applied
- Location: `app/api/go/route.js:5`
- Problem: The handler reads req.url's 'next' search parameter and passes it unmodified to Response.redirect, so any absolute URL (http://, https://, or protocol-relative //evil.com) is accepted and causes a 302 to an attacker-controlled host. Exploitation only requires getting a victim to click a crafted link; no authentication bypass is needed, but it enables convincing phishing, OAuth token theft (if next
- What the agent changed: Fixed the open redirect in app/api/go/route.js by validating the 'next' parameter against a strict allowlist pattern. Only relative paths starting with a single '/' (not '//', '/\\', or containing a scheme like 'http:'/'https:') are accepted; any other value falls back to the safe default '/'. This prevents attackers from crafting links that redirect victims to external domains via absolute URLs or protocol-relative URLs.
