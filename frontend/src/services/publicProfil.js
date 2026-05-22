import { getFilmById } from "./films";

const API_URL = import.meta.env.VITE_API_URL;
export async function getPublicProfil(nom_u) {
  const response = await fetch(
    API_URL+`/utilisateurs/profil?nom_u=${encodeURIComponent(nom_u)}`
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer ce profil");
  }

  return response.json();
}

export async function getPublicCommentaires(nom_u) {
  const response = await fetch(
    API_URL+`/utilisateurs/commentaires?nom_u=${encodeURIComponent(nom_u)}`
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer les commentaires");
  }

  const data = await response.json();

  return Promise.all(
    data.map(async (commentaire) => {
      try {
        const film = await getFilmById(commentaire.tmdb_id);
        return {
          ...commentaire,
          film: film.title || `Film #${commentaire.tmdb_id}`,
        };
      } catch {
        return {
          ...commentaire,
          film: `Film #${commentaire.tmdb_id}`,
        };
      }
    })
  );
}