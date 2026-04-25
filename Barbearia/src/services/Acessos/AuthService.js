import { api } from '../api';

export const AuthService = {
    login: (email, password) => {
        return api.post('/api/Acessos/login', { email, password });
    },
    registrar: (email, password, confirmPassword) => {
        return api.post('/api/Acessos/registrar', { email, password, confirmPassword });
    },
    logout: () => {
        return api.post('/api/Acessos/logout');
    }
};
