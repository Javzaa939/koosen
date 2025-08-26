import { createContext, useState, useEffect } from 'react';

// hooks imports
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Apis
    const userApi = useApi().user;
    const { fetchData } = useLoader({});

    const [menuVisibility, setMenuVisibility] = useState(false);

    useEffect(() => {
        getUser();
    }, []);

    async function getUser() {
        try {
            const { success, data } = await fetchData(userApi.logged());
            if (success) {
                if (Object.keys(data).length > 0) {
                    setUser(data);
                    // themeConfig.school.name = data?.school_name || "Sus"
                    // themeConfig.app.appName = data?.school_name || "Sus"
                } else {
                    if (location.pathname !== '/reset-password/') {
                        navigate('/login');
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }

    const contextData = {
        loading,
        user,
        setUser,

        menuVisibility,
        setMenuVisibility,
    };

    return (
        <AuthContext.Provider value={contextData}>{loading ? null : children}</AuthContext.Provider>
    );
};
