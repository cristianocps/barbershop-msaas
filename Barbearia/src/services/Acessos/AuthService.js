import { api } from '../api';

export const AuthService = {
    login: (email, password) => {
        return api.post('/api/Acessos/login', { email, password });
    },
    registrar: (email, password) => {
        return api.post('/api/Acessos/registrar', { email, password });
    },
    logout: () => {
        return api.post('/api/Acessos/logout');
    }
};
