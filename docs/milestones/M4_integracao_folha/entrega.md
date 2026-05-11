# Entrega Parcial — M4 Integração Folha

**Status:** backend e frontend de arquivos concluídos, milestone ainda em execução.

## Entregáveis já fechados

- Parser CSV e validadores em `api/src/utils/`.
- Service, controller e rotas de arquivos em `api/src/modules/arquivos/`.
- Service frontend `web/src/services/arquivos.ts`.
- Tela `/dashboard/arquivos`.
- Engine de reconciliação MVP: `api/src/utils/reconciliacao.ts` (integrada ao fluxo de importação)
- Schema Prisma e migration para `Arquivo` e `Repasse`.
- Testes unitários de parser e service.
- Validação completa do backend via runner local.

## Entregáveis pendentes

- Reconciliação e segmentação por consignante/consignatária.
- Documentação OpenAPI e evidências visuais finais.

## Próximo passo recomendado

Implementar a engine de reconciliação para fechar os requisitos 4.1.15 e 4.1.16.
