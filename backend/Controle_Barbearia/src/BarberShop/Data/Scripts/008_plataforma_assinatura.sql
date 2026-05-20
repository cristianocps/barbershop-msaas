-- Assinatura da plataforma (cobrança SaaS por barbearia)
CREATE TABLE IF NOT EXISTS public.empresa_assinaturas (
    idempresa               BIGINT PRIMARY KEY REFERENCES public.empresas(id) ON DELETE CASCADE,
    status                  VARCHAR(20) NOT NULL DEFAULT 'trial',
    trial_ends_at           TIMESTAMP NOT NULL,
    periodo_inicio          TIMESTAMP,
    periodo_fim             TIMESTAMP,
    valor_mensal_centavos   INT NOT NULL DEFAULT 9900,
    dtultimopagamento       TIMESTAMP,
    dtatualizacao           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_empresa_assinaturas_status ON public.empresa_assinaturas (status);

CREATE TABLE IF NOT EXISTS public.plataforma_cobrancas (
    id                  BIGSERIAL PRIMARY KEY,
    idempresa           BIGINT NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    referencia          VARCHAR(10) NOT NULL,
    order_nsu           VARCHAR(120) NOT NULL,
    gateway_link_url    TEXT,
    gateway_status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    gateway_transaction_nsu VARCHAR(120),
    valor_centavos      INT NOT NULL,
    dtcriacao           TIMESTAMP NOT NULL DEFAULT NOW(),
    dtpagamento         TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_plataforma_cobrancas_order_nsu ON public.plataforma_cobrancas (order_nsu);
CREATE INDEX IF NOT EXISTS ix_plataforma_cobrancas_empresa ON public.plataforma_cobrancas (idempresa, dtcriacao DESC);

-- Backfill: empresas sem assinatura recebem trial de 14 dias
INSERT INTO public.empresa_assinaturas (idempresa, status, trial_ends_at, valor_mensal_centavos)
SELECT e.id, 'trial', NOW() + INTERVAL '14 days', 9900
FROM public.empresas e
WHERE NOT EXISTS (SELECT 1 FROM public.empresa_assinaturas a WHERE a.idempresa = e.id);

-- Empresa demo (id=1): trial longo para não bloquear desenvolvimento local
UPDATE public.empresa_assinaturas
SET status = 'active', trial_ends_at = NOW() + INTERVAL '365 days',
    periodo_inicio = NOW(), periodo_fim = NOW() + INTERVAL '365 days'
WHERE idempresa = 1;
