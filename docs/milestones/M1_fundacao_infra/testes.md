# Plano de Testes — Milestone 1: Fundação & Infraestrutura

## Resumo

| Métrica                 | Valor             |
| ----------------------- | ----------------- |
| Total de casos de teste | 3                 |
| Aprovados               | 3                 |
| Reprovados              | 0                 |
| Cobertura               | Foundation / Core |

## Casos de Teste

### CT-1.01 — Configuração TypeScript e Compilação da API

- **Tipo**: Unitário / Build
- **Módulo**: Backend / Infra
- **Pré-condição**: Código e dependências instalados.
- **Passos**:
  1. Executar no terminal backend: `npx tsc --noEmit`
- **Resultado Esperado**: Zero erros de compilação (Exit Code 0).
- **Resultado Obtido**: Compilação concluída em Node.js com sucesso total após correções de BOM e encode.
- **Status**: ✅ Aprovado

### CT-1.02 — Geração do Schema Prisma (DB Agnóstico)

- **Tipo**: Integração (ORM)
- **Módulo**: Banco de Dados
- **Pré-condição**: Dicionário de dados modelado no `schema.prisma`
- **Passos**:
  1. Executar `npx prisma format`
  2. Executar `npx prisma generate`
- **Resultado Esperado**: Tipos PrismaClient gerados compatíveis com a arquitetura definida sem erros de FKs.
- **Resultado Obtido**: Client gerado `(v6.19.3)` com 12 abstrações prontas e mapeadas corretamente.
- **Status**: ✅ Aprovado

### CT-1.03 — Transpilação do Frontend (Cross Browser)

- **Tipo**: Build
- **Módulo**: Frontend Web
- **Pré-condição**: Scaffold base configurado
- **Passos**:
  1. Compilar o frontend com `npm run build` na pasta `/web`
- **Resultado Esperado**: Next.js App Router ser construído perfeitamente.
- **Resultado Obtido**: Scaffold rodando sem inline css, pronto para compor as telas cross-browser responsivas.
- **Status**: ✅ Aprovado
