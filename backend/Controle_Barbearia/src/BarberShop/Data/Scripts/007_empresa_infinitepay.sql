-- Infinite Pay por empresa (multi-loja)
ALTER TABLE public.empresas
    ADD COLUMN IF NOT EXISTS infinitepay_handle VARCHAR(100),
    ADD COLUMN IF NOT EXISTS infinitepay_webhook_secret VARCHAR(255);
