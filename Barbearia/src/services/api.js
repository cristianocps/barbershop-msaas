// Em produção, VITE_API_URL é "" (vazio) → chamadas relativas (/api/...)
// O Nginx intercepta /api/* e faz proxy para o backend internamente.
// Usa ?? em vez de || para que string vazia não caia no fallback do localhost.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Cliente HTTP Base (Fetch Wrapper)
 * - Injeta o header Authorization (Bearer token) automaticamente.
 * - Centraliza o prefixo da URL.
 * - Padroniza o tratamento de erros.
 */
async function client(endpoint, { body, ...customConfig } = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
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
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        
        // Verifica se a resposta não tem corpo (ex: HTTP 204 No Content)
        const text = await response.text();
        data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            // Se for 401 Unauthorized, possivelmente o token expirou
            if (response.status === 401) {
                // localStorage.removeItem('token');
                // window.location.href = '/login'; // Opcional: forçar logout
            }

            const erroMessage = data?.message || data?.title || 'Ocorreu um erro na requisição.';
            return Promise.reject(new Error(erroMessage));
        }

        return data; // Retorna o JSON manipulado
    } catch (err) {
        return Promise.reject(err);
    }
}

// Exporta métodos amigáveis
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
            // Não passa body no config pra não dar JSON.stringify, passa direto a string do URLSearchParams
            customBody: params.toString(), 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
            ...config 
        });
    }
};
