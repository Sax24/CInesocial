--
-- PostgreSQL database dump
--

\restrict hQnP9t5piKfnNxSZYwrbOvyPUIQyqnYmglO5NDrmKwIOeeMXjqdlPEfqb7clJq7

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    utilisateur_id integer,
    tmdb_id integer NOT NULL,
    score integer,
    cree_le timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notes_score_check CHECK (((score >= 1) AND (score <= 5)))
);


ALTER TABLE public.notes OWNER TO admin;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO admin;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.utilisateurs (
    id integer NOT NULL,
    nom_u character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    mot_de_passe text NOT NULL,
    cree_le timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.utilisateurs OWNER TO admin;

--
-- Name: utilisateurs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.utilisateurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utilisateurs_id_seq OWNER TO admin;

--
-- Name: utilisateurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.utilisateurs_id_seq OWNED BY public.utilisateurs.id;


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: utilisateurs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.utilisateurs ALTER COLUMN id SET DEFAULT nextval('public.utilisateurs_id_seq'::regclass);


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.notes (id, utilisateur_id, tmdb_id, score, cree_le) FROM stdin;
\.


--
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.utilisateurs (id, nom_u, email, mot_de_passe, cree_le) FROM stdin;
\.


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- Name: utilisateurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.utilisateurs_id_seq', 1, false);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notes notes_utilisateur_id_tmdb_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_utilisateur_id_tmdb_id_key UNIQUE (utilisateur_id, tmdb_id);


--
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- Name: utilisateurs utilisateurs_nom_u_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_nom_u_key UNIQUE (nom_u);


--
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- Name: notes notes_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hQnP9t5piKfnNxSZYwrbOvyPUIQyqnYmglO5NDrmKwIOeeMXjqdlPEfqb7clJq7

