import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    nom_u: "",
    email: "",
    mot_de_passe: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO : appel API
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Titre */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">🎬 CinéSocial</h1>
        <p className="text-gray-400 text-center mb-8">Créer un compte</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nom d'utilisateur */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Nom d'utilisateur</label>
            <input
              type="text"
              name="nom_u"
              value={formData.nom_u}
              onChange={handleChange}
              placeholder="ex: alice123"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alice@example.com"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Mot de passe</label>
            <input
              type="password"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            S'inscrire
          </button>

        </form>

        {/* Lien login */}
        <p className="text-gray-500 text-center text-sm mt-6">
          Déjà un compte ?{" "}
          <a href="/login" className="text-blue-400 hover:underline">Se connecter</a>
        </p>

      </div>
    </div>
  );
}