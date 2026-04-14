import { api } from '../api';

const BASE_PATH = '/api/Configuracoes/Servicos';

export const ServicosAppService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-servicos?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-servicos?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-servicos?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-servicos`, dados);
    },
    alterarStatus: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-servicos/${id}`, status);
    }
};
