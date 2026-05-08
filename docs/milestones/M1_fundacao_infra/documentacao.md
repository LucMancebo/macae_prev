# Documentação — Milestone 1: Fundação & Infraestrutura

## Objetivo da Milestone

Preparar toda a base estrutural e técnica do projeto, incluindo setup do Backend, setup do Frontend (Next.js) e a definição e modelagem relacional de todo o banco de dados via Prisma (PostgreSQL).

## Funcionalidades Implementadas

| #   | Funcionalidade                                        | Módulo | Status       |
| --- | ----------------------------------------------------- | ------ | ------------ |
| 1   | Setup Inicial do Backend (Fastify + TypeScript)       | Infra  | ✅ Concluído |
| 2   | Setup Inicial do Frontend (Next.js + CSS externo)     | Infra  | ✅ Concluído |
| 3   | Modelagem de Banco de Dados via Prisma (12 Entidades) | DB     | ✅ Concluído |

## Arquitetura Implementada

O sistema adota uma arquitetura em Monolito Modular composto por:

- **Frontend**: Next.js App Router conectado aos padrões de Clean Code, proibindo o uso de in-line css.
- **Backend / API**: Node.js com `Fastify` preparado pra alta volumetria (ideal para as cargas massivas de folha de pagamento), acoplado nativamente com `TypeScript`.
- **Camada de Dados**: `Prisma ORM` gerenciando 12 Entidades relacionais vitais conectáveis em PostgreSQL contendo relacionamentos rígidos via UUIDs.

## Modelo de Dados (Transposto para Prisma Schema)

As 12 Tabelas já modeladas em banco de dados:

1. `servidores`
2. `consignatarias`
3. `margens`
4. `produtos`
5. `contratos`
6. `parcelas`
7. `usuarios`
8. `perfis_acesso`
9. `logs_auditoria`
10. `fluxos_aprovacao`
11. `arquivos_integracao`
12. `margem_servidor`

## Configurações

- Banco de dados instanciado sob _Singleton pattern_ no arquivo `api/src/config/database.ts` (previne memory leaks no Hot Reload).
- Rotinas e Scripts de inicialização configurados no Package do Backend (`dev`, `build` e `start`).
