import { useUserData } from "../utils/UserStore";
import { paths } from "../utils/globalVariables";

function UserInfo() {

    const { name, email } = useUserData();

    return (
        <>
            {paths.hideFooter && email != null && name != null && (
                <div className="d-none d-md-block">
                    <div className="text-end me-5 my-3">
                        <div className="text-center text-white">
                            <h5>Usuario</h5>
                        </div>
                        <div className="d-flex justify-content-between text-white">
                            <div className="w-50 text-start text-break">
                                <p>Correo: {email ?? ""}</p>
                            </div>
                            <div className="w-50 text-end text-break">
                                <p>Nombre: {name ?? ""}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserInfo;
