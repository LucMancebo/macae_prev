"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import {
  ArquivoDetalheResposta,
  ArquivoImportacaoResposta,
  buscarArquivo,
  exportarArquivos,
  importarArquivo,
} from "../../../services/arquivos";
import { Badge, Button, Card, FormField, Input } from "../../../design-system/components";
import styles from "./arquivos.module.css";

const CSV_EXEMPLO = `consignante_id,consignataria_id,servidor_matricula,servidor_nome,produto_id,valor_liquido,desconto_consignante,taxa_efetiva,cet,parcela_numero,valor_parcela,data_vencimento,desconto_retencao,acrescimo_juros,observacoes
MACAEPREV,B001,MAT001,João Silva,PROD001,5000.00,0.00,5.1234,5.1234,1,450.00,2026-06-15,0.00,0.00,Importação inicial`;

function formatCount(value: number | null | undefined) {
  return typeof value === "number" ? value.toLocaleString("pt-BR") : "—";
}

function resolveTone(status?: string) {
  const normalized = (status || "").toUpperCase();
  if (["PROCESSADO", "CONCILIADA", "CONCLUIDO"].includes(normalized)) {
    return "success" as const;
  }
  if (["PROCESSANDO", "PENDENTE", "ERRO_PROCESSAMENTO"].includes(normalized)) {
    return "warning" as const;
  }
  if (["ERRO", "CANCELADO"].includes(normalized)) {
    return "danger" as const;
  }
  return "neutral" as const;
}

