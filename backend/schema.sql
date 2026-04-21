CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom_u VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    tmdb_id INT NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 5),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilisateur_id, tmdb_id)
);

CREATE TABLE commentaires (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    tmdb_id INT NOT NULL,
    contenu TEXT NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_commentaire_id INT REFERENCES commentaires(id) ON DELETE CASCADE
);

CREATE TABLE liste_a_voir (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    tmdb_id INT NOT NULL,
    ajoute_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilisateur_id, tmdb_id),
    statut VARCHAR(20) NOT NULL DEFAULT 'a_voir',
    CHECK (statut IN ('a_voir', 'en_cours', 'vu'))
);

CREATE TABLE likes_commentaires (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    commentaire_id INT REFERENCES commentaires(id) ON DELETE CASCADE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(utilisateur_id, commentaire_id)
);

CREATE INDEX idx_commentaires_tmdb_id ON commentaires(tmdb_id);
CREATE INDEX idx_commentaires_parent_id ON commentaires(parent_commentaire_id);
CREATE INDEX idx_likes_commentaires_commentaire_id ON likes_commentaires(commentaire_id);