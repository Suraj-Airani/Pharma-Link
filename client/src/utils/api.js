import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — auto-attach JWT token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('pharmalink_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle expired tokens
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.code === 'TOKEN_EXPIRED') {
            localStorage.removeItem('pharmalink_token');
            localStorage.removeItem('pharmalink_admin');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
