ALTER TABLE public.clientes
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

CREATE INDEX IF NOT EXISTS idx_clientes_busca
    ON public.clientes (idempresa, status);
