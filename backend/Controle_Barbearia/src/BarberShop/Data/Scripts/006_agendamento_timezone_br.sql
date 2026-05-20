-- Corrige agendamentos em que a hora local foi gravada como se fosse UTC
-- (ex.: usuário escolheu 08:30 e o banco ficou com 08:30+00 em vez de 11:30+00).
-- Idempotente: após corrigido, rodar de novo não altera o horário exibido no Brasil.

UPDATE public.agendamentos
SET dtagendamento = (dtagendamento AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo'
WHERE dtagendamento IS NOT NULL;
