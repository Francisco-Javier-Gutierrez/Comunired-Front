import React from 'react';

function Home() {
    const publicaciones = [
        {
            id: 1,
            publicacion: {
                id: "post_001",
                contenido: "Hoy en la colonia San Pedro seguimos sin agua 😤💧",
                fecha: "2025-11-01T10:23:00Z"
            },
            usuario: {
                id: "user_045",
                nombre: "María López",
                fotoPerfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg"
            },
            likes: { total: 142 },
            comentarios: { total: 7 },
            compartidos: { total: 5 }
        },
        {
            id: 2,
            publicacion: {
                id: "post_002",
                contenido: "El evento del Día de Muertos estuvo increíble 🕯️💀✨",
                imagen: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg",
                fecha: "2025-11-01T18:45:00Z"
            },
            usuario: {
                id: "user_011",
                nombre: "Carlos Mendoza",
                fotoPerfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg"
            },
            likes: { total: 230 },
            comentarios: { total: 12 },
            compartidos: { total: 9 }
        },
        {
            id: 3,
            publicacion: {
                id: "post_003",
                contenido: "🚧 Aviso: mañana cierran la calle Morelos por mantenimiento de luz.",
                imagen: null,
                fecha: "2025-11-02T08:00:00Z"
            },
            usuario: {
                id: "user_003",
                nombre: "Ayuntamiento San Pedro",
                fotoPerfil: "https://s3.us-east-2.amazonaws.com/franciscojgh.com/Git.svg"
            },
            likes: { total: 56 },
            comentarios: { total: 4 },
            compartidos: { total: 3 }
        }
    ];

    return (
        <div className="d-flex justify-content-center">
            <div className="w-75">
                {publicaciones.map((post) => (
                    <React.Fragment key={post.id}>
                        <div className="d-flex my-3">
                            <div>
                                <img
                                    src={post.usuario.fotoPerfil}
                                    alt={post.usuario.nombre}
                                    className="rounded-circle me-1 user-image"
                                />
                            </div>
                            <div className="text-white flex-grow-1">
                                <div className="d-flex align-items-center mb-3">
                                    <span className="mb-0">{post.usuario.nombre}</span>
                                </div>
                                <p className="mb-3">{post.publicacion.contenido}</p>
                                {post.publicacion.imagen && (
                                    <img
                                        src={post.publicacion.imagen}
                                        alt="imagen publicación"
                                        className="rounded-3 mb-3 w-100"
                                    />
                                )}
                                <div className="d-flex justify-content-between text-center mt-2">
                                    <div>
                                        <img src="Like.svg" width={20} className="me-1" />
                                        {post.likes.total}
                                    </div>
                                    <div>
                                        <img src="Comment.svg" width={20} className="me-1" />
                                        {post.comentarios.total}
                                    </div>
                                    <div>
                                        <img src="Share.svg" width={20} className="me-1" />
                                        {post.compartidos.total}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="text-white m-0" />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

}

export default Home;
