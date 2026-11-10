/**
 * Routes de gestion des utilisateurs.
 * Ce routeur est monté sur le préfixe /users dans index.js :
 * les chemins ci-dessous sont donc relatifs à /users.
 *
 *   GET    /users          -> liste tous les utilisateurs
 *   GET    /users/:email   -> récupère un utilisateur
 *   POST   /users          -> crée un utilisateur
 *   PUT    /users/:email   -> remplace un utilisateur (tous les champs requis)
 *   DELETE /users/:email   -> supprime un utilisateur
 *
 * Remarque : l'email sert ici d'identifiant pour rester fidèle à l'exercice.
 * Dans un vrai projet, on utiliserait un identifiant technique (id) : un email
 * est une donnée personnelle (RGPD) qui finirait dans les logs et l'historique.
 */
import express from 'express';
import { users } from '../data/users.js';
import { books } from '../data/books.js';

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Fonctions utilitaires                                               */
/* ------------------------------------------------------------------ */

// Vérification simple du format d'un email (volontairement permissive :
// la seule vraie validation d'un email est l'envoi d'un message de confirmation)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Met un email en minuscules et retire les espaces autour, pour que
 * "John.Doe@studi.fr" et "john.doe@studi.fr" désignent le même utilisateur.
 * @param {string} email
 * @returns {string}
 */
const normalizeEmail = (email) => String(email).trim().toLowerCase();

/**
 * Recherche un utilisateur par son email (insensible à la casse).
 * @param {string} email
 * @returns {object|undefined} l'utilisateur trouvé, ou undefined
 */
const findUser = (email) => users.find((user) => user.email === normalizeEmail(email));

/**
 * Vérifie les données d'un utilisateur envoyées par le client.
 * @param {object} data - corps de la requête
 * @returns {string[]} la liste des erreurs (vide si les données sont valides)
 */
function validateUser(data) {
    const errors = [];

    if (typeof data.nom !== 'string' || !data.nom.trim()) {
        errors.push('nom est obligatoire');
    }
    if (typeof data.prenom !== 'string' || !data.prenom.trim()) {
        errors.push('prenom est obligatoire');
    }
    if (typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
        errors.push('email est obligatoire et doit être valide');
    }

    // "livres" est facultatif, mais s'il est fourni ce doit être un tableau d'ISBN
    if (data.livres !== undefined) {
        if (!Array.isArray(data.livres) || !data.livres.every((isbn) => typeof isbn === 'string')) {
            errors.push('livres doit être un tableau d\'ISBN');
        } else {
            // Intégrité des données : chaque ISBN doit correspondre à un livre existant
            const unknown = data.livres.filter((isbn) => !books.some((book) => book.isbn === isbn));
            if (unknown.length > 0) {
                errors.push(`livres contient des ISBN inconnus : ${unknown.join(', ')}`);
            }
            // Un même livre ne peut pas être emprunté deux fois par la même personne
            if (new Set(data.livres).size !== data.livres.length) {
                errors.push('livres contient des doublons');
            }
        }
    }

    return errors;
}

/**
 * Construit un objet utilisateur propre à partir du corps de la requête.
 * Seuls les champs connus sont conservés : un client ne peut donc pas
 * ajouter de propriétés arbitraires (ex. "role": "admin").
 * @param {object} data - données déjà validées
 * @returns {object}
 */
const buildUser = ({ nom, prenom, email, livres = [] }) => ({
    nom: nom.trim(),
    prenom: prenom.trim(),
    email: normalizeEmail(email),
    livres: [...livres], // copie, pour ne pas garder de référence au corps de la requête
});

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// GET /users : récupérer tous les utilisateurs
router.get('/', (req, res) => {
    res.json(users);
});

// GET /users/:email : récupérer un utilisateur
router.get('/:email', (req, res) => {
    const user = findUser(req.params.email);

    // Sans ce test, Express renverrait un 200 avec un corps vide
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json(user);
});

// POST /users : créer un utilisateur
router.post('/', (req, res) => {
    const errors = validateUser(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // L'email sert d'identifiant : il doit être unique
    if (findUser(req.body.email)) {
        return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const user = buildUser(req.body);
    users.push(user);

    // 201 Created + en-tête Location. encodeURIComponent protège le "@"
    // et tout autre caractère spécial dans l'URL.
    res.status(201)
        .location(`/users/${encodeURIComponent(user.email)}`)
        .json(user);
});

// PUT /users/:email : remplacer un utilisateur
router.put('/:email', (req, res) => {
    const user = findUser(req.params.email);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const errors = validateUser(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Si l'email change, le nouveau ne doit pas appartenir à un autre utilisateur
    const other = findUser(req.body.email);
    if (other && other !== user) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // On modifie l'objet existant pour garder la même référence dans le tableau
    Object.assign(user, buildUser(req.body));

    res.json(user);
});

// DELETE /users/:email : supprimer un utilisateur
router.delete('/:email', (req, res) => {
    const email = normalizeEmail(req.params.email);
    const index = users.findIndex((user) => user.email === email);

    // Indispensable : splice(-1, 1) supprimerait le DERNIER utilisateur du tableau
    if (index === -1) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    users.splice(index, 1);

    // 204 No Content : la suppression a réussi, il n'y a rien à renvoyer
    res.status(204).end();
});

export default router;
