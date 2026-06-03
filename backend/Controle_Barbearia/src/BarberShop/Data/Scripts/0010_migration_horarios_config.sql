-- Migration: Adiciona coluna horarios_config na tabela empresas
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS horarios_config jsonb DEFAULT NULL;
