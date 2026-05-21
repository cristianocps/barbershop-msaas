import { api } from '../api';

export const AuthService = {
    login: (email, password) => api.post('/api/Acessos/login', { email, password }),
    registrar: (payload) => api.post('/api/Acessos/registrar', payload),
    loginGoogle: (payload) => api.post('/api/Acessos/google', payload),
    logout: () => api.post('/api/Acessos/logout'),
    me: () => api.get('/api/Acessos/me'),
};
