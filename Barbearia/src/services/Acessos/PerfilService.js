import { api } from '../api';

const BASE_PATH = '/api/Acessos/Perfil';

export const PerfilService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-perfil?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-perfils?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-perfil?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-perfil`, dados);
    },
    alterarStatus: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-perfil/${id}`, status);
    }
};
