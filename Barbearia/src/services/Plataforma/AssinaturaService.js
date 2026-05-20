import { api } from '../api';
import { unwrapApiResponse } from '../apiHelpers';

const BASE_PATH = '/api/Plataforma/Assinatura';

function throwIfApiError(res) {
    const { ok, data, message } = unwrapApiResponse(res);
    if (!ok) {
        const err = new Error(message || 'Erro na operação');
        err.apiResponse = res;
        throw err;
    }
    return data;
}

export const AssinaturaService = {
    obterStatus: async () => {
        const res = await api.get(`${BASE_PATH}/status`);
        return throwIfApiError(res);
    },
    gerarLink: async () => {
        const res = await api.post(`${BASE_PATH}/gerar-link`, {});
        return throwIfApiError(res);
    },
};
