function Search() {

    return (
        <>
            <h3 className="text-white my-4">Buscar publicaciones</h3>
            <div className="w-100 d-flex justify-content-around align-items-center">
                <div className="w-100 d-flex justify-content-betwwen">
                    <div className="w-75 text-start">
                        <input type="text" className="text-input w-100" />
                    </div>
                    <div className="w-25 text-center">
                        <button className="white-button w-75">Buscar</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Search;
