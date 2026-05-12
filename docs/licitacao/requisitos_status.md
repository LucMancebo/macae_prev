# Análise de Status — Requisitos da Licitação

**Data:** 11/05/2026

Este documento consolida o estado das exigências da licitação com base no mapeamento das POC e no código-fonte atual. Objetivo: facilitar priorização, estimativa e próximos passos para fechar pendências.

## Resumo executivo

- **Concluídos:** funcionalidades centrais (fundação, segurança, core consignações) — suporte ao CRUD, regras de margem, fluxo de consignações, autenticação, auditoria e conformidade LGPD.
- **Concluídos Recentes:** Integração com folha de pagamento (M4) — parser de arquivos (CSV/UTF-8), reconciliação automatizada de parcelas e dashboards gerenciais por consignatária.
- **Parciais:** Migração de banco legado (POC 2) — API preparada, faltando script de carga de dados históricos.
- **Pendentes:** Módulo M5 (Relatórios Analíticos & BI), manual online, homologação de interface final, e infraestrutura em nuvem definitiva (SLA/Deploy).

## Classificação (por número POC)

- **Concluídos (implementados):** 1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 16, 17, 18, 19, 20, 21, 23, 24, 28, 29
- **Parciais (entrega parcial / em progresso):** 2
- **Pendentes (não implementados / planejados):** 10, 13, 14, 22, 25, 26, 27, 30

## Recomendações imediatas

1. Avançar para a elaboração das **Especificações Técnicas Completas** (Modelagem ER, Cenários de Uso, Dicionário de Dados) exigidas na licitação.
2. Iniciar o desenvolvimento da **Milestone 5 (Relatórios & BI)**, abordando o dashboard consolidado para a direção e a exportação de CSVs analíticos.
3. Finalizar o fluxo de migração de banco legado (POC 2).

## Próximos passos

- Levantar os requisitos de gráficos (donut, barra) para os dashboards de BI (M5).
- Estruturar exportadores genéricos e relatórios de arrecadação financeira do MACAEPREV.
