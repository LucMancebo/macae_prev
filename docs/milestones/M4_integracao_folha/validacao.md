# Validação Atual — M4 Integração Folha

**Data:** 11/05/2026
**Estado:** backend validado; frontend de arquivos entregue; reconciliação e relatórios segmentados pendentes.

## Concluído

- Parser CSV de folha implementado e testado.
- Validações de arquivo e checksum implementadas.
- `ArquivoService`, controller e rotas `/v1/arquivos` implementados.
- Tela `/dashboard/arquivos` e service frontend `web/src/services/arquivos.ts` implementados.
- Migration Prisma com `Arquivo`, `Repasse` e novos campos de `Parcela` criada.
- Testes unitários da service e parser passando.
- Suite oficial do backend aprovada com `npm run test:local-db`.

## Parcial

- Persistência e leitura de metadados de arquivo ainda usam o modelo existente `ArquivoIntegracao` como base operacional.
- Reconciliação de parcelas ainda não possui engine dedicada.
- Reconciliação e relatórios segmentados ainda não foram implementados.

## Pendências para fechar M4

- Endpoint de reconciliação e relatórios segmentados.
- OpenAPI/Swagger dos novos endpoints.
