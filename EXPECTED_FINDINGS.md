# Expected Findings

| Vuln ID | Type / Description | Fichier | Scanner attendu | Gravité attendue |
|---------|-------------------|---------|-----------------|------------------|
| VULN-1  | Secret en dur (Fake API Key) | `lib/config.js` | Gitleaks / Semgrep | Critique |
| VULN-2  | Dépendances vulnérables (lodash, axios) | `package.json` | npm audit / Snyk | Haute |
| VULN-3  | Code Injection (eval) | `app/api/calc/route.js` | Semgrep / DAST | Critique |
| VULN-4  | Injection SQL | `app/api/user/route.js` | Semgrep / DAST | Critique |
| VULN-5  | Cross-Site Scripting (XSS) | `app/profile/page.js` | Semgrep / DAST | Haute |
| VULN-6  | SSRF (fetch sur paramètre) | `app/api/preview/route.js` | Semgrep / DAST | Haute |
| VULN-7  | Route API sans authentification | `app/api/admin/users/route.js` | DAST / Tests passifs | Moyenne |
| VULN-8  | Prompt Injection + HTML Non échappé | `app/api/chat/route.js` | Semgrep / DAST AI | Haute |
| VULN-9  | Open Redirect | `app/api/go/route.js` | Semgrep / DAST | Moyenne |
| VULN-10 | Cookie de session non sécurisé | `app/api/login/route.js` | Tests passifs / ZAP | Basse / Moyenne |
| VULN-11 | Absence d'en-têtes de sécurité | `next.config.js` | Tests passifs | Basse |
| VULN-12 | Crypto faible (MD5 + Math.random) | `lib/hash.js` | Semgrep | Moyenne |

*(Note : La clé révoquée de `lib/legacy.js` doit être remontée par l'historique Git via Gitleaks mais signalée comme "à révoquer" ou avec une priorité adaptée puisqu'elle n'est plus dans la branche principale).*
