import { useUserData } from "../utils/UserStore";
import { paths } from "../utils/globalVariables";

function UserInfo() {

    const { name } = useUserData();

    return (
        <>
            {paths.hideFooter && (
                < div className="text-end my-3" >
                    <h6 className="text-white">{name ?? ""}</h6>
                </div >
            )}
        </>
    );
}

export default UserInfo;
