import { normalizeRole, POLICY_LEVELS } from './userPolicy';

export function decodeToken(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
}

function addRolesToSet(target, value) {
    if (value == null) return;
    if (Array.isArray(value)) {
        value.forEach((v) => addRolesToSet(target, v));
        return;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                addRolesToSet(target, parsed);
                return;
            } catch { /* not json */ }
        }
        target.add(trimmed);
    }
}

/** Extrai roles do JWT e/ou da resposta da API (Roles). */
export function extractRolesFromPayload(decoded, apiRoles, accountType) {
    const roles = new Set();

    addRolesToSet(roles, apiRoles);
    addRolesToSet(roles, decoded.app_roles);
    addRolesToSet(roles, decoded.role);
    addRolesToSet(roles, decoded.roles);
    addRolesToSet(roles, decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);

    Object.entries(decoded).forEach(([key, val]) => {
        if (/role/i.test(key)) addRolesToSet(roles, val);
    });

    let list = [...roles];

    if (list.length === 0 && accountType === 'barbearia') {
        list = ['Profissional'];
    }
    if (list.length === 0 && accountType === 'cliente') {
        list = ['Cliente'];
    }

    return list;
}

export function buildUserFromAuth(decoded, apiRoles, accountType) {
    const userName =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
        || decoded.unique_name
        || decoded.name
        || 'Usuário';

    const userEmail =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        || decoded.email
        || decoded.sub
        || '';

    const roles = extractRolesFromPayload(decoded, apiRoles, accountType);

    let userMaxPolicy = 0;
    roles.forEach((role) => {
        const level = POLICY_LEVELS[normalizeRole(role)] ?? 0;
        if (level > userMaxPolicy) userMaxPolicy = level;
    });

    if (userMaxPolicy === 0 && accountType === 'barbearia') {
        userMaxPolicy = POLICY_LEVELS.profissional;
    }

    return {
        name: userName,
        email: userEmail,
        roles,
        userMaxPolicy,
        accountType: accountType || (roles.some((r) => normalizeRole(r) === 'cliente') ? 'cliente' : 'barbearia'),
    };
}

export function extractToken(data) {
    return data?.Token ?? data?.token ?? null;
}

export function extractRolesFromApi(data) {
    const raw = data?.Roles ?? data?.roles;
    if (!raw) return undefined;
    return Array.isArray(raw) ? raw : [raw];
}

export function extractAccountTypeFromApi(data) {
    return data?.accountType ?? data?.AccountType ?? null;
}

export const AUTH_ACCOUNT_TYPE_KEY = 'auth_account_type';
export const AUTH_ROLES_KEY = 'auth_roles';
