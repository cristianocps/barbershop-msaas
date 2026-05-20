-- Resolve usuário e empresa logados a partir do e-mail (usado pelo BasicController).
CREATE OR REPLACE FUNCTION public.fn_obter_credenciais(p_email TEXT)
RETURNS TABLE(ret_id BIGINT, ret_idempresa BIGINT)
LANGUAGE sql
STABLE
AS $$
    SELECT
        u.id,
        COALESCE(u.idempresa, 0)::BIGINT
    FROM public.usuarios u
    WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(p_email))
    LIMIT 1;
$$;
