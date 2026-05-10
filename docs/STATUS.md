# Status Atual do Projeto — Resumo

Data: 2026-05-10

Resumo rápido:

- Repositório principal (`main`) atualizado com suporte a testes locais (runner + compose).
- Suíte de testes do `api` passa localmente quando executada com `npm run --prefix api test:local-db`.
- Mudanças de autenticação (cookie/JWT) aplicadas; endpoints de login testados localmente.

Milestones (visão geral):

- M1_fundacao_infra: concluído (infra básica, docker, CI mínima)
- M2_seguranca: em progresso (autenticação e LGPD — partes já implementadas; validações e hardening aplicados)
- M3_core_consignacoes: 45% concluído (ver RECAP_TEMPORARIO para detalhes)

Entregáveis concluídos:

- Documentação técnica parcial (`docs/tecnico/*`) e diagramas Figma extraídos.
- Runner de testes locais e documentação de execução (`docs/TEST_REPORT.md`).
- Correções de estabilidade e tratamento de erros em `api/src/hooks/error-handler.ts`.

Pendências / Itens que faltam:

- Configurar CI para executar a suíte E2E com um banco de teste (Neon sandbox ou container gerenciado) — hoje os testes E2E devem apontar para um DB de teste.
- Completar documentação de entrega de cada Milestone (checklists em `docs/milestones/*` estão parcialmente vazios).
- Documentação de rollout / deploy no Vercel com variáveis sensíveis (criar playbook seguro sem expor secrets).

Próximos passos recomendados:

1. Provisionar um banco de teste dedicado para CI (Neon ou outro) e ajustar `jest`/CI para apontar para ele.
2. Finalizar os documentos de entrega para `M3_core_consignacoes` e validar com stakeholders.
3. Criar `CONTRIBUTING.md` com instruções de dev: como rodar `npm run --prefix api test:local-db`, regras de commit e pipelines.

Links relevantes:

- `docs/RECAP_TEMPORARIO.md` — resumo e histórico de decisões.
- `docs/TEST_REPORT.md` — relatório de execução de testes atual.
- `docs/tecnico/login.md` — especificação do fluxo de login.
