# VibeAudit Cible 🎯

**⚠️ AVERTISSEMENT : NE JAMAIS UTILISER EN PRODUCTION ⚠️**

Cette application est volontairement truffée de failles de sécurité (XSS, SQLi, SSRF, Secrets, etc.). Elle a été conçue **uniquement** pour tester des outils d'audit de sécurité dans le cadre d'un hackathon.

## Déploiement sur Vercel
Vous pouvez déployer ce projet sur Vercel pour tester les scanners DAST ou IAST. 
Par défaut, toutes les routes dangereuses renvoient une erreur `404 Not Found` pour protéger Internet.

**Pour activer le mode vulnérable (seulement en local ou environnement strictement contrôlé) :**
Définissez la variable d'environnement `DEMO_UNSAFE=1` dans Vercel ou dans un fichier `.env.local`. **Ne configurez jamais cette variable publiquement.**
