# Cosy Planner

Outil de planification en ligne, façon bullet journal : interface pastel, animaux kawaii, tâches du jour, groupes et suivi optionnel des verres d’eau.

## Fonctions actuelles (bases)

- Connexion **Google** (si un identifiant client est configuré) ou **mode démo**
- Agenda mensuel illustré : **ourson**, **renard**, **abeille** et une cinquantaine d’animaux kawaii aux pastels assortis
- Liste de tâches à droite : puces tâche / événement / note
- Fréquence **une fois / quotidien / hebdomadaire / mensuel**, avec début et fin optionnels
- Icônes mignonnes (ou emoji libre) et **couleur** au choix, visibles sur l’agenda
- Groupes avec code d’invitation et plusieurs administrateurs
- Compteur de verres d’eau, activable si on veut
- Déploiement **GitHub Pages** (pipeline Actions) — GitLab Pages en secours si des minutes CI restent

Avec un compte **Google** et Firebase configuré, tout le planner (tâches, groupes, eau, totem) est synchronisé dans **Cloud Firestore**. Le **mode démo** reste en `localStorage` sur l’appareil.

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

## Firebase / Cloud Firestore

La sync cloud (comptes Google) utilise Firebase Auth + Firestore.

1. Ouvre [Firebase Console](https://console.firebase.google.com/) et crée (ou réutilise) un projet — idéalement le même GCP que l’OAuth Google.
2. **Authentication → Sign-in method → Google** : activer. Domaines autorisés : `localhost`, `krysfly.github.io`.
3. **Firestore Database** : créer une base (mode production), puis coller les règles de [`firestore.rules`](firestore.rules) (chaque user ne lit/écrit que `users/{uid}`).
4. **Paramètres du projet → Vos applications → Web** : enregistrer l’app et copier la config.

Localement, complète `.env` (voir `.env.example`) :

```
VITE_FIREBASE_API_KEY=…
VITE_FIREBASE_AUTH_DOMAIN=….firebaseapp.com
VITE_FIREBASE_PROJECT_ID=…
VITE_FIREBASE_STORAGE_BUCKET=….appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=…
VITE_FIREBASE_APP_ID=…
```

Sur **GitHub** : **Settings → Secrets and variables → Actions → Variables**, ajoute les mêmes `VITE_FIREBASE_*` (publiques dans le JS buildé). Relance le workflow Pages.

Sans Firebase, la connexion Google peut s’afficher mais la sync cloud reste inactive ; le mode démo fonctionne toujours.

## GitHub Pages

Pipeline : `.github/workflows/pages.yml` (build Vite → artifact → deploy Pages).

URL : **https://krysfly.github.io/cosy-planner/**

Le dépôt doit être **public** (GitHub Free) ou un plan Pro pour activer Pages.  
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
