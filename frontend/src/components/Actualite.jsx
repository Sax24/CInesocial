import { useEffect, useMemo, useState } from "react";
import { getActivites } from "../services/activites";
import formatTempsEcoule from "../utils/time";

function renderStars(note) {
  return "⭐".repeat(note);
}


function getActivityContent(activity) {
  if (activity.type === "note") {
    return {
      icon: "🎬",
      content: (
        <>
          <span className="font-semibold text-violet-600">{activity.auteur}</span>{" "}
          a noté{" "}
          <span className="font-semibold text-gray-900">{activity.cible}</span>{" "}
          <span className="ml-1">{renderStars(activity.note)}</span>
        </>
      ),
    };
  }

  if (activity.type === "commentaire") {
    return {
      icon: "💬",
      content: (
        <>
          <span className="font-semibold text-violet-600">{activity.auteur}</span>{" "}
          a commenté{" "}
          <span className="font-semibold text-gray-900">{activity.cible}</span>
        </>
      ),
    };
  }

  return {
    icon: "📋",
    content: (
      <>
        <span className="font-semibold text-violet-600">{activity.auteur}</span>{" "}
        a ajouté{" "}
        <span className="font-semibold text-gray-900">{activity.cible}</span>{" "}
        à sa watchlist
      </>
    ),
  };
}

export default function Actualite() {
  const [activitesRaw, setActivitesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchActivites() {
      try {
        setLoading(true);
        setErreur("");

        const data = await getActivites();

        if (!ignore) {
          setActivitesRaw(data);
        }
      } catch (error) {
        if (!ignore) {
          setErreur(error.message || "Erreur lors du chargement des activités");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchActivites();

    return () => {
      ignore = true;
    };
  }, []);

  const activites = useMemo(
    () =>
      activitesRaw.map((activity) => ({
        ...activity,
        date: formatTempsEcoule(activity.date),
      })),
    [activitesRaw]
  );

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Bienvenue sur CineSocial
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Suis l’activité récente des utilisateurs.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-linear-to-r from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
            <h2 className="text-xl font-bold">Activités</h2>
            <p className="mt-1 text-sm text-white/80">
              Dernières notes, commentaires et ajouts
            </p>
          </div>

          <div className="divide-y divide-gray-100 custom-scroll max-h-130 overflow-y-auto pr-1">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                Chargement des activités...
              </div>
            ) : erreur ? (
              <div className="px-6 py-12 text-center text-sm text-red-500">
                {erreur}
              </div>
            ) : activites.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl">
                  🎞️
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aucune activité pour le moment
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Les nouvelles interactions apparaîtront ici.
                </p>
              </div>
            ) : (
              activites.map((activity) => {
                const { icon, content } = getActivityContent(activity);

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 px-6 py-5 transition hover:bg-gray-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-xl shadow-sm">
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 text-gray-700">{content}</p>
                      <p className="mt-1 text-xs text-gray-400">{activity.date}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}