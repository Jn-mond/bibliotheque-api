# Fiche — Déployer l'API Bibliothèque sur Heroku

Fiche pas à pas, sous Windows, depuis `C:\Study\bibliotheque-api`.

---

## 1. Prérequis (à vérifier une seule fois)

| Outil / élément          | Vérification            | Attendu                          |
|--------------------------|-------------------------|----------------------------------|
| Node.js 24 LTS           | `node --version`        | `v24.x.x`                        |
| Git                      | `git --version`         | `git version 2.x`                |
| CLI Heroku               | `heroku --version`      | `heroku/11.x … node-v24…`        |
| Compte Heroku            | heroku.com              | connecté, CGU acceptées          |
| Moyen de paiement        | Account Settings → Billing | carte enregistrée (obligatoire) |
| Plan Eco (conseillé)     | Account Settings → Billing | abonnement Eco actif          |

Installer la CLI si besoin : `npm install -g heroku`, puis **rouvrir le terminal**.

> Pas de carte bancaire ? Voir les crédits du *GitHub Student Developer Pack*,
> ou déployer sur Render (gratuit, sans carte, aucun changement de code).

---

## 2. Fichiers indispensables dans le projet

| Fichier        | Rôle pour Heroku                                                   |
|----------------|--------------------------------------------------------------------|
| `package.json` | Heroku y détecte une app Node.js et lit la version de Node         |
| `package-lock.json` | Installe exactement les mêmes versions qu'en local            |
| `Procfile`     | Commande de démarrage : `web: node index.js`                       |
| `.gitignore`   | Exclut `node_modules/` (Heroku réinstalle lui-même les dépendances) |
| `index.js`     | Écoute sur `process.env.PORT` (port imposé par Heroku)             |

Dans `package.json`, la version de Node doit être **une seule version majeure** :

```json
"engines": {
  "node": "24.x"
}
```

> Une plage comme `22.x || 24.x || 26.x` fonctionne, mais Heroku la réduit
> d'office à la LTS active et affiche un avertissement. Autant être précis.

---

## 3. Premier déploiement

Se placer dans le dossier du projet :

```bash
cd C:\Study\bibliotheque-api
```

### 3.1 Tester en local avant tout

```bash
npm install
npm run dev
```

Lancer le Runner Postman → **42/42**. Puis arrêter le serveur (**Ctrl + C**).

### 3.2 Versionner le projet avec Git

```bash
git init
git add .
git commit -m "Première version de l'API bibliothèque"
git branch -M main
```

> Première utilisation de Git sur le PC ? Si `git commit` affiche
> « Please tell me who you are » :
> `git config --global user.name "Votre Nom"`
> `git config --global user.email "votre@email.fr"`

### 3.3 Créer l'application Heroku

```bash
heroku login
heroku create bibliotheque-api-xx
```

- `heroku login` : appuyer sur une touche, se connecter dans le navigateur, revenir au terminal.
- `xx` = vos initiales. Le nom doit être unique sur tout Heroku.
  Sans nom (`heroku create`), Heroku en génère un au hasard (ex. `boiling-woodland-52568`).
- La commande ajoute automatiquement un *remote* Git nommé `heroku`.
  Vérifier avec `git remote -v`.

### 3.4 Déployer

```bash
git push heroku main
```

### 3.5 Ouvrir l'application

```bash
heroku open
```

Le navigateur doit afficher :

```json
{"message":"API de la bibliothèque opérationnelle","ressources":["/books","/users"]}
```

---

## 4. Lire le journal du `git push`

Les lignes importantes, dans l'ordre :

| Ligne du journal                                   | Signification                                        |
|----------------------------------------------------|------------------------------------------------------|
| `Building on the Heroku-26 stack`                  | Système utilisé par Heroku pour construire l'app     |
| `Node.js app detected`                             | `package.json` trouvé à la racine ✔                  |
| `NODE_ENV=production`                              | Mode production activé automatiquement               |
| `engines.node (package.json): 24.x`                | Version demandée dans `package.json`                 |
| `Downloading and installing node 24.x.x`           | Version réellement installée                         |
| `Installing node modules` / `added N packages`     | `npm install` côté Heroku ✔                          |
| `Pruning devDependencies`                          | Suppression des dépendances de développement         |
| `Procfile declares types -> web`                   | `Procfile` trouvé, process `web` déclaré ✔           |
| `Released vN`                                      | Numéro de version du déploiement                     |
| `https://….herokuapp.com/ deployed to Heroku`      | **URL publique de l'API** ✔                          |
| `Verifying deploy... done.`                        | Déploiement terminé                                  |

