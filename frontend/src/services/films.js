import { getValidToken} from "../utils/auth";
const API_URL = import.meta.env.VITE_API_URL;

export async function getFilmsTendances() {
    const token = getValidToken();
  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch(API_URL+"/films/tendances", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des films tendances");
  }

  return response.json();
}

export async function getFilmById(id) {
    const token = getValidToken();
  if (!token) {
    throw new Error("Session expirée");
  }


  const response = await fetch(API_URL+`/films/detail?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du film");
  }

  return response.json();
}

export async function searchFilms(query) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch(
    API_URL+`/films/recherche?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erreur lors de la recherche des films");
  }

  return response.json();
}

