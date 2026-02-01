import { useEffect, useState } from "react";
import axios from "axios";
import { BackendApi, goTo, getToken } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "../components/PublicationCard";
import ImageModal from "../components/ImageModal";
import { fetchAuthSession, signOut } from "aws-amplify/auth";

export default function MyProfile() {
  const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;

        if (!payload) return null;

        const user = {
          email: payload.email as string,
          name: payload.name as string | undefined,
          picture: payload.picture as string | undefined,
        };

        setName(user?.name ?? null);
        setEmail(user?.email ?? null);
        setProfilePictureUrl(user?.picture ?? null);

        const token = await getToken();

        const listRes = await axios.post(
          BackendApi.list_user_publications_user_auth_url,
          { Correo_electronico: email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );

        if (!mounted) return;

        const raw =
          listRes.data.publicaciones ??
          listRes.data.mezclados ??
          listRes.data ??
          [];

        const normalized = Array.isArray(raw)
          ? raw
            .map((item: any) => item?.data ?? item)
            .filter((p: any) => p?.Id_publicacion)
          : [];

        setPosts(normalized);

      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 403) {
          if (mounted) setIsBannedUser(true);
        } else if (status === 401) {
          goTo("/login");
        } else {
          console.error("Error cargando perfil:", err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleConfirm = async () => {
    setIsLoadingAction(true);
    try {
      if (accion === "cerrar") await signOut({ global: true }).catch(() => { });
      else if (accion === "eliminar") await axios.post(BackendApi.delete_account_url, {}, { withCredentials: true });

      setName(null);
      setEmail(null);
      setProfilePictureUrl(null);
      goTo("/");
    } catch (err) {
      console.error("Error en acción de cuenta:", err);
    } finally {
      setIsLoadingAction(false);
      setAccion(null);
    }
  };

  if (isBannedUser) return <h3 className="text-center text-danger fw-bold display-1 mt-5">USUARIO BLOQUEADO</h3>;

  return isLoading ? <div className="big-loader"></div> : (
    <div className="d-flex justify-content-center">
      <div className="profile-container">
        <div className="text-center">
          <h1 className="text-white mb-4">Tu perfil</h1>
          <img className="mb-4 text-center rounded-circle profile-image cursor-pointer" src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt="Profile Image" onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")} />
        </div>

        <span className="text-white">Nombre de usuario:</span>
        <p className="text-white mb-5">{name}</p>
        <span className="text-white">Correo Electrónico:</span>
        <p className="text-white mb-5">{email}</p>

        <div className="py-4 d-flex align-items-center justify-content-around">
          <button className="white-button w-30" onClick={() => goTo("/edit-profile")}>Editar mi perfil</button>
          <button className="white-button w-30" onClick={() => setAccion("eliminar")}>Eliminar mi cuenta</button>
          <button className="white-button w-30" onClick={() => setAccion("cerrar")}>Cerrar sesión</button>
        </div>

        <hr className="text-white" />

        <div className="mt-3 w-75 mx-auto profile-publications">
          <h3 className="text-white mb-5 text-center">Tus publicaciones</h3>
          {posts.length === 0 ? <p className="text-white text-center">No tienes publicaciones aún 😔</p> : (
            <>
              {posts.map((post: any) => <PublicationCard key={post.Id_publicacion} post={post} onImageClick={setImagenSeleccionada} />)}

              <ImageModal image={imagenSeleccionada} onClose={() => setImagenSeleccionada(null)} />
            </>
          )}
        </div>
      </div>

      {accion && (
        <div className={`modal fade show d-block ${isLoadingAction ? "disabled" : ""}`} tabIndex={-1} onClick={() => setAccion(null)}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white rounded-4 shadow p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <h4 className="mb-4">{accion === "eliminar" ? "¿Estás seguro de que deseas eliminar tu cuenta?" : "¿Estás seguro de que deseas cerrar sesión?"}</h4>
              <div className="w-75 mx-auto d-flex align-items-center justify-content-around mt-4">
                {isLoadingAction ? <div className="mid-loader"></div> : <img src="Confirm.svg" alt="Confirmar" className="cursor-pointer" width={50} onClick={handleConfirm} />}
                <img src="Cancel.svg" alt="Cancelar" className="cursor-pointer" width={50} onClick={() => setAccion(null)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
