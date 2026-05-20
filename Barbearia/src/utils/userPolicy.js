const POLICY_LEVELS = {
    consulta: 1,
    usuario: 2,
    profissional: 3,
    gerente: 4,
    admin: 5,
    desenvolvedor: 6,
};

export function getUserMaxPolicy(user) {
    if (!user?.roles?.length) return 0;
    let max = 0;
    user.roles.forEach((role) => {
        const norm = (role || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const level = POLICY_LEVELS[norm] || 0;
        if (level > max) max = level;
    });
    return max;
}

/** Usuário da equipe da plataforma (não opera uma barbearia específica). */
export function isPlataformaStaff(user) {
    return getUserMaxPolicy(user) >= POLICY_LEVELS.desenvolvedor;
}
