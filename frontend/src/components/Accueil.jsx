import { useState, useEffect } from "react";
import { getFilmsTendances } from "../services/films";

export default function Accueil() {
  const [watchlist, setWatchlist] = useState([]);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const filmsParVue = 4;

  const handleClick = (titre) => {
    alert(`Tu as cliqué sur ${titre}`);
  };

  const toggleWatchlist = (e, filmId) => {
    e.stopPropagation();

    setWatchlist((prev) =>
      prev.includes(filmId)
        ? prev.filter((id) => id !== filmId)
        : [...prev, filmId]
    );
  };

  useEffect(() => {
    async function fetchFilms() {
      try {
        const data = await getFilmsTendances();
        setFilms(data.results);
      } catch (error) {
        setErreur(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFilms();
  }, []);

  const maxIndex = Math.max(0, films.length - filmsParVue);

  const suivant = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const precedent = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  if (erreur) {
    return <p className="p-6 text-red-500">{erreur}</p>;
  }

  return (
    <section className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-violet-400">
              Trending now
            </p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Découvrez les films tendances
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={precedent}
              disabled={currentIndex === 0}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ←
            </button>
            <button
              onClick={suivant}
              disabled={currentIndex >= maxIndex}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 25}%)`,
            }}
          >
            {films.map((item) => {
              const isInWatchlist = watchlist.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="w-1/4 shrink-0 px-3"
                >
                  <div
                    onClick={() => handleClick(item.title)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                  >
                    <div className="relative h-96 overflow-hidden">
                      <img
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={item.title}
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />

                      <button
                        type="button"
                        onClick={(e) => toggleWatchlist(e, item.id)}
                        aria-label={
                          isInWatchlist
                            ? `Retirer ${item.title} de la watchlist`
                            : `Ajouter ${item.title} à la watchlist`
                        }
                        className={`absolute right-3 top-3 z-10 flex items-center justify-center rounded-full border p-2 backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                          isInWatchlist
                            ? "border-violet-400/40 bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                            : "border-white/20 bg-black/30 text-white/90"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={isInWatchlist ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 3H7a2 2 0 0 0-2 2v16l7-4 7 4V5a2 2 0 0 0-2-2z"
                          />
                        </svg>
                      </button>

                      <div className="absolute bottom-0 left-0 w-full p-4">
                        <h3 className="text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-300">
                          {item.release_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center px-4 py-4">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-zinc-300 transition-colors duration-300 group-hover:bg-violet-500/20 group-hover:text-violet-200">
                        Voir plus
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}