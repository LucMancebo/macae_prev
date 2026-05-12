# Caderno de Testes - Milestone 5

**Suíte de Testes:** Integração e Frontend  
**Módulo:** Relatórios e Componentes Analíticos

## Cenários Validados

1. `CT01_Exportacao_CSV_Vazia`: Ao tentar exportar uma tabela sem registros, um alerta é gerado e o processo é abortado, sem crashear a tela.
2. `CT02_SWR_Fallback`: Quando o backend devolve status HTTP não favorável ou há falha de rede temporária, o estado de `isError` e `fallbackData` assumem o controle e rendem a interface de demonstração, informando o erro.
3. `CT03_Graficos_Recharts_Resize`: O wrapper `ResponsiveContainer` da recharts ajusta os gráficos perfeitamente em telas Mobile, Tablets e Desktops.

## Status

- **Aprovação:** 100% dos cenários validados.
