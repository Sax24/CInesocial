import { useEffect, useMemo, useState } from "react";
import {
  getWatchlist,
  updateWatchlistStatut,
  deleteWatchlist,
} from "../services/watchlist";
import { getFilmById } from "../services/films";
import { useNavigate } from "react-router-dom";

const filters = [
  { key: "all", label: "Tous" },
  { key: "a_voir", label: "À voir" },
  { key: "en_cours", label: "En cours" },
  { key: "vu", label: "Vu" },
];

const transitions = {
  a_voir: ["en_cours", "vu"],
  en_cours: ["a_voir", "vu"],
  vu: ["a_voir", "en_cours"],
};

function statutLabel(statut) {
  if (statut === "a_voir") return "À voir";
  if (statut === "en_cours") return "En cours";
  if (statut === "vu") return "Vu";
  return statut;
}

function statutClasses(statut) {
  if (statut === "a_voir") {
    return "bg-violet-100 text-violet-700 border-violet-200";
  }
  if (statut === "en_cours") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function getStatutsDisponibles(statutActuel) {
  return transitions[statutActuel] || [];
}

export default function Watchlist() {
  const [films, setFilms] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [hoveredFilmId, setHoveredFilmId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWatchlistData() {
      try {
        setLoading(true);
        setErreur("");

        const watchlistResponse = await getWatchlist();
        const watchlist = Array.isArray(watchlistResponse)
          ? watchlistResponse
          : [];

        const filmsComplets = await Promise.all(
          watchlist.map(async (item) => {
            const film = await getFilmById(item.tmdb_id);

            return {
              id: item.tmdb_id,
              tmdb_id: item.tmdb_id,
              title: film.title,
              poster_path: film.poster_path,
              genres: film.genres?.map((genre) => genre.name) || [],
              vote_average: film.vote_average,
              statut: item.statut,
              ajoute_le: item.ajoute_le,
            };
          })
        );

        setFilms(filmsComplets);
      } catch (error) {
        setErreur(error.message || "Erreur lors du chargement de la watchlist");
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlistData();
  }, []);

  async function handleStatutChange(film, nouveauStatut) {
    if (!nouveauStatut || nouveauStatut === film.statut) return;

    try {
      await updateWatchlistStatut(film.tmdb_id, nouveauStatut);

      setFilms((prevFilms) =>
        prevFilms.map((f) =>
          f.id === film.id ? { ...f, statut: nouveauStatut } : f
        )
      );

      setHoveredFilmId(null);
      setErreur("");
    } catch (error) {
      setErreur(error.message || "Erreur lors de la modification du statut");
    }
  }

  function askRemoveFromWatchlist(film) {
    setFilmToDelete(film);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setFilmToDelete(null);
  }

  async function confirmDeleteWatchlist() {
    if (!filmToDelete) return;

    try {
      setIsDeleting(true);
      await deleteWatchlist(filmToDelete.tmdb_id);

      setFilms((prevFilms) =>
        prevFilms.filter((f) => f.id !== filmToDelete.id)
      );

      setShowDeleteModal(false);
      setFilmToDelete(null);
      setErreur("");
    } catch (error) {
      setErreur(
        error.message || "Erreur lors de la suppression du film de la watchlist"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const filmsFiltres = useMemo(() => {
    return films.filter((film) => {
      const matchFilter =
        activeFilter === "all" ? true : film.statut === activeFilter;

      const matchSearch = film.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [films, activeFilter, search]);

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  if (erreur) {
    return <p className="p-6 text-red-500">{erreur}</p>;
  }

  return (
    <>
      <section className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="text-left">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-violet-500">
                Ma liste
              </p>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Watchlist
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {films.length} film{films.length > 1 ? "s" : ""} sauvegardé
                {films.length > 1 ? "s" : ""}
              </p>
            </div>

            
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                    ? "border-violet-500 bg-violet-600 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:text-violet-600"
                    }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {filmsFiltres.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                <svg
                  className="h-8 w-8 text-violet-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                Aucun film trouvé
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Essaie un autre filtre ou ajoute des films à ta watchlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filmsFiltres.map((film) => (
                <article
                  key={film.id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={
                        film.poster_path
                          ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
                          : "https://via.placeholder.com/500x750?text=No+Image"
                      }
                      alt={film.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                    <div
                      className="absolute left-4 top-4"
                      onMouseEnter={() => setHoveredFilmId(film.id)}
                      onMouseLeave={() => setHoveredFilmId(null)}
                    >
                      {hoveredFilmId === film.id ? (
                        <select
                          defaultValue=""
                          onChange={(e) => handleStatutChange(film, e.target.value)}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold outline-none ${statutClasses(
                            film.statut
                          )}`}
                        >
                          <option value="" disabled>
                            {statutLabel(film.statut)}
                          </option>

                          {getStatutsDisponibles(film.statut).map((statut) => (
                            <option key={statut} value={statut}>
                              {statutLabel(statut)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statutClasses(
                            film.statut
                          )}`}
                        >
                          {statutLabel(film.statut)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => askRemoveFromWatchlist(film)}
                      className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition hover:scale-110 hover:bg-red-50 hover:text-red-500"
                      aria-label="Retirer de la watchlist"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>

                    <div className="absolute bottom-0 left-0 w-full p-4 text-left">
                      <h2 className="line-clamp-2 text-lg font-bold text-white">
                        {film.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 text-left">
                    <div className="mb-3 flex min-h-[56px] flex-wrap content-start gap-2">
                      {film.genres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Note moyenne</span>
                      <span className="font-semibold text-gray-800">
                        ⭐ {Number(film.vote_average || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button
                        className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                        onClick={() => navigate("/film/details/" + film.id)}
                      >
                        Voir détail
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {showDeleteModal && filmToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">


            <h2 className="text-center text-xl font-bold text-gray-900">
              Supprimer ce film 
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-500">
              Etes-vous sûr de vouloir supprimer?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Annuler
              </button>

              <button
                onClick={confirmDeleteWatchlist}
                disabled={isDeleting}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}