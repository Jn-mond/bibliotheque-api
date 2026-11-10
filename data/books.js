/**
 * Jeu de données d'exemple : les livres de la bibliothèque.
 *
 * Ces données sont stockées en mémoire : elles sont réinitialisées à chaque
 * redémarrage du serveur. Dans un vrai projet, elles viendraient d'une base
 * de données (PostgreSQL, MongoDB…).
 *
 * Format d'un livre :
 *   - titre         {string}       titre du livre
 *   - auteur        {string}       nom de l'auteur
 *   - isbn          {string}       identifiant unique, 10 ou 13 chiffres
 *   - disponibilite {boolean}      true si le livre peut être emprunté
 *   - date_retour   {string|null}  date de retour prévue au format ISO (AAAA-MM-JJ),
 *                                  null si le livre est disponible
 */
export const books = [
    {
        titre: 'Livre 1',
        auteur: 'Jonathan',
        isbn: '9782070368228',
        disponibilite: true,
        date_retour: null,
    },
    {
        titre: 'Livre 2',
        auteur: 'Elise',
        isbn: '9782253004226',
        disponibilite: false,
        date_retour: '2028-01-01',
    },
    {
        titre: 'Livre 3',
        auteur: 'Zineb',
        isbn: '9782266111560',
        disponibilite: false,
        date_retour: '2027-06-15',
    },
];
