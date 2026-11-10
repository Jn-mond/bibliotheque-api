# API Bibliothèque

API REST de gestion d'une bibliothèque : livres et utilisateurs.
Réalisée avec Node.js et Express.

## Structure du projet

```
bibliotheque-api/
├── index.js                  # Point d'entrée : serveur, routes, gestion des erreurs
├── data/
│   ├── books.js              # Données des livres (en mémoire)
│   └── users.js              # Données des utilisateurs (en mémoire)
├── routes/
│   ├── books.js              # Routes /books
│   └── users.js              # Routes /users
├── postman_collection.json   # Collection de tests Postman
├── Procfile                  # Commande de démarrage pour Heroku
├── package.json
└── .gitignore
```

> Les données sont stockées en mémoire : elles reviennent à leur état
> initial à chaque redémarrage du serveur (et donc à chaque redémarrage
> quotidien des dynos Heroku).

## Installation et lancement en local

Prérequis : Node.js 22.

```bash
npm install
npm run dev
```

L'API est disponible sur http://localhost:3000.

## Routes

### Livres

| Méthode | URL             | Description                   | Succès |
|---------|-----------------|-------------------------------|--------|
| GET     | `/books`        | Liste tous les livres         | 200    |
| GET     | `/books/:isbn`  | Récupère un livre             | 200    |
| POST    | `/books`        | Ajoute un livre               | 201    |
| PUT     | `/books/:isbn`  | Remplace un livre             | 200    |
| DELETE  | `/books/:isbn`  | Supprime un livre             | 204    |

Exemple de corps (POST / PUT) :

```json
{
  "titre": "Livre 4",
  "auteur": "Auteur",
  "isbn": "9781234567897",
  "disponibilite": false,
  "date_retour": "2027-03-01"
}
```

Règles : `isbn` contient 10 ou 13 chiffres et ne peut pas être modifié par un PUT ;
`date_retour` est au format `AAAA-MM-JJ` ou `null` ; un livre disponible n'a pas de
date de retour ; un livre emprunté ne peut pas être supprimé.

### Utilisateurs

| Méthode | URL              | Description                   | Succès |
|---------|------------------|-------------------------------|--------|
| GET     | `/users`         | Liste tous les utilisateurs   | 200    |
| GET     | `/users/:email`  | Récupère un utilisateur       | 200    |
| POST    | `/users`         | Crée un utilisateur           | 201    |
| PUT     | `/users/:email`  | Remplace un utilisateur       | 200    |
| DELETE  | `/users/:email`  | Supprime un utilisateur       | 204    |

Exemple de corps (POST / PUT) :

```json
{
  "nom": "Martin",
  "prenom": "Paul",
  "email": "paul.martin@exemple.fr",
  "livres": ["9782070368228"]
}
```

Règles : l'email est unique et insensible à la casse ; `livres` ne contient que
des ISBN de livres existants.

### Codes d'erreur

| Code | Signification                                      |
|------|----------------------------------------------------|
| 400  | Données invalides ou JSON mal formé                |
| 404  | Ressource ou route introuvable                     |
| 409  | Conflit (doublon, livre emprunté…)                 |
| 413  | Corps de requête trop volumineux                   |
| 500  | Erreur interne du serveur                          |

## Tests avec Postman

1. Dans Postman : **Import** → choisir `postman_collection.json`.
2. Lancer le serveur (`npm run dev`).
3. Clic droit sur la collection **API Bibliothèque** → **Run collection** → **Run**.

La collection contient 28 requêtes et 42 vérifications automatiques. Elle supprime
tout ce qu'elle crée : on peut la relancer autant de fois que nécessaire.

Pour tester la version en ligne, modifier la variable `baseUrl` de la collection
(onglet **Variables**) avec l'URL Heroku.

## Déploiement sur Heroku

Prérequis : un compte Heroku, [Git](https://git-scm.com/) et la
[CLI Heroku](https://devcenter.heroku.com/articles/heroku-cli) installés.

```bash
git init
git add .
git commit -m "Première version de l'API bibliothèque"
git branch -M main
heroku login
heroku create nom-de-votre-app
git push heroku main
heroku open
```

Heroku détecte Node.js grâce au `package.json`, installe les dépendances, puis lance
la commande du `Procfile`. Le port est fourni par Heroku via la variable `PORT`.

En cas de problème, consulter les journaux :

```bash
heroku logs --tail
```
