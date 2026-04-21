import { getFilmById } from "./films";

const API_URL = import.meta.env.VITE_API_URL;
export async function getActivites() {
  const response = await fetch(API_URL+ "/activites", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des activités");
  }

  const activites = await response.json();

  const activitesEnrichies = await Promise.all(
    activites.map(async (activity) => {
      if (!activity.tmdb_id) {
        return {
          ...activity,
          cible: "Contenu inconnu",
        };
      }

      try {
        const film = await getFilmById(activity.tmdb_id);
        return {
          ...activity,
          cible: film.title || `Film #${activity.tmdb_id}`,
        };
      } catch {
        return {
          ...activity,
          cible: `Film #${activity.tmdb_id}`,
        };
      }
    })
  );

  return activitesEnrichies;
}