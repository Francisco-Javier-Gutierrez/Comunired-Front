import axios from "axios";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { BackendApi } from "../utils/globalVariables";
import { goTo, formatFecha, useSearchParamsGlobal } from "../utils/globalVariables";
import { useUserData } from "../utils/UserStore";
import { ServiceNames, type ServiceCode } from "../enums/ServiceEnum";

const normalizeLiked = (pub: any) => {
  if (pub === "true") return true;
  if (pub === "false") return false;
  return pub?.is_Liked ?? pub?.Is_liked ?? pub?.is_liked ?? false;
};

function tryParseJSONMaybeString(input: any, maxAttempts = 5) {
  if (typeof input !== "string") return input;
  let parsed: any = input;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      return null;
    }
    if (typeof parsed !== "string") return parsed;
  }
  return null;
}

function parseServerResponseForUser(resData: any) {
  let payload: any = null;

  if (typeof resData === "string") {
    payload = tryParseJSONMaybeString(resData) ?? null;
  } else if (resData && resData.body !== undefined) {
    if (typeof resData.body === "string") {
      payload = tryParseJSONMaybeString(resData.body) ?? null;
    } else {
      payload = resData.body;
    }
  } else {
    payload = resData;
  }

  if (!payload) return { publicaciones: [], reportes: [], mezclados: [] };

  if (Array.isArray(payload.mezclados)) {
    return { mezclados: payload.mezclados, publicaciones: [], reportes: [] };
  }

  if (Array.isArray(payload)) {
    const pubs: any[] = [];
    const reps: any[] = [];
    payload.forEach((item: any) => {
      if (!item || !item.tipo) return;
      const d: any = item.data ? { ...item.data } : {};
      if (item.id) {
        if (item.tipo === "publicacion" && !d.Id_publicacion) d.Id_publicacion = item.id;
        if (item.tipo === "reporte" && !d.Id_reporte) d.Id_reporte = item.id;
      }
      if (item.fecha_iso) {
        if (item.tipo === "publicacion" && !d.Fecha_publicacion) d.Fecha_publicacion = item.fecha_iso;
        if (item.tipo === "reporte" && !d.Fecha_reporte) d.Fecha_reporte = item.fecha_iso;
      } else if (item.fecha && (typeof item.fecha === "number" || /^\d+$/.test(String(item.fecha)))) {
        const iso = new Date(Number(item.fecha)).toISOString();
        if (item.tipo === "publicacion" && !d.Fecha_publicacion) d.Fecha_publicacion = iso;
        if (item.tipo === "reporte" && !d.Fecha_reporte) d.Fecha_reporte = iso;
      }
      if (item.tipo === "publicacion" || item.tipo === "post") pubs.push(d);
      if (item.tipo === "reporte" || item.tipo === "report") reps.push(d);
    });
    return { publicaciones: pubs, reportes: reps, mezclados: [] };
  }

  return {
    publicaciones: payload.publicaciones ?? [],
    reportes: payload.reportes ?? [],
    mezclados: []
  };
}

function buildInitialLikesStateFromMezclados(mezclados: any[]) {
  const map: { [key: string]: boolean } = {};
  (mezclados || []).forEach(item => {
    const id = item.tipo === "publicacion" ? item.data?.Id_publicacion : item.data?.Id_reporte;
    if (id) map[id] = normalizeLiked(item.data ?? {});
  });
  return map;
}

function splitMezcladosToArrays(mezclados: any[]) {
  const pubs: any[] = [];
  const reps: any[] = [];
  (mezclados || []).forEach(item => {
    const d = item.data ? { ...item.data } : {};
    if (item.tipo === "publicacion") pubs.push(d);
    else if (item.tipo === "reporte") reps.push(d);
  });
  return { pubs, reps };
}

function normalizeMezcladosToFeed(mezclados: any[]) {
  return (mezclados || []).map(item => {
    const fecha = item.fecha_iso ?? (item.fecha ? (typeof item.fecha === 'number' ? new Date(item.fecha).toISOString() : item.fecha) : null);
    return {
      __tipo: item.tipo,
      __fecha: fecha ?? new Date(0).toISOString(),
      ...item.data
    };
  }).sort((a, b) => {
    const ta = new Date(a.__fecha).getTime();
    const tb = new Date(b.__fecha).getTime();
    return ta - tb;
  });
}

