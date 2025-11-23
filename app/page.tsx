"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Offcanvas, Badge } from "react-bootstrap";

interface Pokemon {
  id: number;
  name: string;
  spanishName: string;
  img: string;
  nickname?: string;
  isShiny?: boolean;
}

export default function Home() {
  const [pokebanco, setPokebanco] = useState<Pokemon[]>([]);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [captureMessage, setCaptureMessage] = useState("");
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [indexToRelease, setIndexToRelease] = useState<number | null>(null);
  const [indexToEdit, setIndexToEdit] = useState<number | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadRandomPokemon = async () => {
    const id = Math.floor(Math.random() * 151) + 1;
    const isShiny = Math.random() < 1 / 5; // 1 de cada 5 chance de ser shiny
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`),
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ]);
      const pokemon = pokemonRes.data;
      const species = speciesRes.data;
      const spanishName =
        species.names.find((n: any) => n.language.name === "es")?.name ||
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      let img = pokemon.sprites.other["official-artwork"].front_default ||
                pokemon.sprites.front_default;
      if (isShiny) {
        img = pokemon.sprites.other["official-artwork"].front_shiny ||
              pokemon.sprites.front_shiny ||
              img; // Fallback a normal si no hay shiny
      }
      setCurrentPokemon({
        id: pokemon.id,
        name: pokemon.name,
        spanishName,
        img,
        isShiny,
      });
    } catch (err) {
      console.error("Error cargando Pokémon", err);
    }
  };

  const capture = () => {
    if (!currentPokemon) return;
    const exists = pokebanco.some((p) => p.id === currentPokemon.id);
    if (exists) {
      setCaptureMessage(
        `¡Ya tienes este ${currentPokemon.spanishName}${currentPokemon.isShiny ? ' ⭐ SHINY ⭐' : ''} en tu Pokebanco!`
      );
    } else {
      setPokebanco([...pokebanco, { ...currentPokemon }]);
      setCaptureMessage(
        `¡${currentPokemon.spanishName}${currentPokemon.isShiny ? ' ⭐ SHINY ⭐' : ''} ha sido atrapado!`
      );
    }
    setShowCaptureModal(true);
  };

  const release = () => {
    if (indexToRelease === null) return;
    const pokemonToRelease = pokebanco[indexToRelease];
    setPokebanco(pokebanco.filter((_, i) => i !== indexToRelease));
    setShowReleaseModal(false);
    setIndexToRelease(null);
    // Opcional: Mensaje de liberación en consola o modal adicional
  };

  const saveNickname = () => {
    if (indexToEdit === null) return;
    const updated = [...pokebanco];
    updated[indexToEdit].nickname = newNickname.trim() || "";
    setPokebanco(updated);
    setShowNicknameModal(false);
    setNewNickname("");
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pokebanco_gen1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migración para Pokémon antiguos: agregar isShiny false si no existe
        const migrated = parsed.map((p: Pokemon) => ({ ...p, isShiny: p.isShiny ?? false }));
        setPokebanco(migrated);
      } catch (e) {
        console.error("Error al cargar pokebanco_gen1", e);
      }
    }
    loadRandomPokemon();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("pokebanco_gen1", JSON.stringify(pokebanco));
    }
  }, [pokebanco, mounted]);

  const shinyCount = pokebanco.filter(p => p.isShiny).length;

  if (!mounted) return null;

  return (
    <>
      {/* Botón menú móvil */}
      <button
        className="btn btn-warning position-fixed top-0 start-0 m-3 d-lg-none z-1050"
        onClick={() => setShowMobileMenu(true)}
      >
        ☰
      </button>
      {/* Offcanvas menú móvil */}
      <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)}>
        <Offcanvas.Header closeButton className="text-white">
          <Offcanvas.Title>Menú Pokébanco</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="nav flex-column">
            <li>
              <a
                className="nav-link"
                href="#wild"
                onClick={() => setShowMobileMenu(false)}
              >
                ✨ Pokémon Salvaje
              </a>
            </li>
            <li>
              <a
                className="nav-link"
                href="#pokebanco"
                onClick={() => setShowMobileMenu(false)}
              >
                🎒 Mi Pokebanco
              </a>
            </li>
            <li>
              <a
                className="nav-link"
                href="#music"
                onClick={() => setShowMobileMenu(false)}
              >
                🎶 Música Pokémon
              </a>
            </li>
            <li>
              <a
                className="nav-link"
                href="#cloud"
                onClick={() => setShowMobileMenu(false)}
              >
                ☁️ Servicios en la Nube
              </a>
            </li>
            <li>
              <a
                className="nav-link"
                href="#author"
                onClick={() => setShowMobileMenu(false)}
              >
                👨‍💻 Autor
              </a>
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
      {/* Sidebar escritorio */}
      <nav className="sidebar d-none d-lg-block text-center position-fixed top-0 start-0 bottom-0 bg-dark border-end border-warning border-5 pt-4">
        <Image
          src="/pokeball.png"
          alt="Poké Ball"
          width={140}
          height={140}
          className="mb-3"
        />
        <h1
          className="text-warning mb-4"
          style={{ fontSize: "1.8rem", lineHeight: "1.2" }}
        >
          PokéCatch
          <br />
          Gen 1
        </h1>
        <div className="bg-warning text-dark fs-3 fw-bold rounded mx-4 py-3 mb-4">
          {pokebanco.length} <small className="d-block fs-6 fw-normal text-warning">({shinyCount} ⭐)</small>
        </div>
        <ul className="nav flex-column">
          <li>
            <a className="nav-link text-light py-3" href="#wild">
              ✨ Pokémon Salvaje
            </a>
          </li>
          <li>
            <a className="nav-link text-light py-3" href="#pokebanco">
              🎒 Mi Pokebanco
            </a>
          </li>
          <li>
            <a className="nav-link text-light py-3" href="#music">
              🎶 Música Pokémon
            </a>
          </li>
          <li>
            <a className="nav-link text-light py-3" href="#cloud">
              ☁️ Servicios en la Nube
            </a>
          </li>
          <li>
            <a className="nav-link text-light py-3" href="#author">
              👨‍💻 Autor
            </a>
          </li>
        </ul>
      </nav>
      {/* Main */}
      <main style={{ marginLeft: "280px" }} className="min-vh-100 d-lg-block">
        {/* En móvil el CSS de globals.css anula el margin-left */}
        {/* Sección Pokémon Salvaje */}
        <section id="wild" className="container py-5">
          <h1 className="text-center mb-5">¡Un Pokémon salvaje apareció!</h1>
          <div className="text-center position-relative">
            {currentPokemon && (
              <>
                {currentPokemon.isShiny && (
                  <Badge
                    bg="warning"
                    className="position-absolute top-0 start-50 translate-middle badge-lg fs-4"
                    style={{ zIndex: 1 }}
                  >
                    ⭐ SHINY! ⭐
                  </Badge>
                )}
                <img
                  src={currentPokemon.img}
                  alt={currentPokemon.spanishName}
                  className="img-fluid"
                  style={{ maxHeight: "400px" }}
                />
                <h2 className="my-4">
                  {currentPokemon.spanishName}
                  {currentPokemon.isShiny && <span className="text-warning"> ⭐</span>}
                </h2>
                <div className="d-flex justify-content-center gap-4 flex-wrap">
                  <button onClick={capture} className="btn btn-capture">
                    ¡Atraparlo!
                  </button>
                  <button
                    onClick={loadRandomPokemon}
                    className="btn btn-primary"
                  >
                    Buscar otro
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
        {/* Sección Mi Pokebanco */}
        <section id="pokebanco" className="container py-5">
          <h2 className="mb-4">
            Mi Pokebanco{" "}
            <span className="badge bg-warning text-dark fs-5">
              {pokebanco.length} <small>({shinyCount} ⭐)</small>
            </span>
          </h2>
          {pokebanco.length === 0 ? (
            <p className="empty-message text-center">
              Aún no has atrapado ningún Pokémon.
            </p>
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-4">
              {pokebanco.map((p, i) => (
                <div key={i} className="col">
                  <div className="card h-100 text-center position-relative">
                    {p.isShiny && (
                      <Badge
                        bg="warning"
                        className="position-absolute top-0 start-0 m-2 badge-lg"
                        style={{ zIndex: 1 }}
                      >
                        ⭐ SHINY ⭐
                      </Badge>
                    )}
                    <img
                      src={p.img}
                      className="card-img-top"
                      alt={p.spanishName}
                      style={{ objectFit: "contain", height: "180px" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title small fw-bold text-center mt-2">
                        {p.nickname ? (
                          <>
                            <span
                              style={{
                                color: "#FFDE00",
                                textShadow:
                                  "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                                fontSize: "1.1em",
                              }}
                            >
                              {p.nickname}
                            </span>
                            <br />
                            <span
                              style={{
                                color: "#BBBBBB",
                                fontSize: "0.8em",
                                fontStyle: "italic",
                              }}
                            >
                              ({p.spanishName})
                              {p.isShiny && <span className="text-warning"> ⭐</span>}
                            </span>
                          </>
                        ) : (
                          <span
                            style={{
                              color: "#FFFFFF",
                              textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                            }}
                          >
                            {p.spanishName}
                            {p.isShiny && <span className="text-warning"> ⭐</span>}
                          </span>
                        )}
                      </h5>
                      <button
                        onClick={() => {
                          setIndexToEdit(i);
                          setNewNickname(p.nickname || "");
                          setShowNicknameModal(true);
                        }}
                        className="btn btn-outline-warning btn-sm mt-auto mb-2"
                      >
                        Cambiar nickname
                      </button>
                      <button
                        onClick={() => {
                          setIndexToRelease(i);
                          setShowReleaseModal(true);
                        }}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Liberar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Sección Música */}
        <section id="music" className="container py-5">
          <h2 className="text-center mb-5">Música Pokémon para capturar</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/8RXz6Uru9WY?list=RD8RXz6Uru9WY"
                  title="Música Pokémon"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="col-md-6">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/MDHfHuynUnE?list=RDMDHfHuynUnE"
                  title="Música Pokémon"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>
        {/* Sección Servicios en la Nube */}
        <section id="cloud" className="container py-5 bg-dark text-white">
          <h2 className="text-center mb-5 text-warning" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            ☁️ Servicios en la Nube
          </h2>
          <p className="text-center mb-5 lead text-light">
            Explora proveedores de computación en la nube y aplicaciones populares que la aprovechan. Estos servicios impulsan el desarrollo web y el entretenimiento moderno.
          </p>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            {[
              { name: "AWS", url: "https://aws.amazon.com/", slug: null, customSrc: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
              { name: "Microsoft Azure", url: "https://azure.microsoft.com/", slug: null, customSrc: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" },
              { name: "Google Cloud", url: "https://cloud.google.com/", slug: "googlecloud" },
              { name: "Vercel", url: "https://vercel.com/", slug: "vercel" },
              { name: "Steam", url: "https://store.steampowered.com/", slug: "steam" },
              { name: "Netflix", url: "https://www.netflix.com/", slug: "netflix" },
              { name: "Spotify", url: "https://www.spotify.com/", slug: "spotify" },
              { name: "Google Drive", url: "https://drive.google.com/", slug: "googledrive" },
              { name: "Dropbox", url: "https://www.dropbox.com/", slug: "dropbox" },
              { name: "GitHub", url: "https://github.com/", slug: "github" }
            ].map((service, i) => (
              <div key={i} className="col">
                <a 
                  href={service.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-decoration-none text-white"
                >
                  <div className="card h-100 bg-secondary bg-opacity-25 text-center border-warning border-2 p-3 shadow-lg">
                    {service.customSrc ? (
                      <Image 
                        src={service.customSrc} 
                        width={50} 
                        height={50} 
                        alt={`${service.name} logo`} 
                        className="mb-2 mx-auto d-block"
                        unoptimized={true}
                      />
                    ) : (
                      <Image 
                        src={`https://cdn.simpleicons.org/${service.slug}`} 
                        width={50} 
                        height={50} 
                        alt={`${service.name} logo`} 
                        className="mb-2 mx-auto d-block"
                        unoptimized={true}
                      />
                    )}
                    <h5 className="card-title fw-bold text-white">{service.name}</h5>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>
        {/* Sección Autor */}
        <section id="author" className="bg-black py-5 text-center">
          <h2
            className="text-warning mb-4"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Autor
          </h2>
          <p className="lead">
            <strong className="text-warning">Jonathan Jovany Ramírez</strong>
            <br />
            Estudiante de la Universidad de Guadalajara
            <br />
            Licenciatura en Desarrollo de Sistemas Web
            <br />
            <br />
            <a
              href="https://github.com/Demonid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-warning"
            >
              github.com/Demonid
            </a>
          </p>
          <p className="small">
            Pokébanco Generación 1 © 2025 • Proyecto académico
            <br />
            Pokémon © Nintendo / Game Freak / The Pokémon Company
          </p>
        </section>
      </main>
      {/* Modales */}
      <Modal
        show={showCaptureModal}
        onHide={() => setShowCaptureModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title>¡Pokémon atrapado!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white text-center fs-5">
          {captureMessage}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-0 justify-content-center">
          <button
            className="btn btn-warning px-5"
            onClick={() => setShowCaptureModal(false)}
          >
            Continuar
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showReleaseModal}
        onHide={() => setShowReleaseModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="text-danger">¿Liberar Pokémon?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white text-center">
          {indexToRelease !== null && pokebanco[indexToRelease] && (
            <p className="fs-5">
              ¿Estás seguro de que quieres liberar a{" "}
              {pokebanco[indexToRelease].nickname
                ? `${pokebanco[indexToRelease].nickname} (${pokebanco[indexToRelease].spanishName})`
                : pokebanco[indexToRelease].spanishName}
              {pokebanco[indexToRelease].isShiny && ' ⭐ SHINY ⭐'}?
            </p>
          )}
          <p>Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-0 justify-content-center">
          <button
            className="btn btn-secondary"
            onClick={() => setShowReleaseModal(false)}
          >
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={release}>
            Liberar
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showNicknameModal}
        onHide={() => setShowNicknameModal(false)}
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Cambiar nickname</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <input
            type="text"
            className="form-control"
            placeholder="Dejar vacío para nombre original"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer className="bg-dark border-0">
          <button
            className="btn btn-secondary"
            onClick={() => setShowNicknameModal(false)}
          >
            Cancelar
          </button>
          <button className="btn btn-warning" onClick={saveNickname}>
            Guardar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}