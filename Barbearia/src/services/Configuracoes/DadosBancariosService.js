import { api } from '../api';

const BASE_PATH = '/api/Basico/Dadosbancarios';

export const DadosBancariosService = {
    // ---- TIPOS DE CHAVE ----
    carregarGridTipoChave: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-tipochave?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarComboTipoChaves: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-tipochavepix?search=${search}&page=${page}`);
    },
    alterarTipoChave: (dados) => {
        return api.post(`${BASE_PATH}/alterar-tipochavepix`, dados);
    },
    editarTipoChave: (id) => {
        return api.post(`${BASE_PATH}/editar-tipochavepix?idItem=${id}`);
    },
    alterarStatusTipoChave: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-tipochavepix/${id}`, status);
    },

    // ---- DADOS BANCÁRIOS (CHAVES PIX) ----
    carregarGridDadosBancarios: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-dadosbancarios?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    alterarDadosBancarios: (dados) => {
        return api.post(`${BASE_PATH}/alterar-dadosbancarios`, dados);
    },
    editarDadosBancarios: (id) => {
        return api.post(`${BASE_PATH}/editar-dadosbancarios?idItem=${id}`);
    },
    alterarStatusDadosBancarios: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-dadosbancarios/${id}`, status);
    },
    descriptografarChave: (id, senha) => {
        return api.post(`${BASE_PATH}/descriptografar-chavepix`, { id, senha });
    }
};
