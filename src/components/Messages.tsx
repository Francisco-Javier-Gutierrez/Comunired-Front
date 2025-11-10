import React, { useState } from "react";

function Messages() {
    const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

    const publicaciones = [
        {
            id_publicacion: "post_001",
            contenido: "Hoy en la colonia San Pedro seguimos sin agua 😤💧",
            url_imagen: null,
            usuario: { nombre_usuario: "María López", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
            likes: { total: 142 }, comentarios: { total: 7 }, compartidos: { total: 5 }
        },
        {
            id_publicacion: "post_002",
            contenido: "El evento del Día de Muertos estuvo increíble 🕯️💀✨",
            url_imagen: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
            usuario: { nombre_usuario: "Carlos Mendoza", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
            likes: { total: 230 }, comentarios: { total: 12 }, compartidos: { total: 9 }
        },
        {
            id_publicacion: "post_003",
            contenido: "🚧 Aviso: mañana cierran la calle Morelos por mantenimiento de luz.",
            url_imagen: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/AWSLambda.svg",
            usuario: { nombre_usuario: "Ayuntamiento San Pedro", Url_foto_perfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg" },
            likes: { total: 56 }, comentarios: { total: 4 }, compartidos: { total: 3 }
        }
    ];

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75 home-container">
                {publicaciones.map((post) => (
                    <React.Fragment key={post.id_publicacion}>
                        <div className="d-flex my-3">
                            <div><img src={post.usuario.Url_foto_perfil} alt={post.usuario.nombre_usuario} className="cursor-pointer no-select rounded-circle me-1 user-image" onClick={() => setImagenSeleccionada(post.usuario.Url_foto_perfil)} /></div>
                            <div className="text-white flex-grow-1">
                                <div className="d-flex align-items-center no-select mb-3"><span className="mb-0">{post.usuario.nombre_usuario}</span></div>
                                <p className="mb-3">{post.contenido}</p>
                                {post.url_imagen && (<img src={post.url_imagen} alt="imagen publicación" className="rounded-3 mb-3 w-100 cursor-pointer" onClick={() => setImagenSeleccionada(post.url_imagen)} />)}
                                <div className="d-flex no-select justify-content-between text-center mt-2">
                                    <div><img src="Like.svg" width={20} className="me-1 cursor-pointer" alt="Like" />{post.likes.total}</div>
                                    <div><img src="Comment.svg" width={20} className="me-1 cursor-pointer" alt="Comentarios" />{post.comentarios.total}</div>
                                    <div><img src="Share.svg" width={20} className="me-1 cursor-pointer" alt="Compartir" />{post.compartidos.total}</div>
                                </div>
                            </div>
                        </div>
                        <hr className="text-white m-0" />
                    </React.Fragment>
                ))}

                {imagenSeleccionada && (
                    <div className="modal fade show d-block" tabIndex={-1} onClick={() => setImagenSeleccionada(null)}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content bg-transparent border-0">
                                <div className="modal-body p-0 text-center position-relative">
                                    <img src={imagenSeleccionada} alt="Vista ampliada" className="img-fluid rounded-3" style={{ maxHeight: "90vh", objectFit: "contain" }} />
                                    <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle" onClick={() => setImagenSeleccionada(null)}></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
