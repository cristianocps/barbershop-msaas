-- Contas globais de clientes autenticados
CREATE TABLE IF NOT EXISTS public.contas_cliente (
    id BIGSERIAL PRIMARY KEY,
    idclains VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(15),
    dtcriacao TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    status SMALLINT NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_contas_cliente_idclains ON public.contas_cliente (idclains);
CREATE UNIQUE INDEX IF NOT EXISTS ix_contas_cliente_email ON public.contas_cliente (LOWER(email));

-- Vínculo cliente CRM -> conta global
ALTER TABLE public.clientes
    ADD COLUMN IF NOT EXISTS idconta BIGINT REFERENCES public.contas_cliente(id);

CREATE INDEX IF NOT EXISTS ix_clientes_idconta ON public.clientes (idconta);

-- Onboarding da barbearia
ALTER TABLE public.empresas
    ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS onboarding_etapas JSONB;
