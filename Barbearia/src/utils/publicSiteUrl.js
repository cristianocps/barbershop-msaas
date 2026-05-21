/**
 * Origem pública do site (vitrine / agendamento).
 * Em produção: mesmo host do app (VITE_PUBLIC_SITE_URL vazio → window.location.origin).
 * Em dev com API em outro host: defina VITE_PUBLIC_SITE_URL=https://seu-dominio.com
 */
export function getPublicSiteOrigin() {
    const configured = (import.meta.env.VITE_PUBLIC_SITE_URL ?? '').trim().replace(/\/$/, '');
    if (configured) return configured;
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    return '';
}

export function getVitrineUrl(slug) {
    const s = (slug || '').trim().replace(/^\/+/, '');
    if (!s) return '';
    const origin = getPublicSiteOrigin();
    return origin ? `${origin}/${s}` : `/${s}`;
}

/** Texto curto para prefixo do campo slug (ex.: agendamento.seudominio.com/) */
export function getSlugPrefixLabel() {
    const origin = getPublicSiteOrigin();
    if (!origin) return '/';
    try {
        const host = new URL(origin).host;
        return `${host}/`;
    } catch {
        return `${origin.replace(/^https?:\/\//, '')}/`;
    }
}
