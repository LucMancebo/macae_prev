# Análise de Status — Requisitos da Licitação

**Data:** 11/05/2026

Este documento consolida o estado das exigências da licitação com base no mapeamento das POC e no código-fonte atual. Objetivo: facilitar priorização, estimativa e próximos passos para fechar pendências.

## Resumo executivo

- **Concluídos:** funcionalidades centrais (fundação, segurança, core consignações) — suporte ao CRUD, regras de margem, fluxo de consignações, autenticação, auditoria e conformidade LGPD.
- **Parciais:** Integração com folha (import/export, parser) entregue em backend e frontend; engine de reconciliação MVP implementada (esta entrega); falta refinamento e relatórios segmentados finais.
- **Pendentes:** Módulos de BI/relatórios, manual online, homologação de interface final, e operações/infraestrutura para suporte contínuo e deploy.

## Classificação (por número POC)

- **Concluídos (implementados):** 1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 16, 17, 20, 21, 23, 24, 28, 29
- **Parciais (entrega parcial / em progresso):** 2, 18, 19
- **Pendentes (não implementados / planejados):** 10, 13, 14, 22, 25, 26, 27, 30

## Recomendações imediatas

1. Validar a engine MVP (`api/src/utils/reconciliacao.ts`) com casos reais e ajustar tolerância (atualmente 0.05).
2. Implementar endpoint de relatório (já criado `/v1/reconciliacao/relatorio`) e página frontend `/dashboard/reconciliacao` para análise operacional.
3. Extender reconciliação para gerar `Repasse` quando aplicável e armazenar motivos padronizados para triagem.
4. Atualizar `docs/openapi.json` com o novo endpoint e exemplificar payloads CSV/Retorno.

## Próximos passos para fechar M4

- Refinar engine de reconciliação (tolerância, heurísticas de matching).
- Criar página de relatório e export CSV.
- Executar testes E2E: upload → reconciliação → export.
- Gerar evidências (screenshots, logs) e atualizar `docs/milestones/M4_integracao_folha/evidencias.md`.
