# TODO — Reformular design do Dashboard (docs-first)

## Passo 1 — Remover “cru”/conteúdo não essencial

- [x] Editar `web/src/app/dashboard/page.tsx`:
  - [x] Remover seções não entregáveis (cobertura funcional, checklist de interface, regras de negócio críticas, escopo de dados do banco, ações de layout).
  - [x] Manter apenas o necessário: header + KPIs reais + alertas resumidos + tabela real (servidores recentes).
  - [x] Ajustar copy para não prometer “logs” se não houver fonte real.

## Passo 2 — Alinhar CSS ao design system

- [x] Editar `web/src/app/dashboard/overview.module.css`:
- [ ] Trocar gradientes/mock styles por tokens (`--bg-card`, `--border-default`, `--shadow-*`, `--radius-*`).
- [ ] Padronizar grid de KPI e layout conforme `docs/tecnico/design_system.md`.
- [ ] Ajustar tabela para header/cells/hover consistentes com o design system.

## Passo 3 — Garantir status badges semanticamente corretos

- [ ] Se necessário, ajustar `web/src/design-system/components/Badge/badge.module.css` para:
  - [ ] usar tokens semânticos do design system
  - [ ] manter contraste em dark mode.

## Passo 4 — Verificação

- [x] Rodar lint/build do frontend.
- [ ] Revisar no browser que:
  - [ ] layout está consistente
  - [ ] KPIs e tabela renderizam
  - [ ] badges e tipografia não quebram.
