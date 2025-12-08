import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { BackendApi } from "../utils/globalVariables";
import { goTo, formatFecha, useSearchParamsGlobal } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";

const initialReportes = [
  {
    Id_reporte: "rep-001",
    Correo_electronico_usuario: "franciscoj@gmail.com",
    Servicio_reporte: "Agua",
    Descripcion_problema: "Nos quedamos sin agua en la colonia principal",
    Direccion: "San Pedro Limón, Tlatlaya, México",
    Nivel_urgencia: "Urgente",
    Foto_evidencia: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
    Nombre_reportante: "Francisco Javier Gutierrez Herculano",
    Contacto_reportante: "7224103554",
    Fecha_reporte: "2025-11-14",
    likes: { total: 230 }, comentarios: { total: 12 }, compartidos: { total: 9 }
  },
  {
    Id_reporte: "rep-002",
    Correo_electronico_usuario: "maria.lopez@gmail.com",
    Servicio_reporte: "Alumbrado público",
    Descripcion_problema: "Varias lámparas de la calle principal no encienden desde hace días",
    Direccion: "Colonia La Soledad, Tlatlaya, México",
    Nivel_urgencia: "Media",
    Foto_evidencia: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/DynamoDB.svg",
    Nombre_reportante: "María López Ramírez",
    Contacto_reportante: "7223409821",
    Fecha_reporte: "2025-11-15",
    likes: { total: 87 }, comentarios: { total: 5 }, compartidos: { total: 3 }
  }
];

const normalizeLiked = (pub: any) => {
  return pub?.is_Liked ?? pub?.Is_Liked ?? pub?.is_liked ?? false;
};

