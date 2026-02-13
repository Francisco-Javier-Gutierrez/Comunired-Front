import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { apiRoutes, getToken } from "../utils/GlobalVariables";
import { useUserData } from "../utils/UserStore";
import PublicationCard from "./PublicationCard";
import ImageModal from "./modals/ImageModal";
import ConfirmModal from "./modals/ConfirmModal";
import { signOut, fetchMFAPreference, updateMFAPreference } from "aws-amplify/auth";
import type { AuthContext } from "./layouts/LoggedLayout";

export default function MyProfile() {
  const navigate = useNavigate();
  const authContext = useOutletContext<AuthContext>();
  const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    setName(authContext.name);
    setEmail(authContext.email);
    setProfilePictureUrl(authContext.picture);

    (async () => {
      try {
        const token = await getToken();

        const listRes = await axios.post(
          apiRoutes.list_user_publications_user_auth_url,
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
          navigate("/login");
        } else {
          console.error("Error cargando perfil:", err);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    (async () => {
      if (authContext.isGoogleUser) {
        setMfaEnabled(false);
        return;
      }

      try {
        const mfaPreference = await fetchMFAPreference();
        setMfaEnabled(mfaPreference.preferred === "TOTP");
      } catch {
        setMfaEnabled(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const federatedLogout = async () => {
    try {
      await signOut({ global: true });
    } catch (err) {
    }
    setName(null);
    setEmail(null);
    setProfilePictureUrl(null);

    const domain = "us-east-1onmk5lddc.auth.us-east-1.amazoncognito.com";
    const clientId = "3g9u29c5kol8tgdmcj1jccv9do";
    const logoutUri = encodeURIComponent("https://comuni-red.com/");

    window.location.href = `https://${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
    navigate("/");
  };

  const handleConfirm = async () => {
    setIsLoadingAction(true);
    try {
      if (accion === "cerrar") {
        if (authContext.isGoogleUser) {
          await federatedLogout();
          return;
        }
        await signOut();
        navigate("/");
      } else if (accion === "desactivarMFA") {
        await updateMFAPreference({ totp: "DISABLED" });
        setMfaEnabled(false);
        return;
      }

      setName(null);
      setEmail(null);
      setProfilePictureUrl(null);
      navigate("/");
    } catch (err) {
      console.error("Error en acción de cuenta:", err);
    } finally {
      setIsLoadingAction(false);
      setAccion(null);
    }
  };

  if (isBannedUser) return <h3 className="text-center text-danger fw-bold display-1 mt-5">USUARIO BLOQUEADO</h3>;

  return isLoading ? <div className="min-dvh-100"><div className="big-loader"></div></div> : (
    <div className="d-flex justify-content-center min-dvh-100">
      <div className="profile-container">
        <div className="text-center">
          <h1 className="text-white mb-4">Tu perfil</h1>
          <img className="mb-4 text-center rounded-circle profile-image cursor-pointer" src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt="Profile Image" onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")} />
        </div>

        <span className="text-white">Nombre de usuario:</span>
        <p className="text-white mb-5">{name}</p>
        <span className="text-white">Correo Electrónico:</span>
        <p className="text-white mb-5">{email}</p>

        <span className="text-white">Autenticación de Dos Factores (MFA):</span>
        <p className="text-white mb-3">
          {mfaEnabled ? "✅ Activada" : authContext.isGoogleUser ? "🔒 MFA gestionada por Google" : "❌ Desactivada"}
        </p>

        {!authContext.isGoogleUser && (
          mfaEnabled ? (
            <button className="white-button mb-5" onClick={() => setAccion("desactivarMFA")}>
              Desactivar MFA
            </button>
          ) : (
            <button className="white-button mb-5" onClick={() => navigate("/setup-mfa")}>
              Configurar MFA
            </button>
          )
        )}

        <div className="py-4 d-flex align-items-center justify-content-around">
          {!authContext.isGoogleUser && (
            <>
              <button className="white-button w-30" onClick={() => navigate("/edit-profile")}>Editar mi perfil</button>
            </>
          )}
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

      <ConfirmModal
        isOpen={accion !== null}
        title={
          accion === "desactivarMFA" ? "¿Estás seguro de que deseas desactivar MFA?" :
            "¿Estás seguro de que deseas cerrar sesión?"
        }
        isLoading={isLoadingAction}
        onConfirm={handleConfirm}
        onCancel={() => setAccion(null)}
      />
    </div>
  );
}
