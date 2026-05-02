# DIG — Progressive Web App

Version PWA prête à déployer. L'app peut être installée sur iPhone / Android comme une vraie app.

## Contenu du dossier

- `index.html` — l'app DIG (renommée depuis dig_app.html)
- `manifest.json` — config PWA (nom, icônes, couleurs)
- `service-worker.js` — cache offline + stratégies réseau
- `icon-192.png` / `icon-512.png` — icônes de l'app
- `README.md` — ce fichier

## Déploiement rapide (Netlify Drop) — 2 minutes

1. Va sur **https://app.netlify.com/drop**
2. Glisse-dépose **tout le dossier** (pas seulement le HTML)
3. Tu obtiens une URL HTTPS du genre `https://random-name.netlify.app`
4. Ouvre cette URL sur ton téléphone

## Installer l'app sur ton téléphone

### Sur Android (Chrome)
1. Ouvre l'URL dans Chrome
2. Une bannière "Ajouter à l'écran d'accueil" apparaît, ou
3. Menu (⋮) → "Installer l'application" / "Ajouter à l'écran d'accueil"
4. L'icône DIG apparaît sur ton écran, comme une vraie app

### Sur iOS (Safari)
1. Ouvre l'URL dans Safari (pas Chrome — iOS limite Chrome)
2. Bouton Partager (icône carré avec flèche)
3. "Sur l'écran d'accueil" / "Add to Home Screen"
4. L'app DIG s'ouvre en plein écran sans la barre Safari

## Ce qui marche en PWA

✓ Installation depuis le navigateur, sans App Store  
✓ Icône sur l'écran d'accueil  
✓ Mode plein écran (pas de barre de navigateur)  
✓ Cache offline (l'app marche sans connexion pour ce qui a été visité)  
✓ Caméra (scan code-barre) — nécessite HTTPS, qu'on a avec Netlify  
✓ Géolocalisation (map)  
✓ localStorage (données persistées par utilisateur)  
✓ Mises à jour instantanées (tu push, c'est en ligne immédiatement)  

## Ce qui ne marche pas encore

✗ **Sync entre appareils** — chaque téléphone a sa propre base locale  
✗ **Recherche d'amis réelle** — pas de base utilisateurs partagée  
✗ **Notifications push** — code prêt mais nécessite un serveur  
✗ **Auth email/SMS réelle** — actuellement c'est une simulation, le code est prêt à se brancher  

→ Ces points seront résolus avec **Supabase** (étape suivante).

## Prochaines étapes

### Étape 2 — Backend Supabase (semaine 2-3)
- Auth email/SMS via Supabase Auth (gratuit, illimité)
- Base de données Postgres pour les items, profils, communautés
- Sync temps réel entre appareils
- Recherche d'amis fonctionnelle
- Migration de localStorage vers la DB

### Étape 3 — Capacitor (semaine 4-5)
- Empaqueter la PWA dans une app native Android/iOS
- Publication Play Store (25$ une fois)
- Publication App Store (99$/an, nécessite un Mac)
- Accès aux fonctions natives complètes (notifications push, biométrie, partage natif)

## Test rapide local

Pour tester localement avant déploiement, il faut un serveur HTTPS local (le service worker ne marche pas avec `file://`).

Le plus simple :

```bash
# Si tu as Python installé
python3 -m http.server 8000

# Puis ouvre http://localhost:8000
# (le SW ne s'enregistrera pas en HTTP mais le reste marche)
```

Pour tester avec HTTPS local : utilise `ngrok` ou `localtunnel`, ou pousse sur Netlify directement (plus simple).

## Mise à jour

Quand tu modifies `index.html` :
1. Re-glisse le dossier sur Netlify Drop (il garde la même URL si tu te connectes avec un compte gratuit)
2. Les utilisateurs récupèrent la nouvelle version au prochain ouvrage de l'app
3. Si tu veux forcer la MAJ immédiate, change `CACHE_VERSION` dans `service-worker.js`
