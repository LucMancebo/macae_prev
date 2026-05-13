import Link from "next/link";
import styles from "../ajuda.module.css";

const topics = [
  {
    id: "servidores",
    icon: "👤",
    title: "Servidores",
    description: "Cadastro, situacao funcional e rotinas de validacao.",
  },
  {
    id: "consignatarias",
    icon: "🏦",
    title: "Consignatarias",
    description: "Ativacao, suspensao e controle de parceiros.",
  },
  {
    id: "consignacoes",
    icon: "💼",
    title: "Consignacoes",
    description: "Fluxo de solicitacao, aprovacao e acompanhamento.",
  },
  {
    id: "margens",
    icon: "📊",
    title: "Margens",
    description: "Regras de limite e leitura de percentual maximo.",
  },
  {
    id: "usuarios",
    icon: "🔐",
    title: "Usuarios",
    description: "Acesso, MFA e pendencias de LGPD.",
  },
  {
    id: "arquivos",
    icon: "🗂",
    title: "Arquivos",
    description: "Importacao, processamento e conciliacao de folhas.",
  },
];

const faqs = [
  {
    question: "Como encontro um servidor rapidamente?",
    answer:
      "Use a busca do topo do dashboard para localizar por nome, CPF ou matricula.",
  },
  {
    question: "O que significa um alerta em vermelho no painel?",
    answer:
      "Indica pendencias que exigem verificacao imediata, como bloqueios, LGPD ou inconsistencias de status.",
  },
  {
    question: "Onde acompanho o status das consignacoes?",
    answer:
      "Consulte a secao de Consignacoes e o resumo operacional do painel para entender o fluxo atual.",
  },
];

export default function AjudaPage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Manual On-line</h1>
          <p className={styles.subtitle}>
            Acesso rapido aos temas mais usados do sistema e respostas para
            duvidas operacionais.
          </p>
        </div>
      </div>

      <section className={styles.grid} aria-label="Topicos do manual">
        {topics.map((topic) => (
          <article key={topic.id} id={topic.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} aria-hidden="true">
                {topic.icon}
              </div>
              <h2 className={styles.cardTitle}>{topic.title}</h2>
            </div>
            <p>{topic.description}</p>
            <ul className={styles.topicList}>
              <li className={styles.topicItem}>
                <Link
                  className={styles.topicLink}
                  href={`/dashboard/ajuda#${topic.id}`}
                >
                  Abrir area
                </Link>
              </li>
            </ul>
          </article>
        ))}
      </section>

      <section className={styles.faqSection} aria-labelledby="faq-title">
        <h2 id="faq-title" className={styles.faqTitle}>
          Perguntas frequentes
        </h2>

        <div className={styles.faqList}>
          {faqs.map((item) => (
            <article key={item.question} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{item.question}</h3>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </article>
          ))}
        </div>

        <p style={{ marginTop: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{ color: "var(--brand-primary, #4318ff)", fontWeight: 600 }}
          >
            Voltar para o painel operacional
          </Link>
        </p>
      </section>
    </div>
  );
}
