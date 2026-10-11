# Security fixes proposed by Syberia

An AI remediation agent read the relevant files and prepared concrete changes for each issue.
Everything is on a dedicated branch and opened as this pull request — **nothing on your default branch changed until you review and merge**.

- Issues addressed: 4 (2 fully resolved by the agent)
- Files changed/created: 2

## Files changed in this PR
- `package.json`
- `app/api/go/route.js`

## Issues
### Exposed secret: generic-api-key  (CRITICAL) — ⚠️ partial / needs review
- Location: `graphify-out/config.js:2`
- Problem: This is a classic CWE-798 (hardcoded credentials) case: the mitigation applied (removing the secret from the current file and reading it from process.env instead) is correct for new code, but it does not retroactively protect the key that was committed in history. Gitleaks correctly flags both current-code and history findings separately; here only the history finding remains relevant. The fix req
- Suggested fix: Revoke the key at the provider and generate a new one, move it out of the code (server-side environment variable), then clean the git history if needed.

### Exposed secret: generic-api-key  (CRITICAL) — ⚠️ partial / needs review
- Location: `lib/config.js:2`
- Problem: This is a historical secret exposure: the fix for the live code is already applied (API_SECRET pulled from env), so the current line flagged is a false positive for the live file, but the git history still contains the literal secret value in commit 35749300. If this repository is or ever was public, or if any collaborator or CI log retained that commit, the key is effectively compromised. Remedia
- Suggested fix: Revoke the key at the provider and generate a new one, move it out of the code (server-side environment variable), then clean the git history if needed.

### Vulnerable dependency: lodash (3 known issue(s))  (HIGH) — ✅ fix applied
- Location: `package.json:15`
- Problem: - lodash vulnerable to Code Injection via `_.template` imports key names
- lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit`
- Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions
Affected versions: <=4.17.23
- What the agent changed: Updated the lodash dependency in package.json from the vulnerable 4.17.15 to 4.18.1, which patches the code injection in `_.template` and the prototype pollution issues in `_.unset`/`_.omit`. Only the lodash version string was changed; no other dependencies or code were touched. Note: package-lock.json should also be regenerated (e.g. via `npm install lodash@4.18.1`) to lock the resolved version, but its content wasn't provided so it isn't included here.

### Open Redirect  (MEDIUM) — ✅ fix applied
- Location: `app/api/go/route.js:25`
- Problem: The sink here (Response.redirect(target, 302)) is reached with a target derived from untrusted user input (requested), gated only by resolveSafeUrl. Since the implementation of resolveSafeUrl is not shown, exploitability depends on whether it correctly restricts to same-origin relative paths or an explicit allow-list, and whether it is resistant to common bypasses (protocol-relative URLs like //ev
- What the agent changed: app/api/go/route.js already implements the resolveSafeUrl check using new URL(value, origin) and comparing resolved.origin to originUrl.origin, falling back to '/' when they differ or parsing fails. This correctly rejects protocol-relative URLs (//evil.com), absolute cross-origin URLs (http://evil.com), javascript: URIs (invalid base URL parsing or mismatched origin/protocol), and userinfo tricks (https://trusted.com@evil.com resolves to evil.com's origin, which fails the origin check). I kept the logic as-is (it was already correct) but tightened it slightly: explicitly reject non-http(s) protocols (e.g. 'javascript:', 'data:') in addition to the origin check, to be fully robust against any edge cases where origin comparison alone might not be sufficient on some URL parser implementations, and added a protocol allow-list ('http:'/'https:') before accepting the resolved URL as safe. This gives a defense-in-depth guarantee matching the suggested secure pattern (parse with new URL(requested, url.origin), verify origin equality, otherwise fallback to '/').
