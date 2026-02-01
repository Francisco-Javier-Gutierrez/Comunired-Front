import { useState } from "react";
import axios from "axios";
import { BackendApi, goTo, isUserAuthenticated, getToken } from "../utils/globalVariables";
import PublicationCard from "../components/PublicationCard";
import ImageModal from "../components/ImageModal";

function normalizePublications(data: any[]) {
    return data.map(p => ({
        ...p,
        likes: p?.likes ?? { total: 0 },
        comentarios: p?.comentarios ?? { total: 0 },
        compartidos: p?.compartidos ?? { total: 0 },
        Usuario: p?.Usuario ?? {
            nombre_usuario: "Usuario",
            Url_foto_perfil: null,
            Correo_electronico: null
        }
    }));
}

function Search() {
    const [text, setText] = useState("");
    const [resultados, setResultados] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const handleSearch = async () => {
        const lowered = text.toLowerCase().trim();
        if (!lowered) return;

        setHasSearched(true);

        setIsLoading(true);

        const isAuth = await isUserAuthenticated();

        const token = await getToken();

        await axios.post(
            (isAuth ? BackendApi.search_resources_user_auth_url : BackendApi.search_resources_url),
            { texto: lowered },
            {
                ...(isAuth && {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            }
        )
            .then(res => {
                const pubs = normalizePublications(res.data ?? []);
                setResultados(pubs);
            })
            .catch(err => {
                console.error("Error en búsqueda:", err);
                setResultados([]);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="min-dvh-100">
            <h3 className="text-white w-75 mx-auto my-4">Buscador</h3>

            <div className="w-75 mx-auto d-flex justify-content-around align-items-center mb-5">
                <div className="w-100 d-flex justify-content-between">
                    <div className="w-75">
                        <input
                            type="text"
                            className="text-input w-100"
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                    </div>
                    <div className="w-25 text-center">
                        <button className="white-button w-75" onClick={handleSearch}>
                            Buscar
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-75 mx-auto mt-4">
                {isLoading ? (
                    <div className="big-loader"></div>
                ) : (
                    <>
                        {resultados.map(post => (
                            <PublicationCard
                                key={post.Id_publicacion}
                                post={post}
                                onImageClick={setImagenSeleccionada}
                                onClick={() =>
                                    goTo(`/publication?post=${post.Id_publicacion}`)
                                }
                            />
                        ))}

                        {hasSearched && resultados.length === 0 && (
                            <h1 className="text-white text-center mt-5">
                                No se encontraron publicaciones.
                            </h1>
                        )}
                    </>
                )}
            </div>

            <ImageModal
                image={imagenSeleccionada}
                onClose={() => setImagenSeleccionada(null)}
            />
        </div>
    );
}

export default Search;
