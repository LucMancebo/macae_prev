# M5: Relatórios & Business Intelligence - Plano de Execução

**Duração Estimada:** 3 semanas | **Status:** 🔵 Em Início

---

## 📋 Objetivos

Esta milestone focará em fornecer ao MACAEPREV todas as ferramentas analíticas e métricas exigidas pela licitação (POCs 10, 14, 22 e 30).

## 🎯 Metas e Entregáveis

1. **Dashboards Gerenciais (POC 10)**
   - Gráficos de ranking de instituições (por volume financeiro e quantidade).
   - Volume de negócios por período.

2. **Exportação Universal (POC 14)**
   - Botões de "Exportar CSV/Excel" em todas as tabelas ativas (Servidores, Consignatárias, Margens, etc).

3. **Relatórios Consolidados com Filtros (POC 22)**
   - Filtros multi-parâmetro para contratos e parcelas (Consignante, Consignatária, Data, Status).
   - Exibição de motivos de suspensão (Reconciliação).

4. **Relatório de Receita/Repasse MACAEPREV (POC 30)**
   - Dashboard financeiro mostrando o cálculo e extração do valor retido em favor do município nas integrações de folha.

---

## 📅 Cronograma (Sprints)

### Semana 1: Backend de Relatórios e Exportadores

- **Task 1.1**: Criar rotinas e utilities no Fastify para conversão de dados do banco em CSVs via Node Streams (`csv-stringify`).
- **Task 1.2**: Criar endpoints de agregação de volume e ranking de bancos (`/v1/relatorios/volume`, `/v1/relatorios/ranking`).
- **Task 1.3**: Endpoint para busca analítica de repasses da prefeitura.

### Semana 2: Frontend (Dashboards)

- **Task 2.1**: Refatorar a tela Dashboard Principal (`/dashboard/page.tsx`) integrando bibliotecas de gráficos (Ex: Recharts).
- **Task 2.2**: Construir tela dedicada `/dashboard/relatorios` para cruzamento de filtros avançados.

### Semana 3: Exportação e Polimento

- **Task 3.1**: Incorporar os botões de "Baixar CSV" na UI de todos os CRUDs.
- **Task 3.2**: Testes de ponta a ponta (E2E) cobrindo a integridade dos dados exportados.
- **Task 3.3**: Fechamento da M5 e documentação da entrega final para diretoria.

---

## 🛠 Estratégia Técnica

- **Exportação CSV:** Exportações grandes devem ser geradas no backend e processadas via Node Streams para evitar erros de `Out of Memory` no Vercel (Payload Limits).
- **Gráficos:** Optaremos por uma biblioteca React moderna baseada em SVGs, preferencialmente o `Recharts`, que casa bem com o nosso Next.js App Router e Server Actions.
