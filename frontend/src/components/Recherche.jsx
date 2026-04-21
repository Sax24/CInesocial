import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchFilms } from "../services/films";

export default function Recherche() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [films, setFilms] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function fetchRecherche() {
      if (!query.trim()) {
        setFilms([]);
        setErreur("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErreur("");

        const data = await searchFilms(query);

        if (!ignore) {
          setFilms(Array.isArray(data.results) ? data.results : []);
        }
      } catch (error) {
        if (!ignore) {
          setErreur(error.message || "Erreur lors de la recherche");
          setFilms([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchRecherche();

    return () => {
      ignore = true;
    };
  }, [query]);

  const handleClick = (id) => {
    navigate("/film/details/" + id);
  };


  return (
    <section className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-violet-500">
            Recherche
          </p>
          <h2 className="text-3xl font-bold text-black md:text-4xl">
            {query.trim() ? `Résultats pour “${query}”` : "Rechercher un film"}
          </h2>
          {query.trim() && (
            <p className="mt-2 text-sm text-gray-500">
              {loading
                ? "Recherche en cours..."
                : `${films.length} résultat${films.length > 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        {!query.trim() ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Commence à taper dans la barre de recherche.
            </p>
          </div>
        ) : loading ? (
          <p className="p-6">Chargement...</p>
        ) : erreur ? (
          <p className="p-6 text-red-500">{erreur}</p>
        ) : films.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">Aucun film trouvé.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {films.map((item) => {
              const isInWatchlist = watchlist.includes(item.id);

              return (
                <div key={item.id} className="bg-white">
                  <div
                    onClick={() => handleClick(item.id)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_10px_10px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                  >
                    <div className="relative h-96 overflow-hidden">
                      {item.poster_path ? (
                        <img
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                          alt={item.title}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-300">
                          Pas d’image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />


                      <div className="absolute bottom-0 left-0 w-full p-4">
                        <h3 className="text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-300">
                          {item.release_date || "Date inconnue"}
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
        )}
      </div>
    </section>
  );
}