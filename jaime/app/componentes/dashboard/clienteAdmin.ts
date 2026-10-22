import axios from 'axios';

// peticiones del dashboard: mandan la cookie de sesion y, si la sesion vencio, llevan al login
export const clienteAdmin = axios.create({withCredentials: true});

clienteAdmin.interceptors.response.use(undefined, error => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard/login')) {
        window.location.assign('/dashboard/login');
    }
    return Promise.reject(error);
});
