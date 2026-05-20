ALTER TABLE public.agendamentos
    ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
    ADD COLUMN IF NOT EXISTS dt_confirmacao TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS dt_conclusao TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS dt_cancelamento TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.agendamento_pagamentos (
    id                      BIGSERIAL PRIMARY KEY,
    idempresa               BIGINT NOT NULL,
    idagendamento           BIGINT NOT NULL,
    tipo_pagamento          SMALLINT NOT NULL,
    valor                   NUMERIC(10,2) NOT NULL DEFAULT 0,
    parcelas                INTEGER,
    gateway                 VARCHAR(50) NOT NULL DEFAULT 'manual',
    gateway_order_nsu       VARCHAR(100),
    gateway_transaction_nsu VARCHAR(100),
    gateway_link_url        TEXT,
    gateway_status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    comprovante_url         TEXT,
    observacao              TEXT,
    dtcriacao               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dtconfirmacao           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agendamento_pagamentos_agendamento
    ON public.agendamento_pagamentos (idagendamento);

CREATE INDEX IF NOT EXISTS idx_agendamento_pagamentos_empresa_dt
    ON public.agendamento_pagamentos (idempresa, dtconfirmacao);
