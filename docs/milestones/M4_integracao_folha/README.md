# Milestone 4: Integração Folha

**Status atual:** backend e frontend de arquivos entregues; reconciliação e relatórios segmentados pendentes.

## O que já existe

- Parser CSV de folha e validadores de arquivo.
- Service de arquivos com importação, leitura e exportação.
- Tela `/dashboard/arquivos` com importação, consulta e exportação CSV.
- Rotas Fastify em `/v1/arquivos`.
- Schema Prisma e migration para `Arquivo`, `Repasse` e campos de `Parcela`.
- Testes unitários e validação oficial com `npm run test:local-db`.

## Próximos passos

- Implementar reconciliação e relatório por consignante/consignatária.
- Publicar OpenAPI/Swagger dos novos endpoints.

## Documentos relacionados

- [Documentação](./documentacao.md)
- [Planejamento](./planejamento.md)
- [Testes](./testes.md)
- [Validação](./validacao.md)
- [Entrega](./entrega.md)
- [Evidências](./evidencias.md)