function UserProfile() {
  const [name, setName] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [reportesState, setReportesState] = useState<any[]>(initialReportes);
  const [authMeData, setAuthMeData] = useState<{ payload?: { Rol: string } } | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const { email: globalEmail } = useUserData();

  // anti-spam per item (survives renders)
  const processingLikesRef = useRef<Set<string>>(new Set());

  const searchParams = useSearchParamsGlobal();
  const userEmail = searchParams.get("user");

  if (userEmail == globalEmail) goTo("/my-profile");

  useEffect(() => {
    // get auth role (optional)
    axios.post(BackendApi.auth_me_url, {}, { withCredentials: true })
      .then((res) => setAuthMeData(res.data))
      .catch(() => { });

    // get account data
    axios.post(BackendApi.get_account_url, { "Correo_electronico": userEmail }, { withCredentials: true })
      .then((res) => {
        setName(res.data.usuario.Nombre_usuario);
        setEmail(res.data.usuario.Correo_electronico);
        setProfilePictureUrl(res.data.usuario.Url_foto_perfil);
      })
      .catch((err) => {
        if (err?.response?.data?.error === "Usuario no encontrado") {
          setUserNotFound(true);
        }
      })
      .finally(() => setIsLoadingProfile(false));

    // publicaciones del usuario
    axios.post(BackendApi.list_user_publications_url, { "Correo_electronico": userEmail }, { withCredentials: true })
      .then((res) => {
        const pubs = res.data.publicaciones || [];
        setPublicaciones(pubs);

        // inicializar likesActivos con publicaciones y reportes
        setLikesActivos(prev => {
          const next = { ...prev };
          pubs.forEach((p: any) => {
            next[p.Id_publicacion] = normalizeLiked(p);
          });
          initialReportes.forEach((r: any) => {
            next[r.Id_reporte] = normalizeLiked(r);
          });
          return next;
        });

        // inicializar reportesState desde el mock (si quieres que venga del servidor, cámbialo)
        setReportesState(initialReportes);
      })
      .catch(() => {
        setPublicaciones([]);
        // still init reportes likes
        setLikesActivos(prev => {
          const next = { ...prev };
          initialReportes.forEach((r: any) => next[r.Id_reporte] = normalizeLiked(r));
          return next;
        });
        setReportesState(initialReportes);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userNotFound) {
    return <h3 className="text-center text-danger fw-bold display-1 mt-5">¡USUARIO NO ENCONTRADO!</h3>;
  }

  const hasPublicaciones = publicaciones.length > 0;
  const hasReports = reportesState.length > 0;
  const isEmpty = !hasPublicaciones && !hasReports;

  // actualiza counters en publicaciones y reportes
  const updateLikeNumbers = (id: string, change: number) => {
    setPublicaciones(prev =>
      prev.map(pub =>
        pub.Id_publicacion === id
          ? { ...pub, likes: { total: (pub.likes?.total ?? 0) + change } }
          : pub
      )
    );

    setReportesState(prev =>
      prev.map(rep =>
        rep.Id_reporte === id
          ? { ...rep, likes: { total: (rep.likes?.total ?? 0) + change } }
          : rep
      )
    );
  };

  const handleLikeClick = (id: string) => {
    const proc = processingLikesRef.current;
    if (proc.has(id)) return; // anti-spam
    proc.add(id);

    const alreadyLiked = !!likesActivos[id];
    const change = alreadyLiked ? -1 : +1;

    // optimistic UI
    setLikesActivos(prev => ({ ...prev, [id]: !alreadyLiked }));
    updateLikeNumbers(id, change);

    axios.post(
      alreadyLiked ? BackendApi.unlike_publications_url : BackendApi.like_publications_url,
      { Id_objetivo: id },
      { withCredentials: true }
    )
      .then(() => {
        // opcional: podrías sincronizar counts desde la respuesta si el backend devuelve el total real
      })
      .catch((err: any) => {
        const status = err?.response?.status;
        // rollback
        setLikesActivos(prev => ({ ...prev, [id]: alreadyLiked }));
        updateLikeNumbers(id, -change);

        if (status === 401) goTo("/login");
      })
      .finally(() => {
        proc.delete(id);
      });
  };

  const handleConfirm = () => {
    setIsLoadingAction(true);
    let request: Promise<any>;

    if (accion === "cerrar") request = axios.post(BackendApi.ban_account_url, { "Correo_electronico": userEmail }, { withCredentials: true });
    else if (accion === "eliminar") request = axios.post(BackendApi.delete_account_url, { "Correo_electronico": userEmail }, { withCredentials: true });
    else request = Promise.resolve();

    request
      .then(() => {
        setName(null);
        setEmail(null);
        setProfilePictureUrl(null);
        goTo("/");
      })
      .catch(() => { })
      .finally(() => {
        setIsLoadingAction(false);
        setAccion(null);
      });
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="profile-container">
        {isLoadingProfile ? (
          <div className="big-loader"></div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-white mb-4">Perfil de {name}</h1>
              <img className="mb-4 text-center rounded-circle profile-image cursor-pointer" src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt="Profile Image" onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")} />
            </div>

            <span className="text-white">Nombre de usuario:</span>
            <p className="text-white mb-5">{name}</p>
            <span className="text-white">Correo Electrónico:</span>
            <p className="text-white mb-5">{email}</p>

            {authMeData?.payload?.Rol === "Admin" && (
              <div className="py-4 d-flex align-items-center justify-content-around">
                <button className="white-button w-30" onClick={() => { goTo("/edit-profile?user=" + email) }}>Editar perfil</button>
                <button className="white-button w-30" onClick={() => setAccion("eliminar")}>Eliminar usuario</button>
                <button className="white-button w-30" onClick={() => setAccion("cerrar")}>Banear usuario</button>
              </div>
            )}

            <hr className="text-white" />

            <div className="mt-3 w-75 mx-auto profile-publications">
              <h3 className="text-white mb-5 text-center">Publicaciones / reportes</h3>
              {isEmpty && <p className="text-white text-center">No hay publicaciones ni reportes 😔</p>}

              {hasPublicaciones && publicaciones.map(post => {
                const liked = !!likesActivos[post.Id_publicacion];
                return (
                  <React.Fragment key={post.Id_publicacion}>
                    <div className="d-flex my-3">
                      <div>
                        <img src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt={name ? name : ""} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")} />
                      </div>
                      <div className="text-white flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="no-select">{name}</span>
                          <span>{formatFecha(post.Fecha_publicacion)}</span>
                        </div>
                        <p className="mb-3">{post.Contenido}</p>
                        {post.Url_imagen && <img src={post.Url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={() => setImagenSeleccionada(post.Url_imagen)} />}
                        <div className="d-flex no-select justify-content-between text-center mt-2">
                          <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(post.Id_publicacion)}>
                            <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                            <span className={liked ? "text-error" : ""}>{post.likes?.total ?? 0}</span>
                          </div>
                          <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{post.comentarios?.total ?? 0}</div>
                          <div><img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />{post.compartidos?.total ?? 0}</div>
                        </div>
                      </div>
                    </div>
                    <hr className="text-white m-0" />
                  </React.Fragment>
                );
              })}

              {hasReports && reportesState.map((reporte, i) => {
                const liked = !!likesActivos[reporte.Id_reporte];
                return (
                  <React.Fragment key={i}>
                    <div className="d-flex my-3">
                      <div>
                        <img src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt={name ?? ""} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg")} />
                      </div>
                      <div className="text-white flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="no-select">{name}</span>
                          <span>{formatFecha(reporte.Fecha_reporte)}</span>
                        </div>
                        <p className="mb-1">{reporte.Direccion}</p>
                        <p className="mb-1"><strong>Servicio:</strong> {reporte.Servicio_reporte}</p>
                        <p className="mb-3">{reporte.Descripcion_problema}</p>
                        {reporte.Foto_evidencia && <img src={reporte.Foto_evidencia} alt="evidencia" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={() => setImagenSeleccionada(reporte.Foto_evidencia)} />}
                        <div className="d-flex no-select justify-content-between text-center mt-2">
                          <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(reporte.Id_reporte)}>
                            <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                            <span className={liked ? "text-error" : ""}>{reporte.likes?.total ?? 0}</span>
                          </div>
                          <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{reporte.comentarios?.total ?? 0}</div>
                          <div><img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />{reporte.compartidos?.total ?? 0}</div>
                        </div>
                      </div>
                    </div>
                    <hr className="text-white m-0" />
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>

      {imagenSeleccionada && (
        <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body p-0 text-center position-relative">
                <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid rounded-3 selected-image" />
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accion && (
        <div className={`modal fade show d-block ${isLoadingAction ? "disabled" : ""}`} tabIndex={-1} onClick={() => setAccion(null)}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white rounded-4 shadow p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <h4 className="mb-4">{accion === "eliminar" ? "¿Eliminar este usuario?" : "¿Banear este usuario?"}</h4>
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

export default UserProfile;
