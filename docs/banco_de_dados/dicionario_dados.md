# Dicionário de Dados — Sistema de Consignação MACAEPREV

---

## Tabela: servidores

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único do servidor |
| cpf | VARCHAR(11) | N | UK | CPF criptografado (AES-256) |
| nome | VARCHAR(200) | N | — | Nome completo |
| matricula | VARCHAR(20) | N | UK | Matrícula funcional |
| cargo | VARCHAR(100) | N | — | Cargo/função |
| situacao_funcional | ENUM('ATIVO','APOSENTADO','PENSIONISTA') | N | — | Situação do servidor |
| data_admissao | DATE | N | — | Data de ingresso no serviço público |
| remuneracao_bruta | DECIMAL(12,2) | N | — | Remuneração bruta mensal |
| status | ENUM('ATIVO','INATIVO','BLOQUEADO') | N | — | Status no sistema |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: consignatarias

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| cnpj | VARCHAR(14) | N | UK | CNPJ da instituição |
| razao_social | VARCHAR(200) | N | — | Razão social |
| nome_fantasia | VARCHAR(200) | S | — | Nome fantasia |
| tipo | ENUM('BANCO','SEGURADORA','PLANO_SAUDE','ASSOCIACAO','OUTROS') | N | — | Tipo da instituição |
| cet_maximo | DECIMAL(5,4) | S | — | CET máximo global permitido |
| status | ENUM('ATIVA','SUSPENSA','INATIVA') | N | — | Status |
| contato_email | VARCHAR(200) | S | — | E-mail de contato |
| contato_telefone | VARCHAR(20) | S | — | Telefone |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: margens

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| nome | VARCHAR(100) | N | — | Nome da margem |
| tipo | ENUM('EXCLUSIVA','COMPARTILHADA') | N | — | Tipo de atribuição |
| percentual_maximo | DECIMAL(5,2) | N | — | % máximo de comprometimento |
| descricao | TEXT | S | — | Descrição da margem |
| status | ENUM('ATIVA','INATIVA') | N | — | Status |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: produtos

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| nome | VARCHAR(100) | N | — | Nome do produto |
| tipo | ENUM('EMPRESTIMO','CARTAO','PLANO_SAUDE','SEGURO','MENSALIDADE','OUTROS') | N | — | Tipo |
| tipo_desconto | ENUM('NOMINAL','PERCENTUAL') | N | — | Forma de desconto |
| margem_id | UUID | N | FK → margens | Margem associada |
| consignataria_id | UUID | N | FK → consignatarias | Consignatária dona do produto |
| juros_minimo | DECIMAL(5,4) | S | — | Taxa de juros mínima (% a.m.) |
| juros_maximo | DECIMAL(5,4) | S | — | Taxa de juros máxima (% a.m.) |
| prazo_minimo | INT | S | — | Prazo mínimo (meses) |
| prazo_maximo | INT | S | — | Prazo máximo (meses) |
| parcelas_maximo | INT | S | — | Nº máximo de parcelas |
| tempo_servico_minimo | INT | S | — | Tempo mínimo de serviço (meses) |
| cargos_elegiveis | JSON | S | — | Lista de cargos elegíveis |
| status | ENUM('ATIVO','INATIVO') | N | — | Status |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: contratos

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| numero_contrato | VARCHAR(30) | N | UK | Número externo do contrato |
| servidor_id | UUID | N | FK → servidores | Servidor beneficiário |
| consignataria_id | UUID | N | FK → consignatarias | Consignatária contratante |
| produto_id | UUID | N | FK → produtos | Produto contratado |
| valor_total | DECIMAL(12,2) | N | — | Valor total do contrato |
| valor_parcela | DECIMAL(12,2) | N | — | Valor mensal da parcela |
| quantidade_parcelas | INT | N | — | Total de parcelas |
| parcelas_pagas | INT | N | — | Parcelas já descontadas |
| taxa_juros | DECIMAL(5,4) | N | — | Taxa de juros mensal |
| cet | DECIMAL(5,4) | N | — | Custo Efetivo Total |
| data_inicio | DATE | N | — | Início das deduções |
| data_fim | DATE | N | — | Término previsto |
| status | ENUM('PENDENTE','ATIVO','SUSPENSO','LIQUIDADO','CANCELADO') | N | — | Status |
| tipo_operacao | ENUM('NOVO','PORTABILIDADE','RENEGOCIACAO') | N | — | Tipo da operação |
| contrato_origem_id | UUID | S | FK → contratos | Contrato liquidado (portabilidade) |
| fluxo_aprovacao_id | UUID | S | FK → fluxos_aprovacao | Fluxo de aprovação vigente |
| aprovado_por | UUID | S | FK → usuarios | Quem aprovou |
| data_aprovacao | DATETIME | S | — | Data de aprovação |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: parcelas

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| contrato_id | UUID | N | FK → contratos | Contrato vinculado |
| numero_parcela | INT | N | — | Número sequencial |
| valor | DECIMAL(12,2) | N | — | Valor da parcela |
| competencia | VARCHAR(7) | N | — | Mês/Ano (YYYY-MM) |
| status | ENUM('PREVISTA','DESCONTADA','NAO_DESCONTADA','CANCELADA') | N | — | Status |
| motivo_nao_desconto | VARCHAR(200) | S | — | Motivo de não desconto |
| data_processamento | DATETIME | S | — | Data do processamento |
| arquivo_integracao_id | UUID | S | FK → arquivos_integracao | Arquivo de retorno |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: usuarios

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| nome | VARCHAR(200) | N | — | Nome completo |
| email | VARCHAR(200) | N | UK | E-mail (login) |
| senha_hash | VARCHAR(256) | N | — | Senha (bcrypt) |
| perfil_id | UUID | N | FK → perfis_acesso | Perfil de acesso |
| consignataria_id | UUID | S | FK → consignatarias | Consignatária vinculada (se aplicável) |
| status | ENUM('ATIVO','BLOQUEADO','INATIVO') | N | — | Status |
| ultimo_acesso | DATETIME | S | — | Data/hora do último login |
| mfa_habilitado | BOOLEAN | N | — | MFA ativo (default: false) |
| tentativas_login | INT | N | — | Tentativas falhas (reset ao logar) |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: perfis_acesso

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| nome | VARCHAR(100) | N | UK | Nome do perfil |
| descricao | TEXT | S | — | Descrição |
| permissoes | JSON | N | — | Lista de permissões granulares |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: logs_auditoria

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| usuario_id | UUID | N | FK → usuarios | Usuário executor |
| entidade | VARCHAR(100) | N | — | Tabela/entidade afetada |
| entidade_id | UUID | N | — | ID do registro afetado |
| acao | ENUM('INCLUSAO','ALTERACAO','EXCLUSAO','CONSULTA','LOGIN','LOGOUT') | N | — | Tipo de ação |
| dados_anteriores | JSON | S | — | Snapshot antes da alteração |
| dados_novos | JSON | S | — | Snapshot depois da alteração |
| ip_origem | VARCHAR(45) | N | — | Endereço IP do usuário |
| user_agent | VARCHAR(500) | S | — | Navegador/dispositivo |
| data_hora | DATETIME | N | — | Timestamp da operação |

---

## Tabela: fluxos_aprovacao

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| nome | VARCHAR(100) | N | — | Nome do fluxo |
| tipo_operacao | ENUM('NOVO','PORTABILIDADE','RENEGOCIACAO','CANCELAMENTO') | N | — | Tipo de operação |
| etapas | JSON | N | — | Config de etapas: [{responsavel, ordem, prazo_dias}] |
| acao_expiracao | ENUM('APROVAR','REJEITAR','ESCALONAR') | N | — | Ação ao expirar prazo |
| status | ENUM('ATIVO','INATIVO') | N | — | Status |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: arquivos_integracao

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| tipo | ENUM('ENVIO','RETORNO') | N | — | Tipo do arquivo |
| competencia | VARCHAR(7) | N | — | Mês/Ano (YYYY-MM) |
| nome_arquivo | VARCHAR(200) | N | — | Nome do arquivo |
| caminho_arquivo | VARCHAR(500) | N | — | Caminho de armazenamento |
| data_geracao | DATETIME | N | — | Data de geração |
| data_processamento | DATETIME | S | — | Data de processamento |
| total_registros | INT | N | — | Total de linhas |
| registros_sucesso | INT | S | — | Processados OK |
| registros_erro | INT | S | — | Com erro |
| status | ENUM('GERADO','ENVIADO','PROCESSADO','ERRO') | N | — | Status |
| usuario_id | UUID | N | FK → usuarios | Quem gerou/processou |
| created_at | DATETIME | N | — | Data de criação |
| updated_at | DATETIME | N | — | Data de atualização |

---

## Tabela: margem_servidor

| Campo | Tipo | Nulo | PK/FK | Descrição |
|-------|------|------|-------|-----------|
| id | UUID | N | PK | Identificador único |
| servidor_id | UUID | N | FK → servidores | Servidor |
| margem_id | UUID | N | FK → margens | Margem |
| valor_total | DECIMAL(12,2) | N | — | Margem total calculada |
| valor_utilizado | DECIMAL(12,2) | N | — | Margem comprometida |
| valor_reservado | DECIMAL(12,2) | N | — | Margem reservada (portabilidade) |
| valor_disponivel | DECIMAL(12,2) | N | — | Margem livre |
| competencia_base | VARCHAR(7) | N | — | Folha base do cálculo |
| updated_at | DATETIME | N | — | Última atualização |

**Índice composto único:** (servidor_id, margem_id)
