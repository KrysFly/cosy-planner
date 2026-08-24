# Cosy Planner

Outil de planification en ligne, façon bullet journal : interface pastel, animaux kawaii, tâches du jour, groupes et suivi optionnel des verres d’eau.

## Fonctions actuelles (bases)

- Connexion **Google** (si un identifiant client est configuré) ou **mode démo**
- Agenda mensuel illustré (renard, panda, paresseux, poussin, cochon, lapin, chat, loutre)
- Liste de tâches à droite : puces tâche / événement / note
- Groupes avec code d’invitation et plusieurs administrateurs
- Compteur de verres d’eau, activable si on veut
- Déploiement **GitHub Pages** (pipeline Actions) — GitLab Pages en secours si des minutes CI restent

Les données sont stockées dans le navigateur (`localStorage`). C’est suffisant pour poser l’UI et tester Pages. Un vrai partage entre appareils demandera un backend plus tard.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre l’URL Vite (souvent `http://localhost:5173`).

## Connexion Google

Le bouton Google n’apparaît que si `VITE_GOOGLE_CLIENT_ID` est fourni **au build** (local `.env` ou variable CI).

1. Ouvre [Google Cloud Console → Identifiants](https://console.cloud.google.com/apis/credentials).
2. Crée un projet (ex. `cosy-planner`) si besoin.
3. **Écran de consentement OAuth** : type *Externe*, app en test, ajoute les comptes Google autorisés à tester.
4. **Créer des identifiants → ID client OAuth → Application Web**.
5. Origines JavaScript autorisées (sans chemin) :
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `https://krysfly.github.io` ← site GitHub Pages
6. Pas besoin d’URI de redirection pour le bouton Sign in with Google (GIS).
7. Copie l’ID client (`….apps.googleusercontent.com`) :

Localement, fichier `.env` (jamais commité) :

```
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Puis `npm run dev`.

Sur **GitHub** : **Settings → Secrets and variables → Actions → Variables** → `VITE_GOOGLE_CLIENT_ID`  
(variable de dépôt, pas secrète : elle est publique dans le JS). Relance le workflow après l’avoir ajoutée.

Sans cette variable, **Continuer en mode démo** reste disponible.

## GitHub Pages

Pipeline : `.github/workflows/pages.yml` (build Vite → artifact → deploy Pages).

URL : **https://krysfly.github.io/cosy-planner/**

Après le premier push sur `main` :
1. **Settings → Pages** → Source = **GitHub Actions**
2. Attendre le workflow vert dans l’onglet **Actions**

## GitLab (historique)

Le remote `origin` peut rester GitLab. Le déploiement actif pour l’équipe est GitHub Pages tant que le quota CI GitLab Free est saturé (`ci_quota_exceeded`).

## Remotes

```bash
git remote -v
# origin  → GitLab (optionnel)
# github  → https://github.com/KrysFly/cosy-planner.git
```
