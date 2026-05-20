/**
 * Desembrulha respostas padrão do backend: { JsonTypes, Mensagem, Data, RecordsTotal }
 */
export function unwrapApiResponse(res) {
    if (!res || typeof res !== 'object') {
        return { ok: false, data: null, message: 'Resposta inválida da API' };
    }

    const jsonType = String(res.JsonTypes ?? res.jsonTypes ?? 'success').toLowerCase();
    const message = res.Mensagem ?? res.mensagem ?? '';

    if (jsonType === 'error') {
        return { ok: false, data: null, message: message || 'Erro na operação' };
    }

    let data = res.Data ?? res.data ?? null;
    if (typeof data === 'string' && data.trim().startsWith('{')) {
        try {
            data = JSON.parse(data);
        } catch {
            /* mantém string */
        }
    }

    return { ok: true, data, message };
}

/** Lê campo ignorando PascalCase / camelCase */
export function pickField(obj, ...keys) {
    if (!obj || typeof obj !== 'object') return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
        }
    }
    const lower = Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])
    );
    for (const key of keys) {
        const v = lower[key.toLowerCase()];
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
}
