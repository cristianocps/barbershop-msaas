import { api } from '../api';

const BASE_PATH = '/api/Acessos/Usuarios';

export const UsuariosService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-usuarios?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        // Envia como Query Params
        return api.get(`${BASE_PATH}/carregarcombo-usuarios?search=${search}&page=${page}`);
    },
    editar: (id) => {
        // Ajuste conforme o método exato
        return api.post(`${BASE_PATH}/editar-usuarios?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterarusuarios`, dados);
    },
    alterarStatus: (id) => {
        return api.post(`${BASE_PATH}/inativar-usuarios?idItem=${id}`);
    }
};
