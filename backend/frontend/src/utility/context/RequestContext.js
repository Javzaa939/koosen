import { createContext, useState, useEffect } from "react";

// hooks imports
import useApi from "@hooks/useApi"
import useLoader from "@hooks/useLoader"

const RequestContext = createContext();

export default RequestContext;

export const RequestProvider = ({ children }) => {
    const [roleMenus, setRoleMenus] = useState([])
    const [menuId, setMenuId] = useState('')
    const [loading, setLoading] = useState(true);

    const { fetchData } = useLoader({})

    const userApi = useApi().user

    const contextData = {
        roleMenus,
        menuId,
        setRoleMenus,
        setMenuId,
    };

    async function getRoleMenus() {
        try {
            const { success, data } = await fetchData(userApi.getMenu(menuId))
            if (success && data) {
                setRoleMenus(data)
            }
        }
        catch (e) {
            console.log(e)
        }
        setLoading(false);
    }

    useEffect(() => {
        getRoleMenus()
    }, [menuId]);

    return (
        <RequestContext.Provider value={contextData}>
            {loading ? null : children}
        </RequestContext.Provider>
    );
}
