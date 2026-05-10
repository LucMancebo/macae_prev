# OpenAPI / Swagger

O projeto gera a especificação OpenAPI automaticamente a partir das rotas registradas no Fastify.

Para gerar o arquivo localmente (arquivo gerado: `docs/openapi.json`):

```bash
# na raiz do repositório
npm run --prefix api generate:openapi
```

Observações:

- O comando realiza um `tsc` (build) e em seguida instancia a aplicação compilada para extrair a spec.
- Mantenha o `dist/` atualizado se fizer mudanças em rotas/schema antes de gerar.