export default function ArquivosPage() {
  const [nomeArquivo, setNomeArquivo] = useState(
    "FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv",
  );
  const [conteudoCsv, setConteudoCsv] = useState(CSV_EXEMPLO);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [arquivoId, setArquivoId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [importacao, setImportacao] = useState<ArquivoImportacaoResposta | null>(null);
  const [arquivoDetalhe, setArquivoDetalhe] = useState<ArquivoDetalheResposta | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [loadingImportacao, setLoadingImportacao] = useState(false);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [loadingExportacao, setLoadingExportacao] = useState(false);

  const resumoImportacao = useMemo(() => {
    if (!importacao) return null;

    return [
      {
        label: "Linhas válidas",
        value: importacao.processamento.parse.linhas_validas,
      },
      {
        label: "Linhas com erro",
        value: importacao.processamento.parse.linhas_erro,
      },
      {
        label: "Taxa de conciliação",
        value: `${importacao.processamento.resumo.resultado_reconciliacao.taxa_conciliacao.toFixed(1)}%`,
      },
    ];
  }, [importacao]);

  async function handleSelecionarArquivo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setArquivoSelecionado(file);
    setNomeArquivo(file.name);

    const texto = await file.text();
    setConteudoCsv(texto);
    setMensagem(`Arquivo ${file.name} carregado no formulário.`);
  }

  async function handleImportar() {
    if (!conteudoCsv.trim()) {
      setMensagem("Informe o conteúdo CSV antes de importar.");
      return;
    }

    setLoadingImportacao(true);
    setMensagem("");

    try {
      const resultado = await importarArquivo({
        nomeArquivo,
        conteudoCsv,
      });

      setImportacao(resultado);
      setMensagem(
        `Importação concluída: ${resultado.processamento.resumo.status} com ${resultado.processamento.parse.linhas_validas} linhas válidas.`,
      );
    } catch (error: any) {
      setMensagem(error?.message || "Falha ao importar arquivo.");
    } finally {
      setLoadingImportacao(false);
    }
  }

  async function handleConsultar() {
    if (!arquivoId.trim()) {
      setMensagem("Informe um ID de arquivo para consulta.");
      return;
    }

    setLoadingConsulta(true);
    setMensagem("");

    try {
      const detalhe = await buscarArquivo(arquivoId.trim());
      setArquivoDetalhe(detalhe);
      setMensagem(`Arquivo ${detalhe.nome_arquivo || detalhe.id} carregado.`);
    } catch (error: any) {
      setMensagem(error?.message || "Falha ao consultar arquivo.");
    } finally {
      setLoadingConsulta(false);
    }
  }

  async function handleExportar() {
    setLoadingExportacao(true);
    setMensagem("");

    try {
      const resultado = await exportarArquivos({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
      });

      const blob = new Blob([resultado.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resultado.nome_arquivo;
      link.click();
      URL.revokeObjectURL(url);

      setMensagem(`Exportação iniciada: ${resultado.nome_arquivo}.`);
    } catch (error: any) {
      setMensagem(error?.message || "Falha ao exportar arquivos.");
    } finally {
      setLoadingExportacao(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroKicker}>M4 · Integração Folha</div>
          <h1 className={styles.heroTitle}>Arquivos de folha com importação, consulta e exportação CSV.</h1>
          <p className={styles.heroSubtitle}>
            A operação já conversa com o backend M4. Esta tela concentra o fluxo
            de envio de folha, inspeção do arquivo processado e geração do
            retorno CSV para download.
          </p>

          <div className={styles.heroBadges}>
            <Badge tone="success">Importação pronta</Badge>
            <Badge tone="warning">Reconciliação pendente</Badge>
            <Badge tone="neutral">Exportação CSV ativa</Badge>
          </div>
        </div>

        <Card className={styles.heroPanel}>
          <span className={styles.heroPanelLabel}>Atalhos operacionais</span>
          <div className={styles.heroPanelMetric}>
            <strong>{importacao ? importacao.processamento.parse.linhas_validas : "0"}</strong>
            <span>linhas válidas na última importação</span>
          </div>
          <div className={styles.heroPanelMetric}>
            <strong>{importacao ? importacao.processamento.parse.linhas_erro : "0"}</strong>
            <span>linhas com erro processadas</span>
          </div>
          <div className={styles.heroPanelMetric}>
            <strong>{arquivoDetalhe?.id ? "1" : "0"}</strong>
            <span>arquivo carregado na consulta</span>
          </div>
        </Card>
      </section>

      {mensagem ? (
        <Card className={styles.noticeCard} elevated={false}>
          <span className={styles.noticeLabel}>Status da operação</span>
          <strong>{mensagem}</strong>
        </Card>
      ) : null}

      <section className={styles.contentGrid}>
        <div className={styles.stack}>
          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Importar folha</h2>
                <p>
                  Envie um CSV válido ou cole o conteúdo bruto para testar o
                  processamento do backend.
                </p>
              </div>
              <Badge tone={resolveTone(importacao?.processamento.resumo.status)}>
                {importacao ? importacao.processamento.resumo.status : "Pendente"}
              </Badge>
            </div>

            <div className={styles.formGrid}>
              <FormField label="Nome do arquivo" required>
                <Input
                  value={nomeArquivo}
                  onChange={(event) => setNomeArquivo(event.target.value)}
                  placeholder="FOLHA_CONSIGNACOES_MACAEPREV_202605_140230.csv"
                />
              </FormField>

              <FormField label="Arquivo CSV">
                <input
                  className={styles.fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleSelecionarArquivo}
                />
                <span className={styles.helperText}>
                  {arquivoSelecionado
                    ? `Selecionado: ${arquivoSelecionado.name}`
                    : "Nenhum arquivo selecionado ainda."}
                </span>
              </FormField>

              <FormField className={styles.fullWidth} label="Conteúdo CSV" required>
                <textarea
                  className={styles.textarea}
                  value={conteudoCsv}
                  onChange={(event) => setConteudoCsv(event.target.value)}
                  placeholder={CSV_EXEMPLO}
                />
              </FormField>
            </div>

            <div className={styles.actionsRow}>
              <Button onClick={handleImportar} loading={loadingImportacao}>
                Importar arquivo
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConteudoCsv(CSV_EXEMPLO)}
              >
                Restaurar exemplo
              </Button>
            </div>

            {resumoImportacao ? (
              <div className={styles.metricGrid}>
                {resumoImportacao.map((item) => (
                  <Card key={item.label} className={styles.metricCard} elevated={false}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </Card>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Consultar arquivo</h2>
                <p>
                  Busque um arquivo já gravado no backend para revisar o resumo
                  e os metadados retornados.
                </p>
              </div>
              <Badge tone="neutral">GET /v1/arquivos/:id</Badge>
            </div>

            <div className={styles.inlineForm}>
              <FormField label="ID do arquivo">
                <Input
                  value={arquivoId}
                  onChange={(event) => setArquivoId(event.target.value)}
                  placeholder="uuid-do-arquivo"
                />
              </FormField>

              <Button onClick={handleConsultar} loading={loadingConsulta}>
                Consultar
              </Button>
            </div>

            {arquivoDetalhe ? (
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span>Arquivo</span>
                  <strong>{arquivoDetalhe.nome_arquivo || arquivoDetalhe.id}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Status</span>
                  <Badge tone={resolveTone(arquivoDetalhe.status)}>
                    {arquivoDetalhe.status || "—"}
                  </Badge>
                </div>
                <div className={styles.detailItem}>
                  <span>Usuário</span>
                  <strong>{arquivoDetalhe.usuario?.nome || "—"}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Total de linhas</span>
                  <strong>{formatCount(arquivoDetalhe.total_registros)}</strong>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                Nenhum arquivo consultado ainda.
              </div>
            )}
          </Card>
        </div>

        <div className={styles.stack}>
          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Exportar retorno</h2>
                <p>
                  Gera e baixa o CSV de retorno com base no período informado.
                </p>
              </div>
              <Badge tone="neutral">GET /v1/arquivos/export</Badge>
            </div>

            <div className={styles.formGrid}>
              <FormField label="Data inicial">
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(event) => setDataInicio(event.target.value)}
                />
              </FormField>

              <FormField label="Data final">
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(event) => setDataFim(event.target.value)}
                />
              </FormField>
            </div>

            <div className={styles.actionsRow}>
              <Button onClick={handleExportar} loading={loadingExportacao}>
                Baixar CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDataInicio("");
                  setDataFim("");
                }}
              >
                Limpar filtro
              </Button>
            </div>

            <div className={styles.previewBox}>
              <span className={styles.previewLabel}>Prévia do CSV</span>
              <pre>
                {(importacao?.processamento.resumo.resultado_reconciliacao &&
                  JSON.stringify(
                    importacao.processamento.resumo.resultado_reconciliacao,
                    null,
                    2,
                  )) ||
                  "Importe um arquivo para visualizar o resumo da conciliação."}
              </pre>
            </div>
          </Card>

          <Card className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Checklist M4</h2>
                <p>
                  Estado atual do módulo de folha dentro da milestone.
                </p>
              </div>
              <Badge tone="warning">Parcial</Badge>
            </div>

            <ul className={styles.checklist}>
              <li>Importação CSV funcional na API.</li>
              <li>Consulta por ID integrada com o backend.</li>
              <li>Exportação de retorno com download direto.</li>
              <li>Reconciliação e relatórios segmentados ainda pendentes.</li>
            </ul>
          </Card>

          {importacao ? (
            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Última importação</h2>
                  <p>
                    Resumo rápido do processamento retornado pela API.
                  </p>
                </div>
                <Badge tone={resolveTone(importacao.processamento.resumo.status)}>
                  {importacao.processamento.resumo.status}
                </Badge>
              </div>

              <div className={styles.importSummary}>
                <div>
                  <span>Nome</span>
                  <strong>{importacao.arquivo.nome_arquivo}</strong>
                </div>
                <div>
                  <span>ID</span>
                  <strong>{importacao.arquivo.id}</strong>
                </div>
                <div>
                  <span>Registros</span>
                  <strong>{formatCount(importacao.arquivo.total_registros)}</strong>
                </div>
                <div>
                  <span>Sucesso</span>
                  <strong>{formatCount(importacao.arquivo.registros_sucesso)}</strong>
                </div>
              </div>

              <div className={styles.previewBox}>
                <span className={styles.previewLabel}>Erros da última importação</span>
                <pre>
                  {JSON.stringify(importacao.processamento.parse.erros, null, 2)}
                </pre>
              </div>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
