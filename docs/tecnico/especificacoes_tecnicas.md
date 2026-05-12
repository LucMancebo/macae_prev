# Especificações Técnicas do Sistema MACAEPREV

**Data:** 12 de maio de 2026  
**Módulo:** Documentação de Arquitetura e Negócio

---

## 1. Cenário Real de Utilização do Sistema

**Contexto:** João, um servidor aposentado pelo MACAEPREV, decide solicitar um empréstimo consignado no Banco ABC (Consignatária).

1. **Simulação e Consulta:** O Correspondente Bancário do Banco ABC acessa o sistema MACAEPREV. Devido aos rígidos controles de segurança, ele insere seu login, senha e valida a operação através do código MFA do celular (TOTP). Após logar, pesquisa pelo CPF do Sr. João e o sistema calcula instantaneamente sua "Margem Disponível" com base em folha de pagamento e contratos pós-corte em tempo real.
2. **Averbação e Aprovação:** Ao ver que o Sr. João tem margem, o banco registra a proposta de Empréstimo no valor de R$ 5.000,00 dividida em 24x. O sistema valida se o CET (Custo Efetivo Total) está abaixo do teto estabelecido pelo MACAEPREV e bloqueia o limite de margem do servidor. O contrato entra no fluxo de "Aprovação" e, validado, torna-se "ATIVO".
3. **Processamento Mensal (Folha):** No final do mês, o Gestor Financeiro do MACAEPREV exporta o extrato de folha da prefeitura no formato CSV e faz o upload na plataforma. O motor de **Reconciliação** do sistema compara as parcelas que os bancos registraram contra os descontos efetuados na folha, identificando erros de valor (tolerância de R$ 0,05) e apontando contratos não descontados.
4. **Repasse e Auditoria:** Os Dashboards de BI mostram ao diretor do MACAEPREV exatamente quanto foi descontado, calculando a taxa de administração (Receita) que a prefeitura reteve, garantindo total transparência (com rastreabilidade via `LogAuditoria`).

---

## 2. Entidades do Sistema e Relacionamentos

A base de dados é relacional (PostgreSQL) com 12 entidades primárias gerenciadas via Prisma ORM:

1. **Usuario:** Credenciais, MFA e vínculo a Perfil/Consignatária.
2. **PerfilAcesso:** Roles e claims de acesso (Ex: Master, Banco).
3. **Servidor:** Dados funcionais, CPF e salário-base do funcionário MACAEPREV.
4. **Consignataria:** Instituições financeiras credenciadas.
5. **Produto:** Modalidades de crédito (Empréstimo, Cartão, Saúde).
6. **Margem:** Regras globais de teto de desconto (Ex: Margem 30% Empréstimo).
7. **MargemServidor:** Cota individual bloqueada para um servidor.
8. **Consignacao (Contrato):** O empréstimo ativo contendo taxa de juros e prazo.
9. **Parcela:** Pedaços financeiros da Consignacao aguardando liquidação mensal.
10. **ArquivoIntegracao:** Arquivos CSV/TXT de folha importados e seus metadados.
11. **Repasse:** Histórico de retenção financeira a favor do MACAEPREV.
12. **LogAuditoria:** Registro absoluto imutável de todas as ações de usuários (LGPD).

> **Nota:** Para a definição de _Atributos_ exatos e _Chaves Primárias/Estrangeiras_, consulte o arquivo associado `docs/banco_de_dados/dicionario_dados.md`.

---

## 3. Casos de Uso

- **UC01 - Login e Autenticação MFA:** O sistema exige usuário, senha (hash Bcrypt) e código temporal de 6 dígitos. Exige aceite da versão vigente do Termo LGPD.
- **UC02 - Gestão de Produtos:** A Consignatária pode criar ou alterar produtos sujeitos à taxa mínima e máxima impostas.
- **UC03 - Reserva de Margem e Averbação:** O correspondente bancário insere um novo contrato. O sistema reduz a "Margem Disponível" imediatamente, bloqueando a liberação de fundos acima do teto consignável da lei.
- **UC04 - Portabilidade de Contrato:** Um banco concorrente pode registrar a portabilidade. O sistema calcula a liquidação do saldo devedor do contrato anterior utilizando a mesma margem já retida do servidor.
- **UC05 - Importação da Folha (Reconciliação):** O MACAEPREV importa o "Retorno de Folha". O motor varre o CSV, detecta o Encoding, identifica BOM e bate parcela contra desconto do contra-cheque.

