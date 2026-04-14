import { api } from '../api';

const BASE_PATH = '/api/Agendamentos/Vitrine';

export const VitrineService = {
    carregarEmpresa: (slug) => {
        return api.get(`${BASE_PATH}/empresa/${slug}`);
    },
    carregarServicos: (idEmpresa) => {
        return api.get(`${BASE_PATH}/servicos/${idEmpresa}`);
    },
    carregarProfissionais: (idEmpresa) => {
        return api.get(`${BASE_PATH}/profissionais/${idEmpresa}`);
    },
    carregarHorariosLivres: (idProfissional, data) => {
        // data deve estar no formato ISO ou string que o backend aceite (ex: yyyy-MM-dd)
        return api.get(`${BASE_PATH}/horarios?idProfissional=${idProfissional}&data=${data}`);
    },
    confirmarAgendamento: (dados) => {
        return api.post(`${BASE_PATH}/confirmar`, dados);
    }
};
