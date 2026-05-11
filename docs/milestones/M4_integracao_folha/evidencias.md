# Evidências — M4 Integração Folha

**Data:** 11/05/2026

## Evidências técnicas

- `npm test -- --runInBand src/__tests__/arquivo.service.test.ts` passou com 3 testes.
- `npm run test:local-db` passou com exit code 0.
- API registrada com prefixo `/v1/arquivos` no bootstrap principal.
- Migration criada para os novos modelos Prisma.

## Arquivos-chave

- [api/src/modules/arquivos/arquivo.service.ts](../../../api/src/modules/arquivos/arquivo.service.ts)
- [api/src/modules/arquivos/arquivo.controller.ts](../../../api/src/modules/arquivos/arquivo.controller.ts)
- [api/src/modules/arquivos/arquivo.routes.ts](../../../api/src/modules/arquivos/arquivo.routes.ts)
- [api/src/utils/csv-parser.ts](../../../api/src/utils/csv-parser.ts)
- [api/src/types/arquivo.ts](../../../api/src/types/arquivo.ts)

## Observação

Não há screenshots ainda porque a interface M4 não foi iniciada. Essas evidências cobrem a camada backend e ficam como base para a próxima entrega de frontend e reconciliação.
