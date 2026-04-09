import photo from "../assets/cinesocial.png";

export default function Navbar({ nomUser }) {
  return (
    <nav className="sticky top-0 z-50 mb-3 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-1 shadow-md transition-all">
      <a href="/accueil" className="transition duration-300 hover:scale-105">
        <img src={photo} alt="Logo CineSocial" className="w-28 h-auto rounded-lg" />
      </a>

      <div className="flex items-center gap-8">
        <a
          href="#"
          className="text-gray-700 font-medium transition duration-300 hover:text-violet-600"
        >
          Actualités
        </a>

        <div className="hidden lg:flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 shadow-sm transition duration-300 focus-within:border-violet-500 hover:shadow-md">
          <input
            className="w-full bg-transparent text-sm outline-none placeholder-gray-500"
            type="text"
            placeholder="Rechercher des films"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.836 10.615 15 14.695"
              stroke="#7A7B7D"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              clipRule="evenodd"
              d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783"
              stroke="#7A7B7D"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p className="hidden md:block text-sm text-gray-700">
          Bonjour, <span className="font-semibold text-violet-600">{nomUser}</span>
        </p>

        <a href="#" className="group">
          <div className="flex w-10 items-center justify-center rounded-full border border-gray-300 bg-white p-1 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
              fillRule="evenodd"
              clipRule="evenodd"
              viewBox="0 0 9.81 9.81"
              className="w-6 h-6 transition duration-300 group-hover:scale-110"
            >
              <g>
                <path fill="none" d="M0 0h9.81v9.81H0z"></path>
                <path
                  fill="#479dff"
                  d="M4.91 4.92a.96.96 0 0 1-.68-.28.96.96 0 0 1-.29-.68c0-.27.11-.51.29-.68.17-.18.41-.29.68-.29.26 0 .5.11.68.29.17.17.28.41.28.68 0 .26-.11.5-.28.68-.18.17-.42.28-.68.28m-.46-.51a.64.64 0 0 0 .91 0c.12-.11.19-.27.19-.45s-.07-.34-.19-.46a.642.642 0 0 0-.91 0c-.12.12-.19.28-.19.46s.07.34.19.45"
                ></path>
                <path
                  fill="#2554b0"
                  d="M4.91 6.82H3.3c-.09 0-.16-.07-.16-.16v-.55c0-.44.47-.71 1.08-.82q.33-.06.69-.06c.23 0 .46.02.68.06.61.11 1.08.38 1.08.82v.55c0 .09-.07.16-.15.16zM3.46 6.5h2.9v-.39c0-.25-.36-.43-.82-.51-.2-.04-.42-.05-.63-.05-.22 0-.44.01-.63.05-.46.08-.82.26-.82.51z"
                ></path>
              </g>
            </svg>
          </div>
        </a>
      </div>
    </nav>
  );
}