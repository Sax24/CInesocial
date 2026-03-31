import { useState } from "react";
import { register } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom_u: "",
    email: "",
    mot_de_passe: "",
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await register(formData);

      if (response.ok) {
        setShowSuccessPopup(true);
      } else {
        setErrorMessage("Erreur lors de l'inscription");
      }
    } catch (error) {
      setErrorMessage("Impossible de contacter le serveur");
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessPopup(false);
    navigate("/login");
  };

  return (
    <>
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            alt="Logo"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            Bienvenue sur CineSocial
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} method="POST" className="space-y-6">
            <div>
              <label htmlFor="nom_u" className="block text-sm/6 font-medium text-gray-100">
                Nom
              </label>
              <div className="mt-2">
                <input
                  id="nom_u"
                  type="text"
                  name="nom_u"
                  required
                  autoComplete="username"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  onChange={handleChange}
                  value={formData.nom_u}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
                Adresse email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>
            </div>

            <div>
              <label htmlFor="mot_de_passe" className="block text-sm/6 font-medium text-gray-100">
                Mot de passe
              </label>
              <div className="mt-2">
                <input
                  id="mot_de_passe"
                  type="password"
                  name="mot_de_passe"
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  onChange={handleChange}
                  value={formData.mot_de_passe}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md border border-red-400 bg-red-500/20 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mb-4">
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                S'inscrire
              </button>
            </div>
          </form>

          <p className="mt-10 flex justify-between text-center text-sm/6 text-gray-400">
            <span>Déjà un compte ?</span>
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
              <span className="text-2xl text-green-400">✓</span>
            </div>

            <h3 className="mt-4 text-center text-2xl font-bold text-white">
              Inscription réussie
            </h3>

            <p className="mt-3 text-center text-sm text-gray-300">
              Votre compte a bien été créé. Vous pouvez maintenant vous connecter.
            </p>

            <button
              onClick={handleGoToLogin}
              className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              Aller à la connexion
            </button>
          </div>
        </div>
      )}
    </>
  );
}