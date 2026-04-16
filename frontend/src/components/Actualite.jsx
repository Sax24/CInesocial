import { useMemo } from "react";

const activitesMock = [
  {
    id: 1,
    type: "note",
    auteur: "Alice",
    cible: "Inception",
    note: 4,
    date: "Il y a 2 h",
  },
  {
    id: 2,
    type: "commentaire",
    auteur: "Bob",
    cible: "Dune",
    date: "Il y a 3 h",
  },
  {
    id: 3,
    type: "follow",
    auteur: "Alice",
    cible: "Bob",
    date: "Il y a 5 h",
  },
  {
    id: 4,
    type: "watchlist",
    auteur: "Bob",
    cible: "Oppenheimer",
    date: "Hier",
  },
];

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

  if (activity.type === "follow") {
    return {
      icon: "➕",
      content: (
        <>
          <span className="font-semibold text-violet-600">{activity.auteur}</span>{" "}
          suit maintenant{" "}
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
        <span className="font-semibold text-gray-900">{activity.cible}</span>
      </>
    ),
  };
}

export default function Actualite() {
  const activites = useMemo(() => activitesMock, []);

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-violet-500">
            Accueil
          </p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Bienvenue sur CineSocial
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Suis l’activité récente de tes abonnements.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-linear-to-r from-violet-600 to-fuchsia-500 px-6 py-5 text-white">
            <h2 className="text-xl font-bold">Activité de mes abonnements</h2>
            <p className="mt-1 text-sm text-white/80">
              Dernières notes, commentaires et ajouts
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {activites.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl">
                  🎞️
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aucune activité pour le moment
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Suis des utilisateurs pour voir apparaître leur activité ici.
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