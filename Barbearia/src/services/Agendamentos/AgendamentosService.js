import { api } from '../api';
import { unwrapApiResponse, pickField } from '../apiHelpers';

const BASE_PATH = '/api/Agendamentos/Agendamentos';

export const AgendamentosService = {
    carregarGrid: (search = null, start = 0, length = 10) => {
        return api.post(`${BASE_PATH}/carregargrid-agendamentos?start=${start}&length=${length}&draw=1`, {
            value: search?.value || "",
            regex: "false"
        });
    },
    carregarCombo: (search = "", page = 1) => {
        return api.get(`${BASE_PATH}/carregarcombo-agendamentos?search=${search}&page=${page}`);
    },
    editar: (id) => {
        return api.post(`${BASE_PATH}/editar-agendamentos?idItem=${id}`);
    },
    alterar: (dados) => {
        return api.post(`${BASE_PATH}/alterar-agendamentos`, dados);
    },
    alterarStatus: (id, status) => {
        return api.put(`${BASE_PATH}/alterar-status-agendamentos/${id}`, status);
    },
    getPendentesHoje: () => {
        return api.get(`${BASE_PATH}/get-pendentes-hoje`);
    },
    getProximos: () => {
        return api.get(`${BASE_PATH}/proximos`);
    },
    carregarCalendario: (inicio, fim) => {
        const toParam = (d) => {
            if (!(d instanceof Date)) return d;
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };
        return api.get(
            `${BASE_PATH}/carregar-calendario?inicio=${encodeURIComponent(toParam(inicio))}&fim=${encodeURIComponent(toParam(fim))}`
        );
    },
    confirmar: (id) => api.post(`${BASE_PATH}/${id}/confirmar`),
    cancelar: (id, motivo = '') => api.post(`${BASE_PATH}/${id}/cancelar`, { motivo }),
    concluir: (id, dados) => api.post(`${BASE_PATH}/${id}/concluir`, dados),
    gerarLinkPagamento: async (id) => {
        const res = await api.post(`${BASE_PATH}/${id}/pagamento/link`);
        const { ok, data, message } = unwrapApiResponse(res);
        if (!ok) throw new Error(message);
        const url = pickField(data, 'Url', 'url');
        if (!url) throw new Error('Link não retornado pela API');
        return { url, gatewayOrderNsu: pickField(data, 'GatewayOrderNsu', 'gatewayOrderNsu') };
    },
    obterTapUrl: async (id, metodo = 'credit', parcelas = 1) => {
        const res = await api.get(`${BASE_PATH}/${id}/pagamento/tap-url?metodo=${metodo}&parcelas=${parcelas}`);
        const { ok, data, message } = unwrapApiResponse(res);
        if (!ok) throw new Error(message);
        const tapUrl = pickField(data, 'TapUrl', 'tapUrl');
        if (!tapUrl) throw new Error('URL Tap não retornada pela API');
        return { tapUrl, gatewayOrderNsu: pickField(data, 'GatewayOrderNsu', 'gatewayOrderNsu') };
    },
    tapCallback: (dados) => api.post(`${BASE_PATH}/tap-callback`, dados),
    obterPagamento: (id) => api.get(`${BASE_PATH}/${id}/pagamento`),
};

const FINANCEIRO_PATH = '/api/Agendamentos/Financeiro';

export const FinanceiroService = {
    resumo: (inicio, fim, idProfissional = null, tipoPagamento = null) => {
        const p = new URLSearchParams({
            inicio: inicio instanceof Date ? inicio.toISOString() : inicio,
            fim: fim instanceof Date ? fim.toISOString() : fim,
        });
        if (idProfissional) p.set('idProfissional', idProfissional);
        if (tipoPagamento) p.set('tipoPagamento', tipoPagamento);
        return api.get(`${FINANCEIRO_PATH}/resumo?${p}`);
    },
    lancamentos: (inicio, fim, idProfissional = null, tipoPagamento = null) => {
        const p = new URLSearchParams({
            inicio: inicio instanceof Date ? inicio.toISOString() : inicio,
            fim: fim instanceof Date ? fim.toISOString() : fim,
        });
        if (idProfissional) p.set('idProfissional', idProfissional);
        if (tipoPagamento) p.set('tipoPagamento', tipoPagamento);
        return api.get(`${FINANCEIRO_PATH}/lancamentos?${p}`);
    },
};

export const TIPO_PAGAMENTO = {
    PIX_MANUAL: 1,
    PIX_INFINITE: 2,
    CARTAO_CREDITO: 3,
    CARTAO_DEBITO: 4,
    DINHEIRO: 5,
    INFINITE_TAP: 6,
};

export const TIPO_PAGAMENTO_LABEL = {
    1: 'PIX (manual)',
    2: 'PIX (Infinite Pay)',
    3: 'Cartão crédito',
    4: 'Cartão débito',
    5: 'Dinheiro',
    6: 'Tap Infinite Pay',
};
