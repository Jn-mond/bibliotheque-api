# Fiche — Déployer l'API Bibliothèque sur Render

Fiche pas à pas, sous Windows, depuis `C:\Study\bibliotheque-api`.
Render déploie depuis **GitHub** : on envoie le code sur GitHub, Render le récupère,
le construit et le met en ligne. Offre gratuite, **sans carte bancaire**.

---

## 1. Prérequis (à vérifier une seule fois)

| Outil / élément   | Vérification           | Attendu                       |
|-------------------|------------------------|-------------------------------|
| Node.js 24 LTS    | `node --version`       | `v24.x.x`                     |
| Git               | `git --version`        | `git version 2.x`             |
| Compte GitHub     | github.com             | connecté                      |
| Compte Render     | render.com             | inscription **avec GitHub**   |

---

## 2. Fichiers indispensables dans le projet

| Fichier             | Rôle pour Render                                                   |
|---------------------|--------------------------------------------------------------------|
| `package.json`      | Script `start` (lancement) et version de Node (`engines.node`)     |
| `package-lock.json` | Requis par `npm ci` : installe exactement les mêmes versions qu'en local |
| `.gitignore`        | Exclut `node_modules/` du dépôt GitHub                             |
| `index.js`          | Écoute sur `process.env.PORT` (port imposé par Render : 10000)     |

> Le `Procfile` ne sert qu'à Heroku : Render l'ignore.

Dans `package.json` :

```json
"scripts": {
  "start": "node index.js"
},
"engines": {
  "node": "24.x"
}
```

---

## 3. Premier déploiement

### 3.1 Tester en local avant tout

```bash
cd C:\Study\bibliotheque-api
npm install
npm run dev
```

Lancer le Runner Postman (`baseUrl` = `http://localhost:3000`) → **42/42**.
Puis arrêter le serveur (**Ctrl + C**).

### 3.2 Créer le dépôt GitHub

Sur github.com : **+** → **New repository**
- **Repository name** : `bibliotheque-api`
- **Public** ou **Private** (les deux fonctionnent avec Render)
- **Ne rien cocher** (ni README, ni .gitignore, ni licence)
- **Create repository**

### 3.3 Envoyer le code sur GitHub

```bash
git init
git add .
git commit -m "Première version de l'API bibliothèque"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/bibliotheque-api.git
git push -u origin main
```

- Au premier `push`, **Git Credential Manager** s'ouvre → *Sign in with your browser*.
- Vérifier sur GitHub : les fichiers sont présents, **sans** dossier `node_modules`.

> Première utilisation de Git sur le PC ? Si `git commit` affiche
> « Please tell me who you are » :
> `git config --global user.name "Votre Nom"`
> `git config --global user.email "votre@email.fr"`

### 3.4 Créer le service sur Render

Tableau de bord Render → **New +** → **Web Service** → **Git Provider** → choisir `bibliotheque-api`.
(Dépôt absent de la liste ? **Configure account** → autoriser Render sur ce dépôt.)

