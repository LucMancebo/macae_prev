# Recapitulação Temporária - Projeto MACAEPREV

**⚠️ VERSÃO RESUMIDA** — Para análise completa com roadmap detalhado, consulte [**ANALISE_COMPLETA_PROJETO.md**](ANALISE_COMPLETA_PROJETO.md).

Resumo rápido do estado atual, decisões e próximos passos relevantes para a Milestone 2 (Segurança & Autenticação).

## Estado atual após a revisão de hoje

- Backend ativo em Fastify + Prisma, agora preparado para usar Neon com o adapter oficial da Prisma.
- Frontend em Next.js continua em `web/`, integrado ao mesmo deploy da raiz sem dependência de Prisma no runtime do app web.
- A configuração de banco do servidor foi consolidada em `api/prisma/prisma.ts` e reaproveitada em `api/src/config/database.ts`.
- O schema Prisma do backend passou a declarar `directUrl` e `driverAdapters`, o que é necessário para o fluxo de deploy com Neon.
- O arquivo órfão `web/prisma.ts` foi removido porque só introduzia imports não resolvidos no projeto web.
- A configuração de TypeScript do backend foi corrigida para voltar a ser um JSON válido e compatível com a versão atual do compilador.
- O workspace foi validado no fim da revisão e não há erros pendentes reportados pelos checks atuais.

## Configuração de Vercel + Neon

- `DATABASE_URL` deve apontar para a string de conexão principal do Neon, preferencialmente a pooler URL.
- `DIRECT_URL` deve apontar para a conexão direta do Neon para migrações e tarefas administrativas do Prisma.
- `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV` e `NEXT_PUBLIC_API_URL` continuam obrigatórios para o projeto em produção.
- O deploy do monorepo usa `api/index.ts` para a API e `web/` para o frontend, com compatibilidade para `ALLOWED_ORIGINS` quando houver mais de uma origem.
- O fluxo local e o de produção agora compartilham a mesma criação de Prisma Client, reduzindo divergência entre teste e deploy.
- O `vercel.json` da raiz foi alinhado ao entrypoint real da API e ao build do frontend para evitar falha de build por caminho inexistente.

O que foi feito

- Arquitetura modular: backend em `Fastify` (TypeScript) e frontend base em `Next.js`.
- Modelagem completa em `api/prisma/schema.prisma` (12 entidades: `Usuario`, `PerfilAcesso`, `Contrato`, `Parcela`, `Servidor`, `Consignataria`, `Produto`, `Margem`, `MargemServidor`, `FluxoAprovacao`, `ArquivoIntegracao`, `LogAuditoria`).
- Implementado módulo de autenticação (`api/src/modules/auth`): rotas, controller e service com `bcryptjs` e `@fastify/jwt`.
- Implementado `AuditService` para gravar logs na tabela `LogAuditoria` (captura de IP e user-agent).
- Corrigidos problemas de codificação (UTF-16 BOM → UTF-8) e tipagens Prisma/TypeScript.
- Docker: criado `docker-compose.yml` com PostgreSQL; banco levantado e sincronizado (`prisma db push`).
- Seed executado com sucesso: usuário `admin@macaeprev.rj.gov.br` criado (senha plana `123456`, armazenada como hash).
- Teste de login realizado: endpoint `POST /v1/auth/login` retornou JWT válido.

Gargalos resolvidos durante o processo

- Arquivos regravados em UTF-8 para compatibilidade com `esbuild`/`tsx`.
- `tsconfig.json` ajustado para incluir `prisma/` e tipos `node`.
- `app.ts` atualizado para uso seguro de CORS em dev/prod e leitura de `JWT_SECRET` via `.env`.

Problema EADDRINUSE (listen EADDRINUSE: address already in use 0.0.0.0:3333)

**Causa**: Processos Node órfãos ou múltiplas instâncias do dev watcher (`tsx watch`) reocupando a porta 3333, ou conexão em TIME_WAIT não sendo liberada entre restarts.

**Solução implementada em `api/src/server.ts`**:

