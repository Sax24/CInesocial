import { getValidToken } from "../utils/auth";
import { getWatchlist } from "./watchlist";
import { getFilmById } from "./films";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function getUtilisateurs() {
  const response = await fetch("http://localhost:8080/get/utilisateurs", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les utilisateurs");
  }

  return response.json();
}

function getCurrentAuthUser() {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const payload = decodeJwt(token);

  if (!payload) {
    throw new Error("Token invalide");
  }

  return {
    user_id: payload.user_id,
    nom_u: payload.nom_u,
  };
}

export async function getProfilData() {
  const authUser = getCurrentAuthUser();

  const [utilisateurs, watchlistRaw, commentairesRaw, notesRaw] =
    await Promise.all([
      getUtilisateurs(),
      getWatchlist(),
      getMesCommentaires(),
      getMesNotes(),
    ]);

  const utilisateurTrouve =
    (Array.isArray(utilisateurs)
      ? utilisateurs.find(
          (u) =>
            Number(u.id) === Number(authUser.user_id) ||
            u.nom_u === authUser.nom_u
        )
      : null) || null;

  const utilisateur = {
    nom_u: utilisateurTrouve?.nom_u || authUser.nom_u || "Utilisateur",
    email: utilisateurTrouve?.email || "Email non disponible",
    cree_le: utilisateurTrouve?.cree_le || null,
  };

  const watchlistBase = Array.isArray(watchlistRaw) ? watchlistRaw : [];
  const commentairesBase = Array.isArray(commentairesRaw) ? commentairesRaw : [];
  const notesBase = Array.isArray(notesRaw) ? notesRaw : [];

  const watchlist = await Promise.all(
    watchlistBase.slice(0, 12).map(async (item) => {
      try {
        const film = await getFilmById(item.tmdb_id);

        return {
          id: item.tmdb_id,
          title: film.title || `Film #${item.tmdb_id}`,
          poster_path: film.poster_path || null,
          statut: item.statut || "a_voir",
        };
      } catch {
        return {
          id: item.tmdb_id,
          title: `Film #${item.tmdb_id}`,
          poster_path: null,
          statut: item.statut || "a_voir",
        };
      }
    })
  );

  const formatTempsEcoule = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const heures = Math.floor(diffMs / (1000 * 60 * 60));
    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "à l’instant";
    if (minutes < 60) return `${minutes}min`;
    if (heures < 24) return `${heures}h`;
    if (jours < 7) return `${jours}j`;

    return date.toLocaleDateString("fr-FR");
  };

  const commentaires = await Promise.all(
    commentairesBase.slice(0, 5).map(async (commentaire) => {
      try {
        const film = await getFilmById(commentaire.tmdb_id);

        return {
          id: commentaire.id,
          film: film.title || `Film #${commentaire.tmdb_id}`,
          texte: commentaire.contenu,
          date: formatTempsEcoule(commentaire.cree_le),
          likes: commentaire.likes ?? 0,
        };
      } catch {
        return {
          id: commentaire.id,
          film: `Film #${commentaire.tmdb_id}`,
          texte: commentaire.contenu,
          date: formatTempsEcoule(commentaire.cree_le),
          likes: commentaire.likes ?? 0,
        };
      }
    })
  );

  return {
    utilisateur,
    stats: {
      notes: notesBase.length,
      commentaires: commentairesBase.length,
      watchlist: watchlistBase.length,
    },
    watchlist,
    commentaires,
  };
}


async function getMesCommentaires() {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch("http://localhost:8080/profil/commentaires", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Impossible de récupérer les commentaires du profil"
    );
  }

  return response.json();
}

async function getMesNotes() {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch("http://localhost:8080/profil/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Impossible de récupérer les notes du profil");
  }

  return response.json();
}