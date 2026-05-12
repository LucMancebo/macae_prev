# Evidências — M4 Integração Folha

**Data:** 11/05/2026

## Evidências técnicas

### Backend - Importação e Processamento

- `npm test -- --runInBand src/__tests__/arquivo.service.test.ts` passou com 3 testes.
- `npm run test:local-db` passou com exit code 0.
- API registrada com prefixo `/v1/arquivos` no bootstrap principal.
- Migration criada para os novos modelos Prisma.
- Service frontend criado em `web/src/services/arquivos.ts`.

### Backend - Motor de Reconciliação

- Engine de reconciliação MVP implementada em `api/src/utils/reconciliacao.ts` e integrada ao fluxo de importação.
- Testes unitários: 4/4 passando (UT-RECON-001 a UT-RECON-004)
  - Validação: `npx jest src/utils/__tests__/reconciliacao.unit.test.ts --runInBand` ✅
- Endpoint REST: `GET /v1/reconciliacao/relatorio` com filtros por data e consignatária
- Controller: `api/src/modules/reconciliacao/reconciliacao.controller.ts`
- Routes: `api/src/modules/reconciliacao/reconciliacao.routes.ts`
- Documentação OpenAPI atualizada com esquema completo

### Frontend - Dashboard de Reconciliação

- Página dashboard: `web/src/app/dashboard/reconciliacao/page.tsx`
- Service: `web/src/services/reconciliacao.ts`
- Estilos: `web/src/app/dashboard/reconciliacao/reconciliacao.module.css`
- Menu: Link adicionado ao sidebar com ícone 🔄 em "Folha"
- Build: `npm run build` compilado com sucesso ✅
- Componentes: utiliza design-system (Button, Badge, Card, Input)
- Filtros: data_inicio, data_fim, consignataria_id
- Exibição: cards de estatísticas por status, detalhamento por consignatária

## Arquivos-chave

### Modulos Principais

- [api/src/modules/arquivos/arquivo.service.ts](../../../api/src/modules/arquivos/arquivo.service.ts)
- [api/src/modules/arquivos/arquivo.controller.ts](../../../api/src/modules/arquivos/arquivo.controller.ts)
- [api/src/modules/arquivos/arquivo.routes.ts](../../../api/src/modules/arquivos/arquivo.routes.ts)
- [api/src/modules/reconciliacao/reconciliacao.controller.ts](../../../api/src/modules/reconciliacao/reconciliacao.controller.ts)
- [api/src/modules/reconciliacao/reconciliacao.routes.ts](../../../api/src/modules/reconciliacao/reconciliacao.routes.ts)

### Utilidades

- [api/src/utils/csv-parser.ts](../../../api/src/utils/csv-parser.ts)
- [api/src/utils/reconciliacao.ts](../../../api/src/utils/reconciliacao.ts)
- [api/src/utils/**tests**/reconciliacao.unit.test.ts](../../../api/src/utils/__tests__/reconciliacao.unit.test.ts)

### Tipos

- [api/src/types/arquivo.ts](../../../api/src/types/arquivo.ts)

### Frontend

- [web/src/services/arquivos.ts](../../../web/src/services/arquivos.ts)
- [web/src/services/reconciliacao.ts](../../../web/src/services/reconciliacao.ts)
- [web/src/app/dashboard/arquivos/page.tsx](../../../web/src/app/dashboard/arquivos/page.tsx)
- [web/src/app/dashboard/reconciliacao/page.tsx](../../../web/src/app/dashboard/reconciliacao/page.tsx)

### Documentação

- [docs/openapi.json](../../../docs/openapi.json) - Endpoint `/v1/reconciliacao/relatorio` documentado

## Resumo de Testes Executados

| Teste        | Arquivo                    | Status  | Descrição                      |
| ------------ | -------------------------- | ------- | ------------------------------ |
| UT-RECON-001 | reconciliacao.unit.test.ts | ✅ PASS | Conciliação de parcela válida  |
| UT-RECON-002 | reconciliacao.unit.test.ts | ✅ PASS | Erro de chave estrangeira (FK) |
| UT-RECON-003 | reconciliacao.unit.test.ts | ✅ PASS | Divergência de valor detectada |
| UT-RECON-004 | reconciliacao.unit.test.ts | ✅ PASS | Parcela marcada como PENDENTE  |

## Build & Compilation

- **Backend**: TypeScript compilação ✅
- **Frontend**: `npm run build` ✅ (1 warning de ESLint resolvido)
- **Next.js Routes**: `/dashboard/reconciliacao` route pre-rendered ✅
