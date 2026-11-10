/**
 * Routes de gestion des livres.
 * Ce routeur est monté sur le préfixe /books dans index.js :
 * les chemins ci-dessous sont donc relatifs à /books.
 *
 *   GET    /books          -> liste tous les livres
 *   GET    /books/:isbn    -> récupère un livre
 *   POST   /books          -> ajoute un livre
 *   PUT    /books/:isbn    -> remplace un livre (tous les champs requis)
 *   DELETE /books/:isbn    -> supprime un livre
 */
import express from 'express';
import { books } from '../data/books.js';
import { users } from '../data/users.js';

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Fonctions utilitaires                                               */
/* ------------------------------------------------------------------ */

// Un ISBN valide contient 10 ou 13 chiffres (sans tirets ni espaces)
const ISBN_REGEX = /^\d{10}(\d{3})?$/;

// Date au format ISO 8601 : AAAA-MM-JJ
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Recherche un livre par son ISBN.
 * @param {string} isbn
 * @returns {object|undefined} le livre trouvé, ou undefined
 */
const findBook = (isbn) => books.find((book) => book.isbn === isbn);

/**
 * Vérifie qu'une chaîne est une date ISO réelle.
 * Le test du format seul ne suffit pas : "2027-02-31" respecte le format
 * mais n'existe pas. On compare donc avec la date recalculée par JavaScript.
 * @param {string} value
 * @returns {boolean}
 */
function isValidIsoDate(value) {
    if (typeof value !== 'string' || !DATE_REGEX.test(value)) {
        return false;
    }
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/**
 * Vérifie les données d'un livre envoyées par le client.
 * @param {object} data - corps de la requête
 * @param {object} [options]
 * @param {boolean} [options.requireIsbn=true] - false pour le PUT, où l'ISBN vient de l'URL
 * @returns {string[]} la liste des erreurs (vide si les données sont valides)
 */
function validateBook(data, { requireIsbn = true } = {}) {
    const errors = [];

    if (requireIsbn && (typeof data.isbn !== 'string' || !ISBN_REGEX.test(data.isbn))) {
        errors.push('isbn est obligatoire et doit contenir 10 ou 13 chiffres');
    }
    if (typeof data.titre !== 'string' || !data.titre.trim()) {
        errors.push('titre est obligatoire');
    }
    if (typeof data.auteur !== 'string' || !data.auteur.trim()) {
        errors.push('auteur est obligatoire');
    }
    if (typeof data.disponibilite !== 'boolean') {
        errors.push('disponibilite est obligatoire et doit être un booléen');
    }

    // date_retour est facultative : absente ou null, elle vaut "pas de date"
    const hasReturnDate = data.date_retour !== undefined && data.date_retour !== null;
    if (hasReturnDate && !isValidIsoDate(data.date_retour)) {
        errors.push('date_retour doit être une date valide au format AAAA-MM-JJ, ou null');
    }

    // Règle métier : un livre disponible n'a pas de date de retour
    if (data.disponibilite === true && hasReturnDate) {
        errors.push('un livre disponible ne peut pas avoir de date_retour');
    }

    return errors;
}

/**
 * Construit un objet livre propre à partir du corps de la requête.
 * Seuls les champs connus sont conservés : un client ne peut pas
 * ajouter de propriétés arbitraires.
 * @param {object} data - données déjà validées
 * @returns {object}
 */
const buildBook = ({ titre, auteur, isbn, disponibilite, date_retour = null }) => ({
    titre: titre.trim(),
    auteur: auteur.trim(),
    isbn,
    disponibilite,
    date_retour,
});

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// GET /books : récupérer tous les livres
router.get('/', (req, res) => {
    res.json(books);
});

// GET /books/:isbn : récupérer un livre
router.get('/:isbn', (req, res) => {
    const book = findBook(req.params.isbn);

    if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
    }

    res.json(book);
});

// POST /books : ajouter un livre
router.post('/', (req, res) => {
    const errors = validateBook(req.body);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // L'ISBN sert d'identifiant : il doit être unique
    if (findBook(req.body.isbn)) {
        return res.status(409).json({ message: 'Un livre avec cet ISBN existe déjà' });
    }

    const book = buildBook(req.body);
    books.push(book);

    // 201 Created + en-tête Location indiquant l'URL de la nouvelle ressource
    res.status(201).location(`/books/${book.isbn}`).json(book);
});

// PUT /books/:isbn : remplacer un livre
router.put('/:isbn', (req, res) => {
    const book = findBook(req.params.isbn);
    if (!book) {
        return res.status(404).json({ message: 'Livre introuvable' });
    }

    const errors = validateBook(req.body, { requireIsbn: false });
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // L'ISBN est l'identifiant : il ne peut pas être modifié.
    // On ignore donc celui éventuellement présent dans le corps.
    Object.assign(book, buildBook({ ...req.body, isbn: book.isbn }));

    res.json(book);
});

// DELETE /books/:isbn : supprimer un livre
router.delete('/:isbn', (req, res) => {
    const index = books.findIndex((book) => book.isbn === req.params.isbn);

    // Indispensable : splice(-1, 1) supprimerait le DERNIER livre du tableau
    if (index === -1) {
        return res.status(404).json({ message: 'Livre introuvable' });
    }

    // Intégrité des données : on refuse de supprimer un livre encore emprunté,
    // sinon des utilisateurs garderaient un ISBN qui ne correspond à plus rien
    const borrowed = users.some((user) => user.livres.includes(req.params.isbn));
    if (borrowed) {
        return res.status(409).json({ message: 'Ce livre est emprunté et ne peut pas être supprimé' });
    }

    books.splice(index, 1);

    // 204 No Content : la suppression a réussi, il n'y a rien à renvoyer
    res.status(204).end();
});

export default router;