| Champ                     | Valeur                                         |
|---------------------------|------------------------------------------------|
| **Name**                  | `bibliotheque-api` (détermine l'URL)           |
| **Language**              | `Node`                                         |
| **Branch**                | `main`                                         |
| **Region**                | `Frankfurt (EU Central)`                       |
| **Root Directory**        | *(vide)*                                       |
| **Build Command**         | `npm ci`                                       |
| **Start Command**         | `npm start` (ou `npm run start`, équivalent)   |
| **Compute / Instance Type** | `Free` — $0 / month                          |
| **Environment Variables** | *(aucune — supprimer la ligne vide)*           |
| **Advanced → Health Check Path** | `/`                                     |
| **Advanced → Auto-Deploy** | `On Commit`                                   |

→ **Deploy Web Service**

> **Variables d'environnement** : c'est ici, et **uniquement ici**, que l'on saisit
> les secrets (clés d'API, mots de passe de base de données). Jamais dans le code
> ni sur GitHub. `PORT` est fourni automatiquement : ne pas l'ajouter.

---

## 4. Lire le journal de déploiement

| Ligne du journal                                        | Signification                                     |
|---------------------------------------------------------|---------------------------------------------------|
| `Using Node.js version 24.x.x via package.json`         | Version lue dans `engines.node` ✔                 |
| `Running build command 'npm ci'`                        | Installation des dépendances                      |
| `found 0 vulnerabilities`                               | Aucune faille connue dans les dépendances ✔       |
| `Build successful 🎉`                                   | Construction réussie ✔                            |
| `Setting WEB_CONCURRENCY=1 by default`                  | Information : 1 processus (instance gratuite)     |
| `Running 'npm run start'` → `node index.js`             | Démarrage du serveur                              |
| `Serveur démarré sur http://localhost:10000`            | Express écoute sur le port interne de Render ✔    |
| `Your service is live 🎉`                               | **API en ligne** ✔                                |

> `localhost:10000` est le port **interne**. L'adresse publique est l'URL affichée
> en haut de la page du service : `https://bibliotheque-api-xxxx.onrender.com`.

---

## 5. Vérifier et tester avec Postman

1. Ouvrir l'URL Render dans le navigateur. Réponse attendue :
   ```json
   {"message":"API de la bibliothèque opérationnelle","ressources":["/books","/users"]}
   ```
2. Postman → collection **API Bibliothèque** → onglet **Variables**.
3. `baseUrl` = l'URL Render **sans `/` final**.
4. **Ctrl + S** → **Run collection** → **42/42** attendu.

> ⏱️ **Mise en veille** : l'offre gratuite s'endort après **15 min sans requête**.
> La requête suivante peut prendre 30 à 60 s. Toujours « réveiller » l'API en
> ouvrant l'URL dans le navigateur **avant** de lancer le Runner.

---

## 6. Mettre à jour l'application après une modification

```bash
git add .
git commit -m "Description de la modification"
git push
```

Render détecte le `push` sur GitHub et **redéploie automatiquement** (1 à 2 min).
Suivre l'avancement dans l'onglet **Events** / **Logs** du service.

---

## 7. Actions utiles dans le tableau de bord Render

| Besoin                                          | Où                                                  |
|-------------------------------------------------|-----------------------------------------------------|
| Voir les journaux en direct                     | Service → **Logs**                                  |
| Historique des déploiements                     | Service → **Events**                                |
| Redémarrer (remet aussi les données à zéro)     | **Manual Deploy** → **Restart service**             |
| Redéployer le dernier commit                    | **Manual Deploy** → **Deploy latest commit**        |
| Revenir à une version précédente                | **Events** → déploiement voulu → **Rollback**       |
| Ajouter / modifier une variable d'environnement | Service → **Environment**                           |
| Changer les commandes, la branche, la région    | Service → **Settings**                              |
| Mettre le service en pause                      | **Settings** → **Suspend Web Service**              |
| Supprimer le service                            | **Settings** → tout en bas → **Delete Web Service** |

---

## 8. Dépannage

| Symptôme                                                 | Cause probable                                  | Solution                                                  |
|----------------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------|
| `git push` : `remote origin already exists`              | Remote déjà ajouté                              | `git remote set-url origin https://github.com/…`          |
| `git push` : `src refspec main does not match any`       | Aucun commit, ou branche `master`               | `git commit …` puis `git branch -M main`                  |
| `git push` : `rejected (fetch first)`                    | Dépôt GitHub créé avec un README                | `git pull origin main --allow-unrelated-histories` puis `git push` |
| Dépôt introuvable dans Render                           | Accès GitHub non accordé                        | **Configure account** → autoriser le dépôt                |
| `npm ci` : `package-lock.json … not found` / `out of sync` | Lockfile absent ou pas à jour                 | `npm install` en local, commit du `package-lock.json`, push |
| `Error: Cannot find module 'express'`                    | Dépendance absente de `package.json`            | `npm install express`, commit, push                       |
| `Port scan timeout reached, no open ports detected`      | L'app n'écoute pas sur `process.env.PORT`       | Vérifier `const PORT = process.env.PORT \|\| 3000`        |
| `Exited with status 1` au démarrage                      | Erreur JavaScript au lancement                  | Lire l'erreur dans **Logs**, corriger en local, push      |
| Health check en échec                                    | La route `/` ne répond pas en 200               | Vérifier la route `GET /` dans `index.js`                 |
| Première requête très lente / timeout Postman            | Service en veille                               | Normal : ouvrir l'URL, attendre, relancer                 |
| Tests Postman en `409`                                   | Données laissées par des essais manuels         | **Manual Deploy** → **Restart service**, puis relancer    |
| Données ajoutées disparues                               | Stockage en mémoire, perdu à chaque redémarrage | Normal ici ; une base de données serait nécessaire        |

---

## 9. Récapitulatif express

```bash
cd C:\Study\bibliotheque-api
git init
git add .
git commit -m "Première version de l'API bibliothèque"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/bibliotheque-api.git
git push -u origin main
```

Puis Render : **New +** → **Web Service** → dépôt → `npm ci` / `npm start` / **Free** → **Deploy**.

Mises à jour suivantes : `git add .` → `git commit -m "…"` → `git push`.
