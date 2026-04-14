import { api } from '../api';

const BASE_PATH = '/api/Agendamentos/Agendamentos';

export const AgendamentosService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-agendamentos?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-agendamentos?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-agendamentos?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-agendamentos`, dados);
    },
    alterarStatus: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-agendamentos/${id}`, status);
    }
};
