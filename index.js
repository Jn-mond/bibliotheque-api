/**
 * Point d'entrée de l'API de la bibliothèque.
 *
 * Ce fichier :
 *   1. crée l'application Express ;
 *   2. branche les routeurs (livres, utilisateurs) ;
 *   3. gère les routes inconnues et les erreurs ;
 *   4. démarre le serveur.
 *
 * Lancement : npm start   (ou npm run dev pour redémarrer à chaque modification)
 */
import express from 'express';
import booksRouter from './routes/books.js';
import usersRouter from './routes/users.js';

const app = express();

// Le port peut être fourni par l'environnement (hébergeur, Docker…), 3000 par défaut
const PORT = process.env.PORT || 3000;

/* ------------------------------------------------------------------ */
/* Middlewares globaux                                                 */
/* ------------------------------------------------------------------ */

// Lit le corps des requêtes au format JSON et le place dans req.body.
// La limite de taille protège le serveur contre des corps de requête énormes.
app.use(express.json({ limit: '100kb' }));

// Masque l'en-tête "X-Powered-By: Express", qui révèle la technologie utilisée
app.disable('x-powered-by');

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// Route d'accueil : permet de vérifier rapidement que l'API répond
// (utile après un déploiement sur Heroku) et liste les ressources disponibles
app.get('/', (req, res) => {
    res.json({
        message: 'API de la bibliothèque opérationnelle',
        ressources: ['/books', '/users'],
    });
});

// Chaque routeur gère ses URL à partir du préfixe indiqué
app.use('/books', booksRouter);
app.use('/users', usersRouter);

/* ------------------------------------------------------------------ */
/* Gestion des erreurs (toujours après les routes)                     */
/* ------------------------------------------------------------------ */

// Toute requête qui n'a correspondu à aucune route arrive ici
app.use((req, res) => {
    res.status(404).json({ message: 'Route introuvable' });
});

// Gestionnaire d'erreurs global : Express le reconnaît à ses 4 paramètres,
// c'est pourquoi "next" doit rester déclaré même s'il n'est pas utilisé.
// Il évite de renvoyer au client une page HTML contenant la pile d'appels.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    // Corps de requête qui n'est pas du JSON valide
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'JSON invalide' });
    }

    // Corps de requête dépassant la limite fixée plus haut
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Corps de requête trop volumineux' });
    }

    // Erreur imprévue : on la journalise côté serveur, sans en donner le détail au client
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
});

/* ------------------------------------------------------------------ */
/* Démarrage du serveur                                                */
/* ------------------------------------------------------------------ */

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
