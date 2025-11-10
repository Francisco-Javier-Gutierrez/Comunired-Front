import React, { useState } from "react";

const UserInfo = {
  nombre: "Francisco_Javi",
  correo_electronico: "franciscoj@gmail.com",
  Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
  publicaciones: [
    {
      Correo_electronico_usuario: "franciscoj@gmail.com",
      Contenido: "Disfrutando del evento de innovación tecnológica en la UTSEM 🚀✨",
    },
    {
      Correo_electronico_usuario: "franciscoj@gmail.com",
      Contenido: "Nueva actualización del sistema de boletos disponible. ¡Pronto más mejoras! 🎟️",
      Url_imagen: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
    },
  ],
  reportes: [
    {
      id_reporte: 1,
      motivo: "Publicación con contenido inapropiado",
      fecha_reporte: "2025-11-08",
      estado: "Pendiente",
      Correo_electronico_usuario: "franciscoj@gmail.com",
      Correo_electronico_reportado: "usuario_reportado@utsem.edu.mx",
    },
  ],
};

function Profile() {
  const hasPublicaciones = UserInfo.publicaciones && UserInfo.publicaciones.length > 0;
  const hasReportes = UserInfo.reportes && UserInfo.reportes.length > 0;
  const isEmpty = !hasPublicaciones && !hasReportes;

  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);

  const handleConfirm = () => {
    if (accion === "cerrar") {
      window.location.href = "/login";
    } else if (accion === "eliminar") {
      alert("Cuenta eliminada correctamente (simulado).");
    }
    setAccion(null);
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="profile-container">
        <div className="text-center">
          <h1 className="text-white mb-4">Tu perfil</h1>
          <img
            className="mb-4 text-center profile-image cursor-pointer"
            src="Profile.svg"
            alt="Profile Image"
            onClick={() => setImagenSeleccionada("Profile.svg")}
          />
        </div>

        <span className="text-white">Nombre de usuario:</span>
        <p className="text-white mb-5">{UserInfo.nombre}</p>
        <span className="text-white">Correo Electrónico:</span>
        <p className="text-white mb-5">{UserInfo.correo_electronico}</p>

        <div className="py-4 d-flex align-items-center justify-content-around">
          <button className="white-button w-30">Editar perfil</button>
          <button className="white-button w-30" onClick={() => setAccion("eliminar")}>
            Eliminar cuenta
          </button>
          <button className="white-button w-30" onClick={() => setAccion("cerrar")}>
            Cerrar sesión
          </button>
        </div>

        <div className="mt-3 w-75 mx-auto profile-publications">
          <h3 className="text-white mb-5 text-center">Tus publicaciones / reportes</h3>

          {isEmpty && <p className="text-white text-center">No tienes publicaciones ni reportes aún 😔</p>}

          {hasPublicaciones && (
            <div className="d-flex w-100 mx-auto flex-column">
              {UserInfo.publicaciones.map((post, i) => (
                <React.Fragment key={i}>
                  <div className="d-flex my-3">
                    <div>
                      <img
                        src={UserInfo.Url_foto_perfil}
                        alt={UserInfo.nombre}
                        className="cursor-pointer no-select rounded-circle me-1 user-image"
                        onClick={() => setImagenSeleccionada(UserInfo.Url_foto_perfil)}
                      />
                    </div>
                    <div className="text-white flex-grow-1">
                      <div className="d-flex align-items-center mb-3">
                        <span className="mb-0 no-select">{UserInfo.nombre}</span>
                      </div>
                      <p className="mb-3">{post.Contenido}</p>
                      {post.Url_imagen && (
                        <img
                          src={post.Url_imagen}
                          alt="imagen publicación"
                          className="rounded-3 mb-3 w-100 cursor-pointer"
                          onClick={() => setImagenSeleccionada(post.Url_imagen)}
                        />
                      )}
                    </div>
                  </div>
                  <hr className="text-white m-0" />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {imagenSeleccionada && (
        <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body p-0 text-center position-relative">
                <img
                  src={imagenSeleccionada}
                  alt="Vista ampliada"
                  className="img-fluid rounded-3"
                  style={{ maxHeight: "90vh", objectFit: "contain" }}
                />
                <button
                  type="button"
                  className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle"
                  onClick={() => setImagenSeleccionada(null)}
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accion && (
        <div className="modal fade show d-block" tabIndex={-1} onClick={() => setAccion(null)}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white rounded-4 shadow p-4 text-center" onClick={(e) => e.stopPropagation()}>
              <h4 className="mb-4">
                {accion === "eliminar"
                  ? "¿Estás seguro de que deseas eliminar tu cuenta?"
                  : "¿Estás seguro de que deseas cerrar sesión?"}
              </h4>
              <div className="w-75 mx-auto d-flex align-items-center justify-content-around mt-4">
                <img
                  src="Confirm.svg"
                  alt="Confirmar"
                  className="cursor-pointer"
                  width={50}
                  onClick={handleConfirm}
                />
                <img
                  src="Cancel.svg"
                  alt="Cancelar"
                  className="cursor-pointer"
                  width={50}
                  onClick={() => setAccion(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
