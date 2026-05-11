# Validação Atual — M4 Integração Folha

**Data:** 11/05/2026
**Estado:** backend validado; frontend e reconciliação pendentes.

## Concluído

- Parser CSV de folha implementado e testado.
- Validações de arquivo e checksum implementadas.
- `ArquivoService`, controller e rotas `/v1/arquivos` implementados.
- Migration Prisma com `Arquivo`, `Repasse` e novos campos de `Parcela` criada.
- Testes unitários da service e parser passando.
- Suite oficial do backend aprovada com `npm run test:local-db`.

## Parcial

- Persistência e leitura de metadados de arquivo ainda usam o modelo existente `ArquivoIntegracao` como base operacional.
- Reconciliação de parcelas ainda não possui engine dedicada.
- Frontend do dashboard de arquivos ainda não foi criado.

## Pendências para fechar M4

- Página `/dashboard/arquivos`.
- Serviço frontend `web/src/services/arquivos.ts`.
- Endpoint de reconciliação e relatórios segmentados.
- OpenAPI/Swagger dos novos endpoints.