Les lignes commençant par `!` sont des **avertissements** (ou des erreurs) : toujours les lire.

---

## 5. Tester la version en ligne avec Postman

1. Collection **API Bibliothèque** → onglet **Variables**.
2. `baseUrl` = l'URL Heroku **sans `/` final**
   (ex. `https://bibliotheque-api-xx-1234abcd.herokuapp.com`).
3. **Ctrl + S**, puis **Run collection** → **42/42** attendu.

> Si des tests échouent en `409` : des requêtes lancées à la main ont laissé
> des données. Redémarrer l'app (`heroku restart`) puis relancer le Runner.

---

## 6. Mettre à jour l'application après une modification

```bash
git add .
git commit -m "Description de la modification"
git push heroku main
```

Chaque `push` crée une nouvelle version (`Released v4`, `v5`…).

---

## 7. Commandes utiles

| Besoin                                    | Commande                                  |
|-------------------------------------------|-------------------------------------------|
| Voir les journaux en direct               | `heroku logs --tail` (Ctrl + C pour quitter) |
| État de l'application                     | `heroku ps`                               |
| Redémarrer (remet aussi les données à zéro) | `heroku restart`                        |
| Informations (URL, région, stack…)        | `heroku apps:info`                        |
| Définir une variable d'environnement      | `heroku config:set NOM=valeur`            |
| Lister les variables d'environnement      | `heroku config`                           |
| Revenir à la version précédente           | `heroku rollback`                         |
| Relier le dossier à une app existante (autre PC) | `heroku git:remote -a nom-de-l-app` |
| **Mettre l'app en pause** (stoppe la facturation du dyno) | `heroku ps:scale web=0`   |
| Relancer l'app après une pause            | `heroku ps:scale web=1`                   |
| **Supprimer définitivement l'app**        | `heroku apps:destroy -a nom-de-l-app`     |

> 💶 Heroku facture tant que l'app tourne (avec le plan Eco : forfait mensuel
> partagé entre toutes vos apps Eco, qui s'endorment après 30 min d'inactivité).
> Après l'évaluation, penser à `heroku ps:scale web=0` ou à supprimer l'app.

---

## 8. Dépannage

| Symptôme                                               | Cause probable                                   | Solution                                               |
|--------------------------------------------------------|--------------------------------------------------|--------------------------------------------------------|
| `'heroku' n'est pas reconnu…`                          | CLI non installée ou terminal pas rouvert        | `npm install -g heroku`, puis rouvrir le terminal      |
| `heroku create` refusé (« verify your account »)       | Pas de moyen de paiement                         | Ajouter une carte dans Billing                         |
| `Name … is already taken`                              | Nom d'app déjà utilisé                           | Choisir un autre nom                                   |
| `error: src refspec main does not match any`           | Aucun commit, ou branche nommée `master`         | `git commit …` puis `git branch -M main`               |
| `No default language could be detected`                | `package.json` absent de la racine du dépôt      | Lancer les commandes Git dans le dossier du projet     |
| `Could not resolve node version`                       | Version inconnue dans `engines.node`             | Mettre `"node": "24.x"`                                |
| Page « Application error » + `H10 App crashed` dans les logs | L'app plante au démarrage                  | `heroku logs --tail` pour lire l'erreur JavaScript     |
| `H14 No web processes running`                         | Dyno arrêté ou `Procfile` absent                 | Vérifier le `Procfile`, puis `heroku ps:scale web=1`   |
| `Error: Cannot find module 'express'`                  | Dépendance absente de `package.json`             | `npm install express`, commit, push                    |
| Première requête très lente (plan Eco)                 | L'app dormait                                    | Normal : réveil en quelques secondes                   |
| Données ajoutées disparues                             | Stockage en mémoire, redémarrage quotidien       | Normal ici ; une base de données serait nécessaire     |

---

## 9. Récapitulatif express

```bash
cd C:\Study\bibliotheque-api
git init
git add .
git commit -m "Première version de l'API bibliothèque"
git branch -M main
heroku login
heroku create bibliotheque-api-xx
git push heroku main
heroku open
```
