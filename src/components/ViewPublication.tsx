import { useState, useEffect } from "react";
import axios from "axios";
import {
    apiRoutes,
    useSearchParamsGlobal,
    getToken,
    isUserAuthenticated
} from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import PublicationComments from "./PublicationComments";

function ViewPublication() {
    const [publication, setPublication] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
    const [showCommentInput, setShowCommentInput] = useState(false);

    const searchParams = useSearchParamsGlobal();
    const publicationId = searchParams.get("post");

    useEffect(() => {
        if (!publicationId) {
            setError("No se proporcionó un ID de publicación.");
            return;
        }

        setIsLoading(true);

        const loadPublication = async () => {
            try {
                const isAuth = await isUserAuthenticated();
                const token = isAuth ? await getToken() : null;
                const res = await axios.post(
                    (isAuth ? apiRoutes.list_publication_user_auth_url : apiRoutes.list_publication_url),
                    { Id_publicacion: publicationId },
                    {
                        withCredentials: true,
                        ...(isAuth && {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    }
                );

                setPublication(res.data);
            } catch (err) {
                console.error("Error al cargar la publicación:", err);
                setError("Error al obtener la publicación");
            } finally {
                setIsLoading(false);
            }
        };

        loadPublication();
    }, [publicationId]);

    const handleCommentAdded = () => {
        setPublication((prev: any) => {
            if (!prev) return prev;
            const prevComentarios = prev.comentarios ?? { total: 0, lista: [] };
            return {
                ...prev,
                comentarios: {
                    ...prevComentarios,
                    total: prevComentarios.total + 1
                }
            };
        });
    };

    const handleCommentDeleted = () => {
        setPublication((prev: any) => {
            if (!prev) return prev;
            const prevComentarios = prev.comentarios ?? { total: 0, lista: [] };
            return {
                ...prev,
                comentarios: {
                    ...prevComentarios,
                    total: Math.max(0, prevComentarios.total - 1)
                }
            };
        });
    };

    if (isLoading) {
        return (
            <div className="home-container min-dvh-100 d-flex justify-content-center align-items-center">
                <div className="big-loader"></div>
            </div>
        );
    }

    if (error) return <div className="min-dvh-100 d-flex justify-content-center align-items-center"><h1 className="text-danger">{error}</h1></div>;
    if (!publication) return <div className="min-dvh-100 d-flex justify-content-center align-items-center"><h1 className="text-white">No hay publicación para mostrar</h1></div>;

    return (
        <div className="w-75 mx-auto home-container d-flex flex-column">
            <PublicationCard
                post={publication}
                onImageClick={setImagenSeleccionada}
                onClickComent={() => setShowCommentInput(prev => !prev)}
            />

            <hr className="text-white mt-3 m-0" />
            <h6 className="text-white my-2">Comentarios</h6>
            <hr className="text-white mb-3 m-0" />

            <PublicationComments
                publication={publication}
                showInput={showCommentInput}
                setShowInput={setShowCommentInput}
                onImageClick={setImagenSeleccionada}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
            />

            <ImageModal
                image={imagenSeleccionada}
                onClose={() => setImagenSeleccionada(null)}
            />
        </div>
    );
}

export default ViewPublication;