---

## 4. Regras de Negócio

- **RN01 (Limites de Margem):** É proibido averbar contratos caso o valor da parcela ultrapasse o limite de "Margem Exclusiva" ou "Compartilhada" do servidor (ex: 30% empréstimo livre e 5% cartão).
- **RN02 (Validação de CET Máximo):** Nenhum contrato poderá ser incluído se o Custo Efetivo Total da operação ultrapassar a configuração imposta pelo administrador da entidade MACAEPREV.
- **RN03 (Segregação de Dados):** O usuário com vínculo a uma Consignatária "Banco ABC" jamais poderá visualizar contratos, parcelas ou produtos pertencentes ao "Banco XYZ".
- **RN04 (Intolerância de Conciliação):** A máquina de conciliação de CSV marcará as parcelas mensais como `CONCILIADA` apenas se o valor descontado em folha bater com a tabela `Parcela`, prevendo margem de segurança de estouramento matemático (Float) de no máximo R$ 0,05.
- **RN05 (Imutabilidade de Log):** Todo registro financeiro inserido, alterado ou excluído gerará uma tripla evidência: IP de Origem, Timestamp UTC e `usuario_id`, gravados sem possibilidade de exclusão por vias sistêmicas comuns.

---

## 5. Requisitos Não Funcionais

### 5.1 Requisitos de Interface

- **Compatibilidade Cross-Browser:** A Interface Web deve ser estrita, responsiva e devidamente homologada nos navegadores Microsoft Edge, Google Chrome e Mozilla Firefox.
- **Design System Unificado:** O Frontend (Next.js) deve renderizar telas geradas através de uma padronização de Tokens (CSS variables) contendo `Glassmorphism` em alertas e Modais (React 19).

### 5.2 Requisitos de Integração

- **Formato Agnóstico de Arquivo:** O motor de importação deve ler formatos legados do MACAEPREV (`.csv` ou `.txt`) validando hashes (`MD5/SHA256`) contra duplicidade de envio.
- **Arquitetura API REST:** A troca de dados entre Frontend e Banco de Dados ocorre estritamente via comunicação JSON protegida por token Bearer (`@fastify/jwt`).

### 5.3 Requisitos de Segurança

- **Criptografia em Repouso e em Trânsito:** Senhas armazenadas com salt dinâmico, trafegadas sob canais HTTPS/SSL 128-bits mínimos.
- **Rate-Limiting (Força Bruta):** Bloqueio temporário (30 minutos) da conta em caso de excesso de tentativas falhas (ex: > 5 tentativas).
- **Conformidade LGPD:** Ferramentas explícitas de "anonimização" e controle restritivo das máscaras de CPF.

### 5.4 Requisitos de Performance

- **Processamento de Lote (Batch):** O Upload e Validação de um arquivo de folha contendo mais de 5.000 parcelas deve durar no máximo 10 segundos.
- **Paginação Forçada:** Consultas de API devem utilizar cursores ou limites limitados (`OFFSET/LIMIT` via ORM) para impedir esgotamento de RAM (Crashs OOM).

### 5.5 Requisitos de Disponibilidade

- **Uptime Cloud:** O sistema prevê hospedagem em estrutura virtualizada (AWS / Vercel Edge Networks) assegurando um uptime contratual mínimo de 99,0%.
- **Resiliência de Porta:** A API dispõe de uma técnica de `fallback automático` em sua porta de serviço (iniciando na 3333 e pulando para as subsequentes) em casos de liberação travada de Socket (EADDRINUSE).

### 5.6 Requisitos de Manutenibilidade

- **Código Estrito (Type Safety):** Proibição do uso indiscriminado da tipagem livre `any`. Validação forçada via TypeScript (TS 6.x) assegurando _Builds Verdes_ na pipeline de CI/CD.
- **Módulo Independente de UI:** Padrão arquitetural estrito: Separação de escopos em `/web` para interface, e `/api` contendo os controladores de regras de negócios, garantindo que o acoplamento seja mantido no limite da integração JSON.

### 5.7 Requisitos de Usabilidade e Acessibilidade

- **UX/UI Acessível:** Todos os formulários possuem contraste cromático, _labels_ de formulário explícitas e _toasts_ semânticos de cor (Sucesso=Verde, Erro=Vermelho, Aviso=Amarelo).
- **Navegação Sistêmica:** Garantia do acesso pleno via atalhos por teclado (Focus/Tab) nas matrizes de CRUD.
