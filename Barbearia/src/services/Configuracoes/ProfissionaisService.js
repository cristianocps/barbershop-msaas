import { api } from '../api';

const BASE_PATH = '/api/Configuracoes/Profissionais';

export const ProfissionaisService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-profissionais?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-profissionais?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-profissionais?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-profissionais`, dados);
    },
    alterarStatus: (id, status = 0) => {
        // Seguindo o padrao dos demais, ou PUT com raw body do status
        return api.put(`${BASE_PATH}/alterar-status-profissionais/${id}`, status, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
