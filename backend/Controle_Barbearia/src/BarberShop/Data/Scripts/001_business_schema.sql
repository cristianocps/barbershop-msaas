-- Schema das tabelas de negócio (Dapper). Idempotente via IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS public.empresas (
    id          BIGSERIAL PRIMARY KEY,
    idusuario   BIGINT NOT NULL,
    descricao   VARCHAR(150) NOT NULL,
    cidade      VARCHAR(150),
    dtcriacao   TIMESTAMP NOT NULL DEFAULT NOW(),
    telefone    VARCHAR(15) NOT NULL DEFAULT '',
    endereco    VARCHAR(60) NOT NULL DEFAULT '',
    logo_data   TEXT,
    status      SMALLINT NOT NULL DEFAULT 1,
    slug        VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS public.usuarios (
    id          BIGSERIAL PRIMARY KEY,
    idempresa   BIGINT,
    documento   VARCHAR(15) NOT NULL,
    descricao   VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    cidade      VARCHAR(150),
    logon       VARCHAR(150),
    senha       VARCHAR(15),
    idclains    VARCHAR(50),
    dtcriacao   TIMESTAMP NOT NULL DEFAULT NOW(),
    telefone    VARCHAR(15) NOT NULL DEFAULT '',
    status      SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.perfil (
    id          BIGSERIAL PRIMARY KEY,
    idempresa   BIGINT NOT NULL,
    codigo      SMALLINT NOT NULL,
    idrole      VARCHAR(50) NOT NULL,
    descricao   VARCHAR(50) NOT NULL,
    status      SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.servicos (
    id              BIGSERIAL PRIMARY KEY,
    idempresa       BIGINT NOT NULL,
    idusuario       BIGINT NOT NULL,
    descricao       VARCHAR(150) NOT NULL,
    unidade         VARCHAR(50),
    valor_unitario  NUMERIC(10,2) NOT NULL DEFAULT 0,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    dtcriacao       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.profissionais (
    id          BIGSERIAL PRIMARY KEY,
    idempresa   BIGINT NOT NULL,
    idusuario   BIGINT,
    descricao   VARCHAR(150) NOT NULL,
    telefone    VARCHAR(15),
    cor_agenda  VARCHAR(7) NOT NULL DEFAULT '#000000',
    dtcriacao   TIMESTAMP NOT NULL DEFAULT NOW(),
    status      SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.profissionais_horarios (
    id              BIGSERIAL PRIMARY KEY,
    idempresa       BIGINT NOT NULL,
    idprofissional  BIGINT NOT NULL,
    dia_semana      INTEGER NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fim        TIME NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    dtcriacao       TIMESTAMP NOT NULL DEFAULT NOW(),
    status          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.clientes (
    id          BIGSERIAL PRIMARY KEY,
    idempresa   BIGINT NOT NULL,
    idusuario   BIGINT NOT NULL DEFAULT 0,
    descricao   VARCHAR(150) NOT NULL,
    telefone    VARCHAR(15),
    cpf         VARCHAR(14),
    endereco    VARCHAR(60),
    dtcriacao   TIMESTAMP NOT NULL DEFAULT NOW(),
    status      SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
    id              BIGSERIAL PRIMARY KEY,
    idempresa       BIGINT NOT NULL,
    idprofissional  BIGINT NOT NULL,
    idusuario       BIGINT NOT NULL,
    idcliente       BIGINT NOT NULL,
    descricao       VARCHAR(150) NOT NULL,
    dtagendamento   TIMESTAMPTZ NOT NULL,
    dtcriacao       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    telefone        VARCHAR(15) NOT NULL DEFAULT '',
    observacao      TEXT,
    status          INTEGER NOT NULL DEFAULT 1,
    comprovante_pix TEXT,
    duracao_minutos INTEGER NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS public.agendamento_itens (
    id              BIGSERIAL PRIMARY KEY,
    idempresa       BIGINT NOT NULL,
    idusuario       BIGINT NOT NULL DEFAULT 0,
    idagendamento   BIGINT NOT NULL,
    idservico       BIGINT NOT NULL,
    valor_cobrado   NUMERIC(10,2) NOT NULL DEFAULT 0,
    status          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.tipochave (
    id          BIGSERIAL PRIMARY KEY,
    idempresa   BIGINT NOT NULL,
    idusuario   BIGINT NOT NULL,
    descricao   VARCHAR(150) NOT NULL,
    dtcriacao   TIMESTAMP NOT NULL DEFAULT NOW(),
    status      SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.dadosbancarios (
    id              BIGSERIAL PRIMARY KEY,
    idempresa       BIGINT NOT NULL,
    idusuario       BIGINT NOT NULL,
    idtipochavepix  BIGINT NOT NULL,
    descricao       VARCHAR(150) NOT NULL,
    chave_vitrine   TEXT,
    dtcriacao       TIMESTAMP NOT NULL DEFAULT NOW(),
    status          SMALLINT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS ix_empresas_slug ON public.empresas (slug);
CREATE INDEX IF NOT EXISTS ix_usuarios_email ON public.usuarios (email);
CREATE INDEX IF NOT EXISTS ix_agendamentos_empresa_data ON public.agendamentos (idempresa, dtagendamento);
