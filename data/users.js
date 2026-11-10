/**
 * Jeu de données d'exemple : les utilisateurs de la bibliothèque.
 *
 * Comme pour les livres, ces données sont stockées en mémoire et
 * réinitialisées à chaque redémarrage du serveur.
 *
 * Format d'un utilisateur :
 *   - nom    {string}    nom de famille
 *   - prenom {string}    prénom
 *   - email  {string}    identifiant unique, toujours stocké en minuscules
 *   - livres {string[]}  ISBN des livres actuellement empruntés
 */
export const users = [
    {
        nom: 'Doe',
        prenom: 'John',
        email: 'john.doe@studi.fr',
        livres: [],
    },
    {
        nom: 'Doe',
        prenom: 'Jane',
        email: 'jane.doe@studi.fr',
        livres: [],
    },
    {
        nom: 'Andrieu',
        prenom: 'Mickaël',
        email: 'mickael.andrieu@exemple.fr',
        livres: ['9782253004226', '9782266111560'],
    },
];
