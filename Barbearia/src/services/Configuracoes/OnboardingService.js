import { api } from '../api';

export const OnboardingService = {
    obterStatus: () => api.get('/api/Configuracoes/Onboarding/status'),
    concluir: () => api.post('/api/Configuracoes/Onboarding/concluir'),
    salvarEtapasTour: (json) => api.put('/api/Configuracoes/Onboarding/etapas-tour', { json }),
};
