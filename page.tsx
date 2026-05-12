import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./artigo.module.css";

// Simulação de um banco de dados de artigos (Markdown/HTML formatado em React)
// Numa implementação futura, isso pode vir de uma biblioteca como 'react-markdown' ou MDX
const artigosMock: Record<
  string,
  { title: string; content: React.ReactNode; lastUpdated: string }
> = {
  "login-mfa": {
    title: "Como fazer login e usar o MFA",
    lastUpdated: "12 de maio de 2026",
    content: (
      <>
        <p>
          O MACAEPREV utiliza um sistema de segurança avançado para proteger as
          operações de consignação. Além da sua senha padrão, você precisará de
          um código temporário gerado no seu celular.
        </p>
        <h2>Passo a passo para o login</h2>
        <ol>
          <li>Acesse a página inicial de login.</li>
          <li>Insira o seu e-mail institucional e a senha cadastrada.</li>
          <li>
            Abra o aplicativo de Autenticação no seu celular (ex: Google
            Authenticator, Authy).
          </li>
          <li>
            Digite o código de 6 dígitos que aparece na tela do aplicativo.
          </li>
        </ol>
        <p>
          <strong>Atenção:</strong> Se for o seu primeiro acesso, o sistema
          exigirá a leitura e o aceite dos Termos de Uso (LGPD) antes de liberar
          o painel.
        </p>
      </>
    ),
  },
  "criar-consignacao": {
    title: "Como criar uma nova consignação",
    lastUpdated: "10 de maio de 2026",
    content: (
      <>
        <p>
          A criação de contratos de consignação é restrita aos Correspondentes
          Bancários e segue um fluxo rigoroso de validação de margem disponível.
        </p>
        <h2>Instruções</h2>
        <ul>
          <li>
            Navegue até o menu <strong>Consignações</strong> na barra lateral.
          </li>
          <li>
            Clique no botão <strong>+ Novo Contrato</strong> no canto superior
            direito.
          </li>
          <li>
            Digite o CPF do servidor. O sistema mostrará automaticamente a
            Margem Disponível.
          </li>
          <li>Selecione o Produto desejado e insira o Valor da Parcela.</li>
        </ul>
        <p>
          O sistema fará o cálculo imediato do{" "}
          <strong>Custo Efetivo Total (CET)</strong>. Se estiver dentro do teto
          permitido, o contrato mudará para o status <em>SOLICITADA</em>.
        </p>
      </>
    ),
  },
};

interface ArtigoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtigoPage({ params }: ArtigoPageProps) {
  // No Next.js 15, os params dinâmicos são tratados como Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const filePath = path.join(process.cwd(), "public", "help", `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Parser simples de Frontmatter (para ler title e lastUpdated do markdown)
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  let data: Record<string, string> = {};
  let content = fileContent;

  if (match) {
    content = match[2];
    match[1].split("\n").forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        data[key.trim()] = rest
          .join(":")
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    });
  }

  const title = data.title || "Artigo de Ajuda";
  const lastUpdated = data.lastUpdated || "Data não informada";

  return (
    <div className={styles.container}>
      <Link href="/dashboard/ajuda" className={styles.backLink}>
        ← Voltar para o Centro de Ajuda
      </Link>

      <article>
        <header className={styles.articleHeader}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>
            <span>Atualizado em: {lastUpdated}</span>
            <span>Tempo de leitura: ~3 min</span>
          </div>
        </header>

        <div className={styles.content}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
