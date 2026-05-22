import { useState } from "react";
import { login } from "../services/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await login(formData);
    if (response.ok) {
      const data = await response.json();
      console.log("TOKEN", data.token);
      localStorage.setItem("token", data.token);
      toast.success("Connexion réussie !");
      setTimeout(() => navigate("/accueil"), 1500);
    } else {
      toast.error("Email ou mot de passe incorrect");
    }

  };

  return (

    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Se connecter à votre compte
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Adresse email</label>
            </div>

            <div className="mt-2">
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                onChange={handleChange}
                value={formData.email}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="mot_de_passe" className="block text-sm/6 font-medium text-gray-900">
                Mot de passe
              </label>

            </div>
            <div className="mt-2">
              <input
                id="mot_de_passe"
                type="password"
                name="mot_de_passe"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                onChange={handleChange}
                value={formData.mot_de_passe}
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Se connecter
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500 flex justify-between">
           Pas encore membre?
          <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            S'inscrire
          </a>
        </p>
      </div>
    </div>


  );
}