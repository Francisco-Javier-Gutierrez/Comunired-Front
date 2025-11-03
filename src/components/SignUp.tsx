function SignUp() {
    return (
        <>
            <h1 className='text-white text-center mb-5'>Registrarse</h1>
            <div className="signUp-container w-50 mx-auto">
                <p className='text-white'>Ingrese un nombre de usuario</p>
                <input className='text-input w-100 mb-4' type="text" />

                <p className='text-white'>Ingrese su correo electrónico</p>
                <input className='text-input w-100 mb-4' type="text" />

                <p className='text-white'>Ingrese una contraseña</p>
                <input className='text-input w-100 mb-4' type="text" />

                <span><a className='text-white' href="login">¿Ya tienes una cuenta?</a></span>

                <button className="white-button w-100 mt-4">Registrarse</button>
            </div>
        </>
    )
}

export default SignUp
