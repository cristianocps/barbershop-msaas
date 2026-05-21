import { api } from '../api';

export const PortalClienteService = {
    listarAgendamentos: () => api.get('/api/PortalCliente/agendamentos'),
    obterPerfil: () => api.get('/api/PortalCliente/perfil'),
    atualizarPerfil: (body) => api.put('/api/PortalCliente/perfil', body),
};
