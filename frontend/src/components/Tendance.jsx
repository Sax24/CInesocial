import { useState, useEffect } from "react";
import { getFilmsTendances } from "../services/films";
import { useNavigate } from "react-router-dom";

export default function Tendance() {
    const [watchlist, setWatchlist] = useState([]);
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    const filmsParVue = 4;

    const handleClick = (id) => {
        navigate("/film/details/" + id)
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
                        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-violet-500">
                            Trending now
                        </p>
                        <h2 className="text-3xl font-bold text-black md:text-4xl">
                            Découvrez les films tendances
                        </h2>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={precedent}
                            disabled={currentIndex === 0}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-black shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ←
                        </button>

                        <button
                            onClick={suivant}
                            disabled={currentIndex >= maxIndex}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-black shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                                    className="w-1/4 shrink-0 px-3 bg-white"
                                >
                                    <div
                                        onClick={() => handleClick(item.id)}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-[0_10px_10px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                                    >
                                        <div className="relative h-96 overflow-hidden">
                                            <img
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                                alt={item.title}
                                            />

                                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />

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