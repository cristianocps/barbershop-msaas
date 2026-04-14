import { api } from '../api';

const BASE_PATH = '/api/Configuracoes/Empresas';

export const EmpresasService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-empresas?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-empresas?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-empresas?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-empresas`, dados);
    },
    alterarStatus: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-empresas/${id}`, status);
    }
};
