"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const API_URL = '/api'; // Use relative URL for Vite proxy
// Create context
const AuthContext = (0, react_1.createContext)(null);
// Auth provider component
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [token, setToken] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Check for token on mount
    (0, react_1.useEffect)(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);
    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }
            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken || '');
            localStorage.setItem('user', JSON.stringify(data.user));
            // Navigate based on role using window.location
            if (data.user.role === 'ADMIN') {
                window.location.href = '/admin';
            }
            else {
                window.location.href = '/dashboard';
            }
        }
        catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Signup function
    const signup = async (email, password, name, role) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name, role }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Signup failed');
            }
            const data = await response.json();
            // If token is provided, user is logged in
            if (data.token) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken || '');
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            }
            else {
                // Email confirmation required
                throw new Error(data.message || 'Please check your email to confirm your account');
            }
        }
        catch (error) {
            console.error('Signup error:', error);
            throw new Error(error.message || 'Signup failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: {
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            signup,
            logout,
        }, children: children }));
};
exports.AuthProvider = AuthProvider;
// Auth hook
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (!context) {
        // Provide default values instead of throwing an error
        return {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            login: async () => { console.warn('Auth context not initialized'); },
            signup: async () => { console.warn('Auth context not initialized'); },
            logout: () => { console.warn('Auth context not initialized'); }
        };
    }
    return context;
};
exports.useAuth = useAuth;
