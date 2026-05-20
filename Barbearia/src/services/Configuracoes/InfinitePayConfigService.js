import { api } from '../api';
import { unwrapApiResponse, pickField } from '../apiHelpers';

const BASE = '/api/Configuracoes/InfinitePayConfig';

function mapConfig(data) {
    return {
        idEmpresa: pickField(data, 'IdEmpresa', 'idEmpresa'),
        descricaoEmpresa: pickField(data, 'DescricaoEmpresa', 'descricaoEmpresa') ?? '',
        handle: pickField(data, 'Handle', 'handle') ?? '',
        webhookSecret: pickField(data, 'WebhookSecret', 'webhookSecret') ?? '',
    };
}

export const InfinitePayConfigService = {
    obter: async () => {
        const res = await api.get(BASE);
        const { ok, data, message } = unwrapApiResponse(res);
        if (!ok) throw new Error(message);
        return mapConfig(data);
    },
    salvar: async ({ handle }) => {
        const res = await api.put(BASE, { handle: handle ?? '' });
        const { ok, data, message } = unwrapApiResponse(res);
        if (!ok) throw new Error(message);
        return data ? mapConfig(data) : null;
    },
    regenerarSecret: async () => {
        const res = await api.post(`${BASE}/regenerar-secret`);
        const { ok, data, message } = unwrapApiResponse(res);
        if (!ok) throw new Error(message);
        return pickField(data, 'WebhookSecret', 'webhookSecret') ?? '';
    },
};
