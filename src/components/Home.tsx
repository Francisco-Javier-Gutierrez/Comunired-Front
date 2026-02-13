import { useState, useEffect } from "react";
import axios from "axios";
import { apiRoutes, getToken, isUserAuthenticated } from "../utils/GlobalVariables";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";

function Home() {
    const [publicaciones, setPublicaciones] = useState<any[]>([]);
    const [isLoadingPublications, setIsLoadingPublications] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    useEffect(() => {
        setIsLoadingPublications(true);

        const loadPublications = async () => {
            try {
                const isAuth = await isUserAuthenticated();
                const token = isAuth ? await getToken() : null;

                const res = await axios.get(
                    (isAuth ?
                        apiRoutes.list_publications_user_auth_url :
                        apiRoutes.list_publications_url),
                    {
                        ...(isAuth && {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    }
                );

                setPublicaciones(res.data);
            } catch (err) {
                console.error("Error al cargar publicaciones:", err);
            } finally {
                setIsLoadingPublications(false);
            }
        };

        loadPublications();
    }, []);

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75 home-container">
                {isLoadingPublications ? (
                    <div className="big-loader"></div>
                ) : (
                    <>
                        {publicaciones.map(post => (
                            <PublicationCard
                                key={post.Id_publicacion}
                                post={post}
                                onImageClick={setImagenSeleccionada}
                            />
                        ))}

                        <ImageModal
                            image={imagenSeleccionada}
                            onClose={() => setImagenSeleccionada(null)}
                        />

                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
