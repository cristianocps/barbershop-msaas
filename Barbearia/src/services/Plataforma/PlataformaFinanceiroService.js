import { api } from '../api';

const BASE_PATH = '/api/Plataforma/PlataformaFinanceiro';

export const PlataformaFinanceiroService = {
    listarEmpresas: (status) => {
        const q = status ? `?status=${encodeURIComponent(status)}` : '';
        return api.get(`${BASE_PATH}/empresas${q}`);
    },
    listarCobrancas: (idEmpresa) => api.get(`${BASE_PATH}/empresas/${idEmpresa}/cobrancas`),
    atualizarAssinatura: (idEmpresa, dados) => api.put(`${BASE_PATH}/empresas/${idEmpresa}`, dados),
    gerarLink: (idEmpresa) => api.post(`${BASE_PATH}/empresas/${idEmpresa}/gerar-link`, {}),
};
