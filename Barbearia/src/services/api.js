// Em produção, VITE_API_URL é "" (vazio) → chamadas relativas (/api/...)
// O Nginx intercepta /api/* e faz proxy para o backend internamente.
// Usa ?? em vez de || para que string vazia não caia no fallback do localhost.
import { dispatchAssinaturaBloqueada } from '../utils/assinaturaBloqueio';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Cliente HTTP Base (Fetch Wrapper)
 * - Injeta o header Authorization (Bearer token) automaticamente.
 * - Centraliza o prefixo da URL.
 * - 402 (assinatura): não propaga como erro genérico — evento global + flag suppressToast.
 */
async function client(endpoint, { body, ...customConfig } = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config = {
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (customConfig.customBody) {
        config.body = customConfig.customBody;
        delete config.customBody;
    } else if (body !== undefined && body !== null) {
        config.body = JSON.stringify(body);
    }

    let data;
    let response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, config);

        const text = await response.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { mensagem: text || `Erro HTTP ${response.status}` };
        }

        if (response.status === 402) {
            const blockedPayload = data.blocked !== undefined ? data : (data.data || data);
            dispatchAssinaturaBloqueada(blockedPayload);
            const err = new Error(
                blockedPayload.message || blockedPayload.mensagem || data.mensagem || 'Pagamento da plataforma em atraso.'
            );
            err.status = 402;
            err.isAssinaturaBloqueada = true;
            err.suppressToast = true;
            err.data = blockedPayload;
            return Promise.reject(err);
        }

        if (!response.ok) {
            const err = new Error(data.mensagem || data.message || `Erro HTTP ${response.status}`);
            err.status = response.status;
            err.data = data;
            return Promise.reject(err);
        }

        return data;
    } catch (err) {
        if (err?.isAssinaturaBloqueada) return Promise.reject(err);
        if (err instanceof TypeError && err.message?.includes('fetch')) {
            const netErr = new Error('Falha de conexão com o servidor.');
            netErr.status = 0;
            return Promise.reject(netErr);
        }
        return Promise.reject(err);
    }
}

export const api = {
    get: (url, config = {}) => client(url, { method: 'GET', ...config }),
    post: (url, body, config = {}) => client(url, { method: 'POST', body, ...config }),
    put: (url, body, config = {}) => client(url, { method: 'PUT', body, ...config }),
    delete: (url, config = {}) => client(url, { method: 'DELETE', ...config }),
    postForm: (url, formDataObj, config = {}) => {
        const params = new URLSearchParams();
        Object.entries(formDataObj).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                params.append(key, value);
            }
        });

        return client(url, {
            method: 'POST',
            customBody: params.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            ...config,
        });
    },
};
