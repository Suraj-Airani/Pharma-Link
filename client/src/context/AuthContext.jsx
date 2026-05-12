import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('pharmalink_token'));
    const [admin, setAdmin] = useState(() => {
        const stored = localStorage.getItem('pharmalink_admin');
        return stored ? JSON.parse(stored) : null;
    });

    const isAuthenticated = !!token;
    const role = admin?.role || 'admin';

    const login = (newToken, adminData) => {
        setToken(newToken);
        setAdmin(adminData);
        localStorage.setItem('pharmalink_token', newToken);
        localStorage.setItem('pharmalink_admin', JSON.stringify(adminData));
    };

    const logout = () => {
        setToken(null);
        setAdmin(null);
        localStorage.removeItem('pharmalink_token');
        localStorage.removeItem('pharmalink_admin');
    };

    return (
        <AuthContext.Provider value={{ token, admin, isAuthenticated, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
