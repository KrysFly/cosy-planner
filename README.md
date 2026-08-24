# Cosy Planner

Outil de planification en ligne, façon bullet journal : interface pastel, animaux kawaii, tâches du jour, groupes et suivi optionnel des verres d’eau.

## Fonctions actuelles (bases)

- Connexion **Google** (si un identifiant client est configuré) ou **mode démo**
- Agenda mensuel illustré (renard, panda, paresseux, poussin, cochon, lapin, chat, loutre)
- Liste de tâches à droite : puces tâche / événement / note
- Groupes avec code d’invitation et plusieurs administrateurs
- Compteur de verres d’eau, activable si on veut
- Déploiement **GitLab Pages** pour tester l’app à plusieurs

Les données sont stockées dans le navigateur (`localStorage`). C’est suffisant pour poser l’UI et tester Pages. Un vrai partage entre appareils demandera un backend plus tard.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre l’URL Vite (souvent `http://localhost:5173`).

## Connexion Google

Le bouton Google n’apparaît que si `VITE_GOOGLE_CLIENT_ID` est fourni **au build** (local `.env` ou variable CI/CD). Il n’existe pas de MCP Google Admin dans Cursor pour créer ce client à ta place : ça se fait dans Google Cloud.

1. Ouvre [Google Cloud Console → Identifiants](https://console.cloud.google.com/apis/credentials).
2. Crée un projet (ex. `cosy-planner`) si besoin.
3. **Écran de consentement OAuth** : type *Externe*, app en test, ajoute les comptes Google autorisés à tester.
4. **Créer des identifiants → ID client OAuth → Application Web**.
5. Origines JavaScript autorisées (sans chemin) :
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - l’origine GitLab Pages, par ex. `https://krysfly.gitlab.io` **et** le domaine unique `https://….gitlab.io` affiché dans **Deploy → Pages**
6. Pas besoin d’URI de redirection pour le bouton Sign in with Google (GIS).
7. Copie l’ID client (`….apps.googleusercontent.com`) :

Localement, fichier `.env` (jamais commité) :

```
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Puis `npm run dev`.

Sur GitLab : **Settings → CI/CD → Variables** → `VITE_GOOGLE_CLIENT_ID`  
Décoche *Protect variable* si le pipeline `main` ne la voit pas. Ne la masque pas : elle est publique dans le JavaScript du site. Relance le pipeline après l’avoir ajoutée (nouveau build Pages).

Sans cette variable, **Continuer en mode démo** reste disponible.

## GitLab Pages

Le pipeline construit l’app et publie le dossier `public` sur la branche par défaut.

URL typique : `https://krysfly.gitlab.io/cosy-planner/` (ou le domaine unique du projet).

Active Pages si besoin : **Deploy → Pages**. Après le premier pipeline vert sur `main`, le site est testable par toute l’équipe.

## MCP Cursor (GitLab vs Google)

- **GitLab** : le MCP officiel GitLab dans Cursor peut lister pipelines, variables, issues et MR une fois authentifié (**Settings → MCP**). Ici l’auth MCP a renvoyé une erreur 404 : reconnecte le serveur GitLab dans Cursor, puis on pourra piloter Pages/CI depuis le chat.
- **Google Admin / Cloud** : aucun MCP Google n’est branché dans cette session. L’admin OAuth reste la console Google Cloud (ou `gcloud`, non installé ici).
