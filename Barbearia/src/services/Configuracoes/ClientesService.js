import { api } from '../api';

const BASE_PATH = '/api/Configuracoes/Clientes';

export const ClientesService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-clientes?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-clientes?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-clientes?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-clientes`, dados);
    },
    alterarStatus: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-clientes/${id}`, status);
    }
};
