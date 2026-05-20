/** Erro 402 ou flag do cliente HTTP — assinatura da plataforma em atraso */
export function isAssinaturaBloqueioError(err) {
    return err?.status === 402 || err?.isAssinaturaBloqueada === true;
}

export function dispatchAssinaturaBloqueada(detail = {}) {
    window.dispatchEvent(new CustomEvent('assinatura-bloqueada', { detail }));
}
