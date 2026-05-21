export const POLICY_LEVELS = {
    cliente: 0,
    consulta: 1,
    usuario: 2,
    profissional: 3,
    gerente: 4,
    admin: 5,
    desenvolvedor: 6,
};

export function normalizeRole(role) {
    return (role || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function getUserMaxPolicy(user) {
    if (!user?.roles?.length) return 0;
    let max = 0;
    user.roles.forEach((role) => {
        const level = POLICY_LEVELS[normalizeRole(role)] || 0;
        if (level > max) max = level;
    });
    return max;
}

export function isClienteUser(user) {
    return user?.roles?.some((r) => normalizeRole(r) === 'cliente') ?? false;
}

export function isPlataformaStaff(user) {
    return getUserMaxPolicy(user) >= POLICY_LEVELS.desenvolvedor;
}

export function isBarbeariaStaff(user) {
    return getUserMaxPolicy(user) >= POLICY_LEVELS.consulta && !isClienteUser(user);
}

/** Listagem/cadastro de várias barbearias no painel — somente Admin ou Desenvolvedor */
export function canManageAllEmpresas(user) {
    return getUserMaxPolicy(user) >= POLICY_LEVELS.admin;
}

export function isDemoEmpresa(empresa) {
    const id = empresa?.id ?? empresa?.ID ?? empresa?.Id;
    return Number(id) === 1;
}
