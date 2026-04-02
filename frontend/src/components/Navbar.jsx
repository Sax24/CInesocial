import photo from "../assets/cinesocial.png";

export default function Navbar() {

    return (
        <nav className="flex items-center mb-5 justify-evenly border-b border-gray-300 bg-while relative transition-all">

            <a href="/accueil">
                <img src={photo} alt="Ma photo" className="w-32 h-auto rounded-lg" />
            </a>


            <div className=" sm:flex items-center gap-8">
                <a href="#">Actualités</a>
                <div className="hidden lg:flex items-center text-sm gap-2 border border- px-3 rounded-full">
                    <input className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Rechercher des films" />
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.836 10.615 15 14.695" stroke="#7A7B7D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                        <path clip-rule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#7A7B7D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>

            </div>

            <div className=" sm:flex items-center gap-8">
                <a href="#">
                    <div className=" w-12 border rounded-full">
                       
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xmlSpace="preserve"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            imageRendering="optimizeQuality"
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            viewBox="0 0 9.81 9.81"
                        >
                            <g id="SVGRepo_iconCarrier">
                                <g id="Layer_x0020_1">
                                    <path fill="none" d="M0 0h9.81v9.81H0z"></path>
                                    <path
                                        fill="#479dff"
                                        fillRule="nonzero"
                                        d="M4.91 4.92a.96.96 0 0 1-.68-.28.96.96 0 0 1-.29-.68c0-.27.11-.51.29-.68.17-.18.41-.29.68-.29.26 0 .5.11.68.29.17.17.28.41.28.68 0 .26-.11.5-.28.68-.18.17-.42.28-.68.28m-.46-.51a.64.64 0 0 0 .91 0c.12-.11.19-.27.19-.45s-.07-.34-.19-.46a.642.642 0 0 0-.91 0c-.12.12-.19.28-.19.46s.07.34.19.45"
                                    ></path>
                                    <path
                                        fill="#2554b0"
                                        fillRule="nonzero"
                                        d="M4.91 6.82H3.3c-.09 0-.16-.07-.16-.16v-.55c0-.44.47-.71 1.08-.82q.33-.06.69-.06c.23 0 .46.02.68.06.61.11 1.08.38 1.08.82v.55c0 .09-.07.16-.15.16zM3.46 6.5h2.9v-.39c0-.25-.36-.43-.82-.51-.2-.04-.42-.05-.63-.05-.22 0-.44.01-.63.05-.46.08-.82.26-.82.51z"
                                    ></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                </a>


            </div>





        </nav>

    )
}