# Especificações Técnicas — Sistema de Consignação MACAEPREV

---

## 0. Stack Tecnológico Aprovado

| Camada | Tecnologia |
|--------|------------|
| **Backend** | Node.js — API REST (Express/Fastify) |
| **Frontend** | React + TypeScript + Next.js |
| **Estilização** | CSS externo (folhas de estilo `.css`/`.module.css`). Proibido: inline styles e styled-jsx |
| **Banco de Dados** | PostgreSQL (AWS RDS) |
| **ORM** | Prisma |
| **Hospedagem** | AWS (EC2/ECS, RDS, S3, CloudFront) |
| **CI/CD** | GitHub Actions → AWS |
| **Formato Integração Folha** | CSV (formato fixo, não alterável) |

---

## 1. Cenário Real de Utilização

O servidor aposentado **João Silva**, pensionista do MACAEPREV, deseja contratar um empréstimo consignado. Ele acessa o portal do sistema ou vai a um correspondente bancário credenciado. O correspondente acessa o sistema com seu perfil de **Operador Consignatária**, consulta a margem consignável de João com base na última folha processada e nas transações pós-corte. O sistema exibe margem disponível de R$ 800,00. O correspondente registra o contrato de R$ 15.000,00 em 48 parcelas de R$ 450,00/mês com CET de 2,1% a.m. O sistema valida: margem suficiente (✓), CET dentro do limite (✓), cargo elegível (✓), prazo permitido (✓). O contrato entra no fluxo de aprovação configurado (Gestor do MACAEPREV → 3 dias para aprovar). Após aprovação, a margem é reservada e o contrato entra no arquivo mensal de consignações enviado para a folha de pagamento.

---

## 2. Entidades do Sistema

### 2.1 Servidor (Beneficiário)
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| cpf | VARCHAR(11) | CPF (criptografado) |
| nome | VARCHAR(200) | Nome completo |
| matricula | VARCHAR(20) | Matrícula funcional |
| cargo | VARCHAR(100) | Cargo/função |
| situacao_funcional | ENUM | Ativo, Aposentado, Pensionista |
| data_admissao | DATE | Data de ingresso |
| remuneracao_bruta | DECIMAL(12,2) | Remuneração bruta mensal |
| margem_total | DECIMAL(12,2) | Margem total calculada |
| margem_utilizada | DECIMAL(12,2) | Margem comprometida |
| margem_disponivel | DECIMAL(12,2) | Margem livre |
| status | ENUM | Ativo, Inativo, Bloqueado |

### 2.2 Consignatária
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| cnpj | VARCHAR(14) | CNPJ da instituição |
| razao_social | VARCHAR(200) | Razão social |
| nome_fantasia | VARCHAR(200) | Nome fantasia |
| tipo | ENUM | Banco, Seguradora, Plano de Saúde, Associação, Outros |
| cet_maximo | DECIMAL(5,4) | CET máximo permitido |
| status | ENUM | Ativa, Suspensa, Inativa |
| contato_email | VARCHAR(200) | E-mail de contato |
| contato_telefone | VARCHAR(20) | Telefone |

### 2.3 Produto Consignável
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(100) | Nome do produto |
| tipo | ENUM | Empréstimo, Cartão, Plano Saúde, Seguro, Mensalidade, Outros |
| tipo_desconto | ENUM | Nominal, Percentual |
| margem_id | FK | Margem associada |
| juros_minimo | DECIMAL(5,4) | Taxa de juros mínima |
| juros_maximo | DECIMAL(5,4) | Taxa de juros máxima |
| prazo_minimo | INT | Prazo mínimo (meses) |
| prazo_maximo | INT | Prazo máximo (meses) |
| parcelas_maximo | INT | Nº máximo de parcelas |
| tempo_servico_minimo | INT | Tempo mínimo de serviço (meses) |
| status | ENUM | Ativo, Inativo |

### 2.4 Margem Consignável
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(100) | Nome da margem |
| tipo | ENUM | Exclusiva, Compartilhada |
| percentual_maximo | DECIMAL(5,2) | % máximo da remuneração |
| descricao | TEXT | Descrição da margem |
| status | ENUM | Ativa, Inativa |

### 2.5 Contrato
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| numero_contrato | VARCHAR(30) | Número externo do contrato |
| servidor_id | FK | Servidor associado |
| consignataria_id | FK | Consignatária |
| produto_id | FK | Produto contratado |
| valor_total | DECIMAL(12,2) | Valor total do contrato |
| valor_parcela | DECIMAL(12,2) | Valor da parcela mensal |
| quantidade_parcelas | INT | Total de parcelas |
| parcelas_pagas | INT | Parcelas já descontadas |
| taxa_juros | DECIMAL(5,4) | Taxa de juros mensal |
| cet | DECIMAL(5,4) | Custo Efetivo Total |
| data_inicio | DATE | Data de início |
| data_fim | DATE | Data prevista de término |
| status | ENUM | Pendente, Ativo, Suspenso, Liquidado, Cancelado |
| tipo_operacao | ENUM | Novo, Portabilidade, Renegociação |
| contrato_origem_id | FK (nullable) | Contrato liquidado (se portabilidade) |

### 2.6 Parcela
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| contrato_id | FK | Contrato associado |
| numero_parcela | INT | Número sequencial |
| valor | DECIMAL(12,2) | Valor da parcela |
| competencia | VARCHAR(7) | Mês/Ano (YYYY-MM) |
| status | ENUM | Prevista, Descontada, Não Descontada, Cancelada |
| motivo_nao_desconto | VARCHAR(200) | Motivo (se não descontada) |
| data_processamento | DATETIME | Data do processamento |

### 2.7 Usuário
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(200) | Nome completo |
| email | VARCHAR(200) | E-mail (login) |
| senha_hash | VARCHAR(256) | Senha (hash bcrypt) |
| perfil_id | FK | Perfil de acesso |
| consignataria_id | FK (nullable) | Se vinculado a consignatária |
| status | ENUM | Ativo, Bloqueado, Inativo |
| ultimo_acesso | DATETIME | Último login |
| mfa_habilitado | BOOLEAN | Autenticação multifator |

### 2.8 Perfil de Acesso
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(100) | Nome do perfil |
| descricao | TEXT | Descrição |
| permissoes | JSON | Lista de permissões granulares |

### 2.9 Log de Auditoria
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| usuario_id | FK | Usuário que executou |
| entidade | VARCHAR(100) | Entidade afetada |
| entidade_id | UUID | ID do registro |
| acao | ENUM | Inclusão, Alteração, Exclusão, Consulta |
| dados_anteriores | JSON | Snapshot anterior |
| dados_novos | JSON | Snapshot novo |
| ip_origem | VARCHAR(45) | IP do usuário |
| data_hora | DATETIME | Timestamp |

### 2.10 Fluxo de Aprovação
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(100) | Nome do fluxo |
| tipo_operacao | ENUM | Novo Contrato, Portabilidade, Renegociação, Cancelamento |
| etapas | JSON | Configuração de etapas (responsável, ordem, prazo) |
| acao_expiracao | ENUM | Aprovar, Rejeitar, Escalonar |
| status | ENUM | Ativo, Inativo |

### 2.11 Arquivo de Integração
| Atributo | Tipo | Descrição |
|----------|------|-----------|
| id | UUID | Identificador único |
| tipo | ENUM | Envio (para folha), Retorno (da folha) |
| competencia | VARCHAR(7) | Mês/Ano |
| nome_arquivo | VARCHAR(200) | Nome do arquivo |
| data_geracao | DATETIME | Data de geração |
| data_processamento | DATETIME | Data de processamento |
| total_registros | INT | Total de linhas |
| registros_sucesso | INT | Processados com sucesso |
| registros_erro | INT | Com erro/divergência |
| status | ENUM | Gerado, Enviado, Processado, Erro |

---

## 3. Relacionamentos entre Entidades

```
Servidor (1) ──── (N) Contrato
Consignatária (1) ──── (N) Contrato
Produto (1) ──── (N) Contrato
Margem (1) ──── (N) Produto
Contrato (1) ──── (N) Parcela
Contrato (1) ──── (0..1) Contrato (origem - portabilidade)
Usuário (N) ──── (1) Perfil de Acesso
Usuário (N) ──── (0..1) Consignatária
Usuário (1) ──── (N) Log de Auditoria
Fluxo de Aprovação (1) ──── (N) Contrato (por tipo_operacao)
Arquivo de Integração (1) ──── (N) Parcela (por competência)
```

---

## 4. Casos de Uso

| # | Caso de Uso | Ator Principal |
|---|-------------|---------------|
| UC01 | Consultar margem consignável | Operador Consignatária, Servidor |
| UC02 | Registrar novo contrato | Operador Consignatária |
| UC03 | Aprovar/Rejeitar contrato | Gestor Consignante |
| UC04 | Solicitar portabilidade | Operador Consignatária Receptora |
| UC05 | Informar saldo devedor | Operador Consignatária Cedente |
| UC06 | Renegociar contrato | Operador Consignatária |
| UC07 | Cancelar contrato | Gestor Consignante |
| UC08 | Gerar arquivo mensal para folha | Sistema (automático) |
| UC09 | Importar retorno de folha | Gestor Consignante |
| UC10 | Conciliar parcelas | Gestor Consignante |
| UC11 | Consultar relatórios gerenciais | Todos os perfis |
| UC12 | Exportar dados em CSV | Todos os perfis |
| UC13 | Cadastrar/editar consignatária | Administrador |
| UC14 | Cadastrar/editar produto | Administrador |
| UC15 | Configurar margens | Administrador |
| UC16 | Gerenciar perfis de acesso | Administrador |
| UC17 | Consultar logs de auditoria | Administrador, Gestor |
| UC18 | Configurar fluxo de aprovação | Administrador |
| UC19 | Migrar base de dados | Administrador |
| UC20 | Gerar relatório de receita/repasse | Gestor Consignante |

---

## 5. Regras de Negócio

