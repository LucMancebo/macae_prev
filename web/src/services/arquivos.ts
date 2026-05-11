import { apiFetch } from "./api";

const DEFAULT_LOCAL = "http://localhost:3333/v1";

export interface ArquivoImportacaoResultadoReconciliacao {
  arquivo_id: string;
  total_parcelas: number;
  conciliadas: number;
  pendentes: number;
  erros: number;
  taxa_conciliacao: number;
  detalhes_por_status: Record<string, number>;
  detalhes_por_motivo: Record<string, number>;
  data_inicio_processamento: string;
  data_fim_processamento: string;
  tempo_processamento_ms: number;
}

export interface ArquivoImportacaoResposta {
  arquivo: {
    id: string;
    nome_arquivo: string;
    status: string;
    total_registros: number;
    registros_sucesso: number | null;
    registros_erro: number | null;
    data_geracao: string;
    data_processamento: string | null;
  };
  processamento: {
    nome_arquivo: string;
    validacao: {
      valido: boolean;
      erros: string[];
      tamanho_bytes: number;
      encoding: string;
      checksum_md5?: string;
      checksum_sha256?: string;
      nome_valido: boolean;
      erro_nome?: string;
      duplicado: boolean;
      motivo_duplicacao?: string;
    };
    parse: {
      sucesso: boolean;
      linhas: Array<Record<string, unknown>>;
      linhas_validas: number;
      linhas_erro: number;
      erros: Array<{
        numero_linha: number;
        mensagem: string;
      }>;
      encoding: string;
      delimiter: string;
      tempo_processamento_ms: number;
    };
    resumo: {
      arquivo_id: string;
      nome: string;
      status: string;
      linhas_processadas: number;
      erros: Array<{
        numero_linha: number;
        mensagem: string;
      }>;
      resultado_reconciliacao: ArquivoImportacaoResultadoReconciliacao;
    };
  };
}

export interface ArquivoDetalheResposta {
  id: string;
  nome_arquivo?: string;
  tipo?: string;
  competencia?: string;
  caminho_arquivo?: string;
  status?: string;
  data_geracao?: string;
  data_processamento?: string | null;
  total_registros?: number;
  registros_sucesso?: number | null;
  registros_erro?: number | null;
  usuario?: {
    id?: string;
    nome?: string;
    email?: string;
    perfil?: string;
  };
  parcelas?: Array<{
    id: string;
    status?: string;
    competencia?: string;
    valor?: number;
  }>;
}

export interface ArquivoExportacaoFiltro {
  dataInicio?: string;
  dataFim?: string;
}

export interface ArquivoExportacaoResposta {
  csv: string;
  nome_arquivo: string;
  linhas: number;
  data_geracao: string;
}

function getApiBaseUrl() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  if (envApi) {
    return envApi.replace(/\/+$/, "");
  }

  return typeof window !== "undefined"
    ? `${window.location.origin}/api/v1`
    : DEFAULT_LOCAL;
}

async function rawApiFetch(endpoint: string, options: RequestInit = {}) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${getApiBaseUrl()}${normalizedEndpoint}`, {
    ...options,
    credentials: "include",
  });

  const rawBody = await response.text();
  if (!response.ok) {
    let message = rawBody || response.statusText || "Erro inesperado na API.";

    try {
      const parsed = rawBody ? JSON.parse(rawBody) : null;
      message =
        (parsed && typeof parsed === "object" && (parsed as any).message) ||
        (parsed && typeof parsed === "object" && (parsed as any).error) ||
        message;
    } catch {
      // Mantém o corpo textual original.
    }

    const error = new Error(String(message));
    (error as any).status = response.status;
    (error as any).statusCode = response.status;
    (error as any).body = rawBody;
    throw error;
  }

  return { response, rawBody };
}

export async function importarArquivo(payload: {
  nomeArquivo: string;
  conteudoCsv: string;
}): Promise<ArquivoImportacaoResposta> {
  return apiFetch<ArquivoImportacaoResposta>("/v1/arquivos/import", {
    method: "POST",
    body: JSON.stringify({
      nome_arquivo: payload.nomeArquivo,
      conteudo_csv: payload.conteudoCsv,
    }),
  });
}

export async function buscarArquivo(
  id: string,
): Promise<ArquivoDetalheResposta> {
  return apiFetch<ArquivoDetalheResposta>(`/v1/arquivos/${id}`);
}

export async function exportarArquivos(
  filtro: ArquivoExportacaoFiltro = {},
): Promise<ArquivoExportacaoResposta> {
  const query = new URLSearchParams();

  if (filtro.dataInicio) {
    query.set("data_inicio", filtro.dataInicio);
  }

  if (filtro.dataFim) {
    query.set("data_fim", filtro.dataFim);
  }

  const endpoint = query.toString()
    ? `/v1/arquivos/export?${query.toString()}`
    : "/v1/arquivos/export";

  const { response, rawBody } = await rawApiFetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "text/csv",
    },
  });

  const contentDisposition = response.headers.get("content-disposition") || "";
  const nomeArquivo = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];

  return {
    csv: rawBody,
    nome_arquivo:
      nomeArquivo ||
      `FOLHA_RETORNO_MACAEPREV_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.csv`,
    linhas: rawBody ? rawBody.split(/\r?\n/).filter(Boolean).length : 0,
    data_geracao: new Date().toISOString(),
  };
}
