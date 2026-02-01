import { useState, useEffect } from "react";
import axios from "axios";
import { BackendApi, goTo, useSearchParamsGlobal, isUserAuthenticated, getToken } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "../components/PublicationCard";
import ImageModal from "../components/ImageModal";

function UserProfile() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const searchParams = useSearchParamsGlobal();
  const { email: globalEmail } = useUserData();

  const userEmail = searchParams.get("user");

  if (userEmail === globalEmail) goTo("/my-profile");

  useEffect(() => {
    if (!userEmail) return;

    const loadUserFeed = async () => {
      setIsLoading(true);
      try {
        const isAuth = await isUserAuthenticated();
        const token = isAuth ? await getToken() : null;
        const res = await axios.post((
          isAuth ? BackendApi.list_user_publications_user_auth_url :
            BackendApi.list_user_publications_url),
          { Correo_electronico: userEmail },
          {
            ...(isAuth && {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          }
        );

        setProfilePictureUrl(res.data.usuario.Url_foto_perfil);
        setUserName(res.data.usuario.nombre_usuario);
        setPosts(res.data.publicaciones);
      } catch (err: any) {
        if (err?.response?.data?.error === "Usuario no encontrado") {
          setUserNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFeed();
  }, [userEmail]);

  if (userNotFound) {
    return <h3 className="text-center text-danger fw-bold display-1 mt-5">¡USUARIO NO ENCONTRADO!</h3>;
  }

  return isLoading ? (
    <div className="big-loader"></div>
  ) : (
    <div className="d-flex justify-content-center">
      <div className="profile-container">
        <div className="text-center">
          <h1 className="text-white mb-4">Perfil de {userName}</h1>
          <img className="mb-4 text-center rounded-circle profile-image cursor-pointer" src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt="Profile Image" onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")} />
        </div>

        <span className="text-white">Nombre de usuario:</span>
        <p className="text-white mb-5">{userName}</p>
        <span className="text-white">Correo Electrónico:</span>
        <p className="text-white mb-5">{userEmail}</p>

        <hr className="text-white" />

        <div className="mt-3 w-75 mx-auto profile-publications">
          <h3 className="text-white mb-5 text-center">Publicaciones de {userName}</h3>
          {posts.length === 0 ? <p className="text-white text-center">{userName} no tiene publicaciones</p> : (
            <>
              {posts.map((post: any) => <PublicationCard key={post.Id_publicacion} post={post} onImageClick={setImagenSeleccionada} />)}

              <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
            </>
          )}
        </div>
      </div>
    </div >
  );
}

export default UserProfile;
