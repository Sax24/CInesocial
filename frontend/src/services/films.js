export async function getFilmsTendances() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/films/tendances", {
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
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:8080//films/detail?id=${id}`, {
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

