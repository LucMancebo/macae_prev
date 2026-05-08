# Documento de Entrega — Milestone 1: Fundação & Infraestrutura

## Informações da Entrega

| Item                | Valor                         |
| ------------------- | ----------------------------- |
| **Milestone**       | 1 — Fundação & Infraestrutura |
| **Versão**          | v0.1.0                        |
| **Data de entrega** | 06/05/2026                    |
| **Responsável**     | Equipe SkyX                   |

## Changelog

### Adicionado

- Setup do diretório `api/` contemplando rotina e servidor base em Fastify.
- Isolamento de Configurações de Banco de dados no ORM via Prisma (v6).
- Mapeamento das 12 tabelas vitais (Servidores, Margens, Consignatárias e Contratos) para o Schema do Prisma.
- Documentação formal na subpasta da Milestone e adequação da ferramenta aos modelos do dicionário de dados.

### Modificado

- Registradas diretrizes de comportamento do projeto impedindo CSS In-line no Frontend.
- Refino da compilação TSC e formatações de Encodings de Windows para UTC-8 universal nas builds de TSConfig.
