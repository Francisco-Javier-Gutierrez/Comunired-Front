import axios from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { BackendApi } from "../utils/globalVariables";
import { goTo, formatFecha, BanMessaje } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";

const normalizeLiked = (pub: any) => {
  if (pub === "true") return true;
  if (pub === "false") return false;
  return pub?.is_Liked ?? pub?.Is_Liked ?? pub?.is_liked ?? false;
};

function MyProfile() {
  const { name, email, profilePictureUrl, setName, setEmail, setProfilePictureUrl } = useUserData();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [reportesMock, setReportesMock] = useState<any[]>([]);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [isBannedUser, setIsBannedUser] = useState<boolean | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
  const processingLikesRef = useRef<Set<string>>(new Set());

  const [shareLock, setShareLock] = useState<{ [key: string]: boolean }>({});
  const [sharedCount, setSharedCount] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await axios.post(BackendApi.auth_me_url, {}, { withCredentials: true });
        const accRes = await axios.post(BackendApi.get_account_url, {}, { withCredentials: true });
        if (!mounted) return;
        setName(accRes.data.usuario.Nombre_usuario);
        setEmail(accRes.data.usuario.Correo_electronico);
        setProfilePictureUrl(accRes.data.usuario.Url_foto_perfil);

        const listRes = await axios.post(BackendApi.list_user_publications_url, {}, { withCredentials: true });
        if (!mounted) return;
        const data = (listRes.data.publicaciones ?? listRes.data.mezclados ?? listRes.data) || [];
        const pubs: any[] = [];
        const reps: any[] = [];
        (Array.isArray(data) ? data : []).forEach((item: any) => {
          if (item && item.tipo && item.data) {
            if (item.tipo === "publicacion") pubs.push(item.data);
            else if (item.tipo === "reporte") reps.push(item.data);
          } else {
            if (item?.Id_publicacion) pubs.push(item);
            else if (item?.Id_reporte) reps.push(item);
            else pubs.push(item);
          }
        });

        setPublicaciones(pubs);
        setReportesMock(reps);

        const initialLikesState: { [key: string]: boolean } = {};
        pubs.forEach((pub: any) => {
          if (pub?.Id_publicacion) initialLikesState[pub.Id_publicacion] = normalizeLiked(pub);
        });
        reps.forEach((rep: any) => {
          if (rep?.Id_reporte) initialLikesState[rep.Id_reporte] = normalizeLiked(rep);
        });
        setLikesActivos(initialLikesState);

      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          if (mounted) setIsBannedUser(true);
        } else if (status === 401) {
          goTo("/login");
        } else {
          console.error("Error inesperado:", err);
        }
      } finally {
        if (mounted) setIsLoadingProfile(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setName, setEmail, setProfilePictureUrl]);

  const hasPublicaciones = publicaciones && publicaciones.length > 0;
  const hasReports = reportesMock && reportesMock.length > 0;
  const isEmpty = !hasPublicaciones && !hasReports;

  const updateLikeNumbers = useCallback((id: string, change: number) => {
    setPublicaciones(prev => prev.map(pub => pub.Id_publicacion === id ? { ...pub, likes: { total: (pub.likes?.total ?? 0) + change } } : pub));
    setReportesMock(prev => prev.map(rep => rep.Id_reporte === id ? { ...rep, likes: { total: (rep.likes?.total ?? 0) + change } } : rep));
  }, []);

  const updateShareNumbers = useCallback((id: string, change: number) => {
    setPublicaciones(prev => prev.map(pub => pub.Id_publicacion === id ? { ...pub, compartidos: { total: (pub.compartidos?.total ?? 0) + change } } : pub));
    setReportesMock(prev => prev.map(rep => rep.Id_reporte === id ? { ...rep, compartidos: { total: (rep.compartidos?.total ?? 0) + change } } : rep));
  }, []);

  const handleLikeClick = useCallback(async (id: string, tipo: "publicacion" | "reporte" = "publicacion") => {
    const proc = processingLikesRef.current;
    if (proc.has(id)) return;
    proc.add(id);

    const alreadyLiked = !!likesActivos[id];
    const change = alreadyLiked ? -1 : +1;

    setLikesActivos(prev => ({ ...prev, [id]: !alreadyLiked }));
    updateLikeNumbers(id, change);

    try {
      let url = BackendApi.like_publications_url;
      if (tipo === "reporte") url = BackendApi.like_report_url ?? BackendApi.like_publications_url;
      if (alreadyLiked) {
        url = tipo === "publicacion" ? (BackendApi.unlike_publications_url ?? BackendApi.unlike_publications_url) : (BackendApi.unlike_publications_url ?? BackendApi.unlike_publications_url);
      }
      await axios.post(url, { Id_objetivo: id }, { withCredentials: true });
    } catch (err: any) {
      setLikesActivos(prev => ({ ...prev, [id]: alreadyLiked }));
      updateLikeNumbers(id, -change);
      const status = err?.response?.status;
      if (status === 401) goTo("/login");
    } finally {
      proc.delete(id);
    }
  }, [likesActivos, updateLikeNumbers]);

  const handleSharePublication = useCallback(async (id: string) => {
    if (shareLock[id]) return;
    setShareLock(prev => ({ ...prev, [id]: true }));

    const url = new URL("/publication", window.location.origin);
    url.searchParams.set("post", id);

    try {
      await navigator.clipboard.writeText(url.toString());
      alert("Url copiada exitosamente");
      setSharedCount(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      updateShareNumbers(id, +1);
      await axios.post(BackendApi.share_publication_url, { Id_objetivo: id }, { withCredentials: true });
    } catch (err) {
      setSharedCount(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
      updateShareNumbers(id, -1);
    } finally {
      setShareLock(prev => ({ ...prev, [id]: false }));
    }
  }, [shareLock, updateShareNumbers]);

  const handleShareReport = useCallback(async (id: string) => {
    if (shareLock[id]) return;
    setShareLock(prev => ({ ...prev, [id]: true }));

    const url = new URL("/report", window.location.origin);
    url.searchParams.set("rep", id);

    try {
      await navigator.clipboard.writeText(url.toString());
      alert("Url copiada exitosamente");
      setSharedCount(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      updateShareNumbers(id, +1);
      await axios.post(BackendApi.share_report_url, { Id_objetivo: id }, { withCredentials: true });
    } catch (err) {
      setSharedCount(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 1) - 1) }));
      updateShareNumbers(id, -1);
    } finally {
      setShareLock(prev => ({ ...prev, [id]: false }));
    }
  }, [shareLock, updateShareNumbers]);

  const handleConfirm = useCallback(() => {
    setIsLoadingAction(true);
    let request: Promise<any>;
    if (accion === "cerrar") request = axios.post(BackendApi.logout_url, {}, { withCredentials: true });
    else if (accion === "eliminar") request = axios.post(BackendApi.delete_account_url, {}, { withCredentials: true });
    else request = Promise.resolve();

    request.then(() => {
      setName(null);
      setEmail(null);
      setProfilePictureUrl(null);
      goTo("/");
    }).catch(() => { }).finally(() => {
      setIsLoadingAction(false);
      setAccion(null);
    });
  }, [accion, setName, setEmail, setProfilePictureUrl]);

  if (isBannedUser) {
    return (
      <div className="min-dvh-100 fw-bold mt-5 w-75 mx-auto">
        <h1 className="text-danger text-break">{BanMessaje}</h1>
        <div className="py-4 d-flex align-items-center justify-content-around">
          <button className="white-button w-30" onClick={() => setAccion("eliminar")}>Eliminar mi cuenta</button>
          <button className="white-button w-30" onClick={() => setAccion("cerrar")}>Cerrar sesión</button>
        </div>
        {accion && <div className={`modal fade show d-block ${isLoadingAction ? "disabled" : ""}`} tabIndex={-1} onClick={() => setAccion(null)}><div className="modal-dialog modal-dialog-centered"><div className="modal-content bg-white rounded-4 shadow p-4 text-center" onClick={(e) => e.stopPropagation()}><h4 className="mb-4">{accion === "eliminar" ? "¿Estás seguro de que deseas eliminar tu cuenta?" : "¿Estás seguro de que deseas cerrar sesión?"}</h4><div className="w-75 mx-auto d-flex align-items-center justify-content-around mt-4">{isLoadingAction ? <div className="mid-loader"></div> : <img src="Confirm.svg" alt="Confirmar" className="cursor-pointer" width={50} onClick={handleConfirm} />}<img src="Cancel.svg" alt="Cancelar" className="cursor-pointer" width={50} onClick={() => setAccion(null)} /></div></div></div></div>}
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="profile-container">
        {isLoadingProfile ? <div className="big-loader"></div> : <>
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
            <h3 className="text-white mb-5 text-center">Tus publicaciones / reportes</h3>

            {isEmpty && <p className="text-white text-center">No tienes publicaciones ni reportes aún 😔</p>}

            {hasPublicaciones && <div className="d-flex w-100 mx-auto flex-column">
              {publicaciones.map((post) => {
                const liked = !!likesActivos[post.Id_publicacion];
                return <React.Fragment key={post.Id_publicacion}>
                  <div className="d-flex my-3"
                    onClick={() => { goTo("/publication?post=" + post.Id_publicacion) }}>
                    <div>
                      <img src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt={name ?? ""} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg") }} />
                    </div>
                    <div className="text-white flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="no-select">{name ?? ""}</span>
                        <span>{formatFecha(post.Fecha_publicacion)}</span>
                      </div>
                      <p className="mb-3">{post.Contenido}</p>
                      {post.Url_imagen && <img src={post.Url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(post.Url_imagen) }} />}
                      <div className="d-flex no-select justify-content-between text-center mt-2">
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleLikeClick(post.Id_publicacion, "publicacion") }}>
                          <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                          <span className={liked ? "text-error" : ""}>{post.likes?.total ?? 0}</span>
                        </div>
                        <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{post.comentarios?.total ?? 0}</div>
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleSharePublication(post.Id_publicacion) }}>
                          <img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />
                          <span>{sharedCount[post.Id_publicacion] ?? post.compartidos?.total ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="text-white m-0" />
                </React.Fragment>;
              })}
            </div>}

            {hasReports && <div className="d-flex w-100 mx-auto flex-column">
              {reportesMock.map((reporte, i) => {
                const liked = !!likesActivos[reporte.Id_reporte];
                return <React.Fragment key={reporte.Id_reporte ?? i}>
                  <div className="d-flex my-3"
                    onClick={() => { goTo("/report?rep=" + reporte.Id_reporte) }}>
                    <div>
                      <img src={profilePictureUrl ? profilePictureUrl : "/Profile.svg"} alt={name ?? ""} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(profilePictureUrl ? profilePictureUrl : "/Profile.svg") }} />
                    </div>
                    <div className="text-white flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="no-select">{name ?? ""}</span>
                        <span>{formatFecha(reporte.Fecha_reporte)}</span>
                      </div>
                      <p className="mb-1">{reporte.Direccion}</p>
                      <p className="mb-1"><strong>Servicio:</strong> {reporte.Servicio_reporte}</p>
                      <p className="mb-3">{reporte.Descripcion_problema}</p>
                      {reporte.Foto_evidencia && <img src={reporte.Foto_evidencia} alt="evidencia" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={(e) => { e.stopPropagation(); setImagenSeleccionada(reporte.Foto_evidencia) }} />}
                      <div className="d-flex no-select justify-content-between text-center mt-2">
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleLikeClick(reporte.Id_reporte, "reporte") }}>
                          <img src={liked ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
                          <span className={liked ? "text-error" : ""}>{reporte.likes?.total ?? 0}</span>
                        </div>
                        <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{reporte.comentarios?.total ?? 0}</div>
                        <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={(e) => { e.stopPropagation(); handleShareReport(reporte.Id_reporte) }}>
                          <img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />
                          <span>{sharedCount[reporte.Id_reporte] ?? reporte.compartidos?.total ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="text-white m-0" />
                </React.Fragment>;
              })}
            </div>}
          </div>
        </>}
      </div>

      {imagenSeleccionada && <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content bg-transparent border-0"><div className="modal-body p-0 text-center position-relative"><img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid rounded-3 selected-image" /><button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button></div></div></div></div>}

      {accion && <div className={`modal fade show d-block ${isLoadingAction ? "disabled" : ""}`} tabIndex={-1} onClick={() => setAccion(null)}><div className="modal-dialog modal-dialog-centered"><div className="modal-content bg-white rounded-4 shadow p-4 text-center" onClick={(e) => e.stopPropagation()}><h4 className="mb-4">{accion === "eliminar" ? "¿Estás seguro de que deseas eliminar tu cuenta?" : "¿Estás seguro de que deseas cerrar sesión?"}</h4><div className="w-75 mx-auto d-flex align-items-center justify-content-around mt-4">{isLoadingAction ? <div className="mid-loader"></div> : <img src="Confirm.svg" alt="Confirmar" className="cursor-pointer" width={50} onClick={handleConfirm} />}<img src="Cancel.svg" alt="Cancelar" className="cursor-pointer" width={50} onClick={() => setAccion(null)} /></div></div></div></div>}
    </div>
  );
}

export default MyProfile;
