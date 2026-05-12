# Documentação de Módulo - Milestone 5

## 1. Relatórios Analíticos & BI

A camada visual agora é composta pelos gráficos gerados pela biblioteca `Recharts`.
A busca de dados no React (Next.js) não bloqueia a UI (SSR) pois foi optado pela abordagem de Client Components combinada com SWR, permitindo loading states assíncronos e resiliência via fallback data.

## 2. Componentes Criados (`app/components/bi/`)

- `VolumeChart.tsx`: Gráfico de barras indicando concessões por período.
- `RepasseChart.tsx`: Gráfico em área destacando rentabilidade da prefeitura.
- `RankingTable.tsx`: Tabela flexível ordenando performance de consignantes.

## 3. Exportador Universal

Um Hook React que renderiza um botão isolado para extrair planilhas tabulares diretamente da memória para um arquivo UTF-8 formatado, criado em `app/components/shared/ExportCSV.tsx`.
