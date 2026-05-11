# Evidências — M4 Integração Folha

**Data:** 11/05/2026

## Evidências técnicas

- `npm test -- --runInBand src/__tests__/arquivo.service.test.ts` passou com 3 testes.
- `npm run test:local-db` passou com exit code 0.
- API registrada com prefixo `/v1/arquivos` no bootstrap principal.
- Migration criada para os novos modelos Prisma.
- Frontend de arquivos disponível em `/dashboard/arquivos`.
- Service frontend criado em `web/src/services/arquivos.ts`.
- Engine de reconciliação MVP implementada em `api/src/utils/reconciliacao.ts` e integrada ao fluxo de importação.

## Arquivos-chave

- [api/src/modules/arquivos/arquivo.service.ts](../../../api/src/modules/arquivos/arquivo.service.ts)
- [api/src/modules/arquivos/arquivo.controller.ts](../../../api/src/modules/arquivos/arquivo.controller.ts)
- [api/src/modules/arquivos/arquivo.routes.ts](../../../api/src/modules/arquivos/arquivo.routes.ts)
- [api/src/utils/csv-parser.ts](../../../api/src/utils/csv-parser.ts)
- [api/src/types/arquivo.ts](../../../api/src/types/arquivo.ts)
- [web/src/services/arquivos.ts](../../../web/src/services/arquivos.ts)
- [web/src/app/dashboard/arquivos/page.tsx](../../../web/src/app/dashboard/arquivos/page.tsx)

## Observação

Não há screenshots ainda porque a interface não foi capturada nesta rodada. As evidências cobrem backend e frontend e ficam como base para a reconciliação.
