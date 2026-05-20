-- Duração dos serviços e snapshot na agenda (minutos)
ALTER TABLE public.servicos
    ADD COLUMN IF NOT EXISTS duracao_minutos INTEGER NOT NULL DEFAULT 30;

ALTER TABLE public.agendamentos
    ADD COLUMN IF NOT EXISTS duracao_minutos INTEGER NOT NULL DEFAULT 30;

-- Serviços demo (ids fixos do seed)
UPDATE public.servicos SET duracao_minutos = 30 WHERE id = 1;
UPDATE public.servicos SET duracao_minutos = 20 WHERE id = 2;
UPDATE public.servicos SET duracao_minutos = 50 WHERE id = 3;

-- Agendamentos existentes: soma das durações dos itens
UPDATE public.agendamentos a
SET duracao_minutos = sub.total
FROM (
    SELECT
        ai.idagendamento,
        COALESCE(NULLIF(SUM(s.duracao_minutos), 0), 30) AS total
    FROM public.agendamento_itens ai
    JOIN public.servicos s ON s.id = ai.idservico
    GROUP BY ai.idagendamento
) sub
WHERE a.id = sub.idagendamento;