function UserProfile() {
  const [name, setName] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [, setPublicaciones] = useState<any[]>([]);
  const [, setReportesState] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);

  const [authMeData, setAuthMeData] = useState<{ payload?: { Rol: string } } | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [likesActivos, setLikesActivos] = useState<{ [key: string]: boolean }>({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  const [shareLock, setShareLock] = useState<{ [key: string]: boolean }>({});
  const [sharedCount, setSharedCount] = useState<{ [key: string]: number }>({});

  const { email: globalEmail } = useUserData();
  const processingLikesRef = useRef<Set<string>>(new Set());

  const searchParams = useSearchParamsGlobal();
  const userEmail = searchParams.get("user");

  if (userEmail == globalEmail) goTo("/my-profile");

  useEffect(() => {
    axios.post(BackendApi.auth_me_url, {}, { withCredentials: true })
      .then((res) => setAuthMeData(res.data))
      .catch(() => { });

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

    axios.post(BackendApi.list_user_publications_url, { "Correo_electronico": userEmail }, { withCredentials: true })
      .then((res) => {
        const parsed = parseServerResponseForUser(res.data);

        let mezclados = parsed.mezclados ?? [];
        if ((!mezclados || mezclados.length === 0) && (parsed.publicaciones?.length || parsed.reportes?.length)) {
          const pubsNorm = (parsed.publicaciones || []).map((p: { Id_publicacion: any; Fecha_publicacion: string; }) => ({
            tipo: "publicacion",
            id: p.Id_publicacion,
            fecha_iso: p.Fecha_publicacion,
            fecha: p.Fecha_publicacion ? Date.parse(p.Fecha_publicacion) : 0,
            data: p
          }));

          const repsNorm = (parsed.reportes || []).map((r: { Id_reporte: any; Fecha_reporte: string; }) => ({
            tipo: "reporte",
            id: r.Id_reporte,
            fecha_iso: r.Fecha_reporte,
            fecha: r.Fecha_reporte ? Date.parse(r.Fecha_reporte) : 0,
            data: r
          }));

          mezclados = [...pubsNorm, ...repsNorm];
        }

        const feedItems = normalizeMezcladosToFeed(mezclados);
        const { pubs, reps } = splitMezcladosToArrays(mezclados);

        setPublicaciones(pubs);
        setReportesState(reps);
        setFeed(feedItems);

        setLikesActivos(prev => ({ ...prev, ...buildInitialLikesStateFromMezclados(mezclados) }));
      })
      .catch(() => {
        setPublicaciones([]);
        setReportesState([]);
        setFeed([]);
        setLikesActivos({});
      });
  }, []);

  if (userNotFound) {
    return <h3 className="text-center text-danger fw-bold display-1 mt-5">¡USUARIO NO ENCONTRADO!</h3>;
  }

  const isEmpty = (feed || []).length === 0;
  const updateLikeNumbers = useCallback((id: string, change: number) => {
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

    setFeed(prev => prev.map(item => {
      if (item.Id_publicacion === id || item.Id_reporte === id) {
        return { ...item, likes: { total: (item.likes?.total ?? 0) + change } };
      }
      return item;
    }));
  }, []);

  const updateShareNumbers = useCallback((id: string, change: number) => {
    setPublicaciones(prev =>
      prev.map(pub =>
        pub.Id_publicacion === id
          ? { ...pub, compartidos: { total: (pub.compartidos?.total ?? 0) + change } }
          : pub
      )
    );

    setReportesState(prev =>
      prev.map(rep =>
        rep.Id_reporte === id
          ? { ...rep, compartidos: { total: (rep.compartidos?.total ?? 0) + change } }
          : rep
      )
    );

    setFeed(prev => prev.map(item => {
      if (item.Id_publicacion === id || item.Id_reporte === id) {
        return { ...item, compartidos: { total: (item.compartidos?.total ?? 0) + change } };
      }
      return item;
    }));
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
      // rollback
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
    } catch (err: any) {
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

  // render helpers
  const renderPublicacion = (post: any) => (
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
            <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(post.Id_publicacion, "publicacion")}>
              <img src={likesActivos[post.Id_publicacion] ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
              <span className={likesActivos[post.Id_publicacion] ? "text-error" : ""}>{post.likes?.total ?? 0}</span>
            </div>
            <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{post.comentarios?.total ?? 0}</div>
            <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleSharePublication(post.Id_publicacion)}>
              <img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />
              <span>{sharedCount[post.Id_publicacion] ?? post.compartidos?.total ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
      <hr className="text-white m-0" />
    </React.Fragment>
  );

  const renderReporte = (reporte: any, i: number) => (
    <React.Fragment key={reporte.Id_reporte ?? i}>
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
          <p className="mb-1"><strong>Servicio:</strong> {ServiceNames[reporte.Servicio_reporte as ServiceCode]}</p>
          <p className="mb-3">{reporte.Descripcion_problema}</p>
          {reporte.Foto_evidencia && <img src={reporte.Foto_evidencia} alt="evidencia" className="rounded-3 mb-3 w-50 publication-image cursor-pointer d-block mx-auto" onClick={() => setImagenSeleccionada(reporte.Foto_evidencia)} />}
          <div className="d-flex no-select justify-content-between text-center mt-2">
            <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleLikeClick(reporte.Id_reporte, "reporte")}>
              <img src={likesActivos[reporte.Id_reporte] ? "Like_active.svg" : "Like.svg"} width={20} className="me-1" alt="Like" />
              <span className={likesActivos[reporte.Id_reporte] ? "text-error" : ""}>{reporte.likes?.total ?? 0}</span>
            </div>
            <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{reporte.comentarios?.total ?? 0}</div>
            <div className="cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleShareReport(reporte.Id_reporte)}>
              <img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />
              <span>{sharedCount[reporte.Id_reporte] ?? reporte.compartidos?.total ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
      <hr className="text-white m-0" />
    </React.Fragment>
  );

  // --- reemplaza la función handleConfirm por esta versión (mismo comportamiento, más clara) ---
  const handleConfirm = async () => {
    setIsLoadingAction(true);

    try {
      if (accion === "cerrar") {
        await axios.post(BackendApi.ban_account_url, { Correo_electronico: userEmail }, { withCredentials: true });
      } else if (accion === "eliminar") {
        await axios.post(BackendApi.delete_account_url, { Correo_electronico: userEmail }, { withCredentials: true });
      } else {
      }

      setName(null);
      setEmail(null);
      setProfilePictureUrl(null);
      goTo("/");
    } catch (err) {
      console.error("Error ejecutando acción:", err);
      goTo("/login");
    } finally {
      setIsLoadingAction(false);
      setAccion(null);
    }
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

              {isEmpty && isLoadingProfile && <p className="text-white text-center">No hay publicaciones ni reportes 😔</p>}

              {feed.map((item, idx) => item.__tipo === "publicacion" ? renderPublicacion(item) : renderReporte(item, idx))}

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
                {isLoadingAction ? <div className="mid-loader"></div> : <img src="Confirm.svg" alt="Confirmar" className="cursor-pointer" width={50} onClick={() => { handleConfirm() }} />}
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
