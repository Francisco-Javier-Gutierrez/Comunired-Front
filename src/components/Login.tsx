function Login() {
    return (
        <>
            <h1 className='text-white text-center mb-5'>Iniciar sesión</h1>
            <div className="login-container w-50 mx-auto">
                <p className='text-white'>Ingrese su correo electrónico</p>
                <input className='text-input w-100 mb-4' type="text" />

                <p className='text-white'>Ingrese su contraseña</p>
                <input className='text-input w-100 mb-4' type="text" />

                <span className='text-white'>¿Todavía no tienes una cuenta? <a className='text-white' href="signUp">Regístrate aquí</a></span>

                <button className="white-button w-100 mt-4">Iniciar sesión</button>
            </div>
        </>
    )
}

export default Login
