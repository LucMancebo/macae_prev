# Dicionário de Dados - Sistema MACAEPREV

**Data:** 12 de maio de 2026  
**Tecnologia-Alvo:** PostgreSQL  
**ORM de Abstração:** Prisma ORM

Este documento detalha o Dicionário de Dados e as Entidades implementadas para suportar as operações consignáveis em atendimento às requisições do sistema da folha MACAEPREV.

---

## 1. Módulo de Segurança e Acesso

### 1.1 Entidade: `Usuario`

Responsável por autenticação e controle de escopo.

- `id` (UUID, PK): Identificador único da credencial.
- `nome` (String): Nome completo do usuário.
- `email` (String, Unique): E-mail validado para login.
- `senha_hash` (String): Senha cifrada através de algoritmo Bcryptjs.
- `perfil_id` (UUID, FK): Vínculo com a entidade `PerfilAcesso`.
- `consignataria_id` (UUID, Nullable, FK): Se não for um funcionário MACAEPREV, relaciona-se a um Banco específico.
- `status` (Enum): 'ATIVO', 'BLOQUEADO_TENTATIVAS', 'INATIVO'.
- `mfa_secret` (String, Nullable): Chave semente para o gerador TOTP.

### 1.2 Entidade: `PerfilAcesso`

Mapeamento granular do escopo de visão.

- `id` (UUID, PK): Identificador do perfil.
- `nome` (String, Unique): Ex: 'ADMINISTRADOR', 'CONSIGNATARIA', 'SERVIDOR'.
- `permissoes` (JSON): Vetor de claims autorizadas.

### 1.3 Entidade: `LogAuditoria`

Imutável (Append-only). Armazena pegadas da plataforma em respeito à LGPD.

- `id` (UUID, PK): ID do evento.
- `usuario_id` (UUID, FK): Quem executou a ação.
- `acao` (String): Descrição canônica (Ex: 'CONSIGNACAO_CRIADA').
- `entidade` (String): Tabela afetada (Ex: 'Consignacao').
- `registro_id` (String): O ID do item alterado.
- `detalhes` (JSON): Vetor contendo Snapshot _Before_ e _After_.
- `ip_origem` (String): Capturado pelo Header proxy.
- `created_at` (DateTime): Registro exato (em UTC) da infração ou uso.

---

## 2. Módulo Core: Servidores e Instituições

### 2.1 Entidade: `Servidor`

Dados do funcionalismo público da base MACAEPREV.

- `id` (UUID, PK): Chave relacional universal.
- `matricula` (String, Unique): Número no sistema de folha da Prefeitura.
- `cpf` (String, Unique): Validado e mascara-tratado.
- `nome` (String): Nome civil.
- `salario_base` (Decimal): Provê base para o teto de 30% da margem.
- `cargo` (String): Informação opcional de segmentação.
- `status` (Enum): 'ATIVO', 'AFASTADO', 'APOSENTADO'.

### 2.2 Entidade: `Consignataria`

Bancos, Associações e entidades habilitadas para empréstimos.

- `id` (UUID, PK): ID interno.
- `razao_social` (String): Nome empresarial.
- `cnpj` (String, Unique): Cadastro no MF.
- `tipo` (Enum): 'BANCO', 'SINDICATO', 'COOPERATIVA', 'PLANO_SAUDE'.
- `cet_maximo` (Decimal): Limitador de teto de juros aprovado na licitação.
- `status` (Enum): 'ATIVO', 'SUSPENSA'.

### 2.3 Entidade: `Produto`

Modalidade ofertada pelo Banco.

- `id` (UUID, PK).
- `consignataria_id` (UUID, FK).
- `nome` (String): Ex: "Empréstimo Rápido 24x".
- `tipo` (Enum): 'EMPRESTIMO', 'CARTAO', 'SEGURO'.
- `taxa_minima` / `taxa_maxima` (Decimal): Threshold de validação mensal.
- `averbacao` (Enum): 'NOMINAL' ou 'PERCENTUAL'.
- `prazo_minimo` / `prazo_maximo` (Integer): Quantidade de meses.

---

## 3. Módulo Core: Empréstimos (Consignações) e Margem

### 3.1 Entidade: `Margem` e `MargemServidor`

Gestão da régua legal da Consignação.

- **Margem:** Regras Globais. (`id`, `tipo`='EXCLUSIVA'/'COMPARTILHADA', `percentual_maximo`).
- **MargemServidor:** Cota diária do funcionário. (`servidor_id`, `margem_id`, `valor_total`, `valor_utilizado`).

### 3.2 Entidade: `Consignacao` (O Contrato Mestre)

Obrigação de dívida assumida.

- `id` (UUID, PK).
- `servidor_id` (UUID, FK).
- `consignataria_id` (UUID, FK).
- `produto_id` (UUID, FK).
- `valor_total` (Decimal): Quanto foi financiado.
- `taxa_juros` / `cet_percentual` (Decimal): Retenção de limites.
- `quantidade_parcelas` (Integer).
- `valor_parcela` (Decimal).
- `status_fluxo` (Enum): 'SOLICITADA', 'APROVADA', 'ATIVA', 'CANCELADA', 'QUITADA', 'PORTADA'.

### 3.3 Entidade: `Parcela`

Fatias do contrato destinadas à quitação na folha daquele mês.

- `id` (UUID, PK).
- `consignacao_id` (UUID, FK).
- `numero_parcela` (Integer).
- `valor` (Decimal).
- `competencia` (String): Mês base de desconto (Ex: '2026-05').
- `status_pagamento` (Enum): 'PREVISTA', 'PAGA', 'NAO_PAGA', 'ATRASO'.
- `arquivo_integracao_id` (UUID, Nullable, FK): Arquivo de repasse que deu baixa nela.
- `status_reconciliacao` (Enum): 'CONCILIADA', 'PENDENTE', 'ERRO_VALOR', 'ERRO_FK'.

---

## 4. Módulo Integração e Folha (Arquivo e Repasse)

### 4.1 Entidade: `ArquivoIntegracao` e `Repasse`

Dados de Input e Output da Prefeitura.

- **ArquivoIntegracao:** (`id`, `nome_arquivo`, `tipo`='FOLHA'|'RETORNO', `checksum` para evitar clone, `status`).
- **Repasse:** Fração que a folha deduz como taxa de admin MACAEPREV (`id`, `arquivo_id`, `parcela_id`, `tipo_movimento`='DESCONTO', `valor_receita`).