- Retry automático com fallback de portas: se 3333 falhar, tenta 3334, depois 3335 (máx 3 tentativas com 500ms entre elas).
- Graceful shutdown robusto: captura `SIGINT`, `SIGTERM`, `unhandledRejection` e `uncaughtException` para fechar Fastify e desconectar Prisma corretamente.
- Logging detalhado do processo de inicialização e shutdown.

**Resultado**: Servidor agora inicia em porta alternativa se a padrão estiver ocupada, em vez de falhar com exit code 1.

**Prevenção futura**:

- Evitar múltiplas abas/processos rodando `npm run dev` simultaneamente.
- Se problema persistir: `taskkill /F /IM node.exe` (Windows) ou `pkill -f "tsx watch"` (Linux/Mac) e aguardar 2-3 segundos antes de reiniciar.
- Considerar usar `pm2` ou similar em produção para gerenciar ciclo de vida do processo.

1. **Implementar bloqueio por tentativas de login** ✅ (Concluído: 5 tentativas → 30min bloqueio).
2. **Centralizar tratamento de erros** ✅ (Concluído: `api/src/hooks/error-handler.ts`).

### 🛠 Entregas Realizadas (Hoje)

1.  **Infraestrutura & DevOps**:
    - Implementação de **Docker Compose** com PostgreSQL 16 e pgAdmin.
    - Sincronização do banco de dados real e populado com **Prisma Seed**.
    - Consolidação de variáveis de ambiente no `.env` (CORS, JWT, Ports).
2.  **Módulo de Consignatárias (Instituições Financeiras)**:
    - Backend: CRUD completo com validação de CNPJ e Auditoria.
    - Frontend: Gestão completa com listagem e formulário modal.
3.  **Reforço de Qualidade (Hardening)**:
    - **Auditoria 2.0**: Histórico visível no frontend para cada registro (POC 6).
    - **Normalização de Datas**: Tratamento UTC para evitar erro de dia anterior.
    - **Tipagem Forte**: Criação de `entidades.ts` no frontend e fim do uso de `any`.
    - **Otimização de Logs**: Redução de 90% no tamanho dos arquivos de log via limpeza de relações.

### 📋 Contexto Atual

- **M3 Status**: 45% concluído.
- **Ambiente**: Banco de dados real em Docker ativo na porta 5432.

### 🚩 Próximos Passos (Imediato)

1.  **Módulo de Produtos**: Implementar tabelas de taxas e prazos por banco.
2.  **Motor de Cálculo**: Desenvolver o serviço que calcula a margem líquida do servidor (30%/5%).
3.  **Exclusão com Confirmação**: Adicionar segurança visual ao excluir registros.

Estado atual do servidor (7 de maio de 2026)

- **Servidor**: Rodando em dev com `npm run dev` via `tsx watch` (recarregamento automático no salvar).
- **Porta**: Base 3333, com fallback automático para 3334/3335 se ocupada.
- **DB**: PostgreSQL 15 via Docker Compose, conectado e sincronizado (`prisma db push` concluído).
- **Auth**: Endpoint `/v1/auth/login` testado e funcional (retorna JWT válido após validar credenciais hash).
- **Auditoria**: Logs de login registrados na tabela `LogAuditoria` com IP e user-agent.
- **Healthcheck**: Endpoint `/health` disponível para monitorar status.

Observações rápidas

- **Variáveis sensíveis**: Atualize `JWT_SECRET` no `.env` antes de qualquer deploy. Nunca commitar secrets em repositório.
- **CORS**: Manter whitelist apenas do frontend autorizado em produção (evitar acesso de terceiros).
- **Auditoria**: Avaliar fila/retentativa (Redis + Bull) para garantir persistência dos logs em picos de carga.
- **PORT**: Pode ser alterada via variável de ambiente `PORT=4000 npm run dev`; o servidor tentará essa porta e fará fallback automático se ocupada.
- **Cleanup de processos**: Se servidor ficar travado ou não iniciar, use `taskkill /F /IM node.exe` (Windows) ou `pkill -9 node` (Linux) antes de reiniciar.