| # | Regra | Descrição |
|---|-------|-----------|
| RN01 | Margem máxima | Servidor não pode comprometer mais que o percentual máximo definido por margem |
| RN02 | Bloqueio sem margem | Não permitir novo contrato quando margem disponível = 0 |
| RN03 | Validação de CET | CET do contrato deve ser ≤ CET máximo cadastrado para a consignatária/produto |
| RN04 | Elegibilidade por cargo | Apenas cargos configurados como elegíveis podem contratar determinados produtos |
| RN05 | Tempo de serviço | Servidor deve atender o tempo mínimo de serviço exigido pelo produto |
| RN06 | Reserva de margem | Margem é reservada durante tramitação de portabilidade/renegociação |
| RN07 | Prazo de aprovação | Operação não aprovada no prazo executa ação automática configurada |
| RN08 | Liquidação em portabilidade | Novo contrato por portabilidade deve liquidar integralmente o contrato anterior |
| RN09 | Conciliação obrigatória | Parcelas devem ser conciliadas após cada processamento de folha |
| RN10 | Auditoria obrigatória | Toda operação de escrita gera registro de auditoria |
| RN11 | Repasse de taxas | Percentual de taxas deve ser calculado e registrado para repasse ao MACAEPREV |

---

## 6. Requisitos Não Funcionais

| Categoria | Requisito |
|-----------|-----------|
| **Performance** | Tempo de resposta ≤ 3s para operações comuns; ≤ 10s para relatórios complexos |
| **Disponibilidade** | 99% de uptime (≤ 7,3h de indisponibilidade/mês) |
| **Segurança** | AES-256 em repouso, TLS 1.3 em trânsito, RBAC, MFA, LGPD |
| **Infraestrutura** | Backup diário (14 dias), 100Mbps dedicados, rede 3 camadas, SSL 128-bit+ |
| **Compatibilidade** | Edge, Chrome, Firefox (últimas 3 versões) |
| **Manutenibilidade** | Código modular, documentado, com cobertura de testes ≥ 80% |
| **Usabilidade** | Interface intuitiva, manual online, tooltips contextuais |
| **Acessibilidade** | WCAG 2.1 nível AA |
| **Escalabilidade** | Suportar crescimento de 50% de usuários sem degradação |
| **Integração** | API REST, formato configurável para folha de pagamento |

---

## 7. Requisitos de Interface

- Interface web responsiva (desktop e tablet)
- Design limpo com painel lateral de navegação por módulo
- Dashboard inicial por perfil de acesso com KPIs relevantes
- Telas de cadastro com exibição de logs recentes
- Feedback visual em operações (loading, sucesso, erro)
- Filtros avançados em todas as listagens
- Botão de exportação CSV em todas as tabelas
- Ícone de ajuda contextual em cada módulo
- Notificações in-app e por e-mail para fluxos de aprovação

## 8. Requisitos de Integração

- Integração bidirecional com sistema de folha de pagamento MACAEPREV
- Formato de arquivo **CSV fixo** (não alterável) para envio e retorno da folha
- Geração automática de arquivo CSV mensal de consignações
- Importação e processamento de arquivo CSV de retorno da folha
- API REST para possíveis integrações futuras com sistemas municipais

## 9. Requisitos de Segurança

- Criptografia AES-256 para dados sensíveis em repouso
- TLS 1.3 para comunicação em trânsito
- SSL/TLS 128-bit+ (certificado válido)
- Criptografia de URL para sigilo de informações
- Assinatura digital de registros
- Controle de acesso RBAC com permissões granulares
- MFA (autenticação multifator)
- Política de senhas fortes com expiração
- Bloqueio após tentativas inválidas de login
- Sessões com timeout configurável
- Conformidade total com LGPD
- Firewall de borda + WAF + firewall de aplicação (3 camadas)

## 10. Requisitos de Disponibilidade

- 99% de disponibilidade (SLA contratual)
- Monitoramento 24/7 com alertas automáticos
- Backup diário com 14 dias de retenção
- Banda redundante 100Mbps full-duplex
- Plano de recuperação de desastres (DR)
- Janela de manutenção pré-acordada

## 11. Requisitos de Manutenibilidade

- Código organizado em Clean Architecture (Node.js API) + App Router (Next.js)
- Estilização via CSS externo (arquivos `.css` e `.module.css`) — sem inline styles ou styled-jsx
- Documentação técnica atualizada (API Swagger/OpenAPI, banco Prisma, fluxos)
- Pipeline CI/CD automatizado (GitHub Actions → AWS)
- Cobertura de testes ≥ 80% (Jest + Testing Library)
- Versionamento de código (Git)
- Logs estruturados para diagnóstico

## 12. Requisitos de Usabilidade

- Navegação intuitiva em no máximo 3 cliques para funcionalidades principais
- Mensagens de erro claras e orientativas
- Confirmação visual para operações críticas (excluir, aprovar, rejeitar)
- Busca global por servidor (CPF, matrícula, nome)
- Atalhos de teclado para operações frequentes
- Design consistente entre módulos

## 13. Requisitos de Acessibilidade

- Conformidade WCAG 2.1 nível AA
- Contraste adequado de cores
- Navegação por teclado
- Labels em campos de formulário
- Textos alternativos em elementos visuais
- Suporte a leitores de tela
