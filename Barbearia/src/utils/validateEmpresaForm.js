const MAX = {
    descricao: 150,
    cidade: 150,
    endereco: 60,
    telefone: 15,
    slug: 100,
};

export function validateEmpresaForm(form, { requireSlug = false } = {}) {
    const errors = {};

    const descricao = (form.descricao || '').trim();
    if (!descricao) {
        errors.descricao = 'Informe o nome da barbearia.';
    } else if (descricao.length > MAX.descricao) {
        errors.descricao = `Nome deve ter no máximo ${MAX.descricao} caracteres.`;
    }

    const cidade = (form.cidade || '').trim();
    if (!cidade) {
        errors.cidade = 'Informe a cidade.';
    } else if (cidade.length > MAX.cidade) {
        errors.cidade = `Cidade deve ter no máximo ${MAX.cidade} caracteres.`;
    }

    const endereco = (form.endereco || '').trim();
    if (!endereco) {
        errors.endereco = 'Informe o endereço.';
    } else if (endereco.length > MAX.endereco) {
        errors.endereco = `Endereço deve ter no máximo ${MAX.endereco} caracteres.`;
    }

    const telefone = (form.telefone || '').trim();
    if (!telefone) {
        errors.telefone = 'Informe o telefone.';
    } else if (telefone.length > MAX.telefone) {
        errors.telefone = `Telefone deve ter no máximo ${MAX.telefone} caracteres.`;
    }

    const slug = (form.slug || '').trim();
    if (requireSlug && !slug) {
        errors.slug = 'Informe o link de agendamento (slug).';
    } else if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        errors.slug = 'Use apenas letras minúsculas, números e hífens.';
    } else if (slug.length > MAX.slug) {
        errors.slug = `Link deve ter no máximo ${MAX.slug} caracteres.`;
    }

    const email = (form.email || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'E-mail inválido.';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

export function buildEmpresaApiPayload(form) {
    const descricao = (form.descricao || '').trim();
    const cidade = (form.cidade || '').trim();
    const endereco = (form.endereco || '').trim().slice(0, MAX.endereco);
    const telefone = (form.telefone || '').trim().slice(0, MAX.telefone);
    const slug = (form.slug || '').trim().slice(0, MAX.slug);
    const id = form.id || 0;
    const dt = new Date().toISOString();

    return {
        id,
        ID: id,
        descricao,
        Descricao: descricao,
        cidade,
        Cidade: cidade,
        endereco,
        Endereco: endereco,
        telefone,
        Telefone: telefone,
        slug: slug || null,
        Slug: slug || null,
        email: (form.email || '').trim(),
        cnpj: (form.cnpj || '').trim(),
        logoData: form.logoData || '',
        LogoData: form.logoData || '',
        status: form.status ?? 1,
        Status: form.status ?? 1,
        infinitepayHandle: form.infinitepayHandle || '',
        InfinitepayHandle: form.infinitepayHandle || '',
        horariosConfig: form.horariosConfig ? JSON.stringify(form.horariosConfig) : null,
        HorariosConfig: form.horariosConfig ? JSON.stringify(form.horariosConfig) : null,
        dtCriacao: dt,
        DtCriacao: dt,
    };
}
