# Modelo Entidade-Relacionamento — Sistema de Consignação MACAEPREV

---

## Diagrama ER

```mermaid
erDiagram
    SERVIDORES ||--o{ CONTRATOS : "possui"
    SERVIDORES ||--o{ MARGEM_SERVIDOR : "tem margem"
    CONSIGNATARIAS ||--o{ CONTRATOS : "opera"
    CONSIGNATARIAS ||--o{ PRODUTOS : "oferece"
    CONSIGNATARIAS ||--o{ USUARIOS : "emprega"
    PRODUTOS ||--o{ CONTRATOS : "vinculado"
    MARGENS ||--o{ PRODUTOS : "atribuída"
    MARGENS ||--o{ MARGEM_SERVIDOR : "calculada"
    CONTRATOS ||--o{ PARCELAS : "gera"
    CONTRATOS ||--o| CONTRATOS : "origina (portabilidade)"
    CONTRATOS }o--|| FLUXOS_APROVACAO : "segue"
    USUARIOS ||--o{ LOGS_AUDITORIA : "gera"
    USUARIOS }o--|| PERFIS_ACESSO : "possui"
    USUARIOS ||--o{ ARQUIVOS_INTEGRACAO : "processa"
    ARQUIVOS_INTEGRACAO ||--o{ PARCELAS : "processa"

    SERVIDORES {
        UUID id PK
        VARCHAR cpf UK
        VARCHAR nome
        VARCHAR matricula UK
        VARCHAR cargo
        ENUM situacao_funcional
        DATE data_admissao
        DECIMAL remuneracao_bruta
        ENUM status
    }

    CONSIGNATARIAS {
        UUID id PK
        VARCHAR cnpj UK
        VARCHAR razao_social
        VARCHAR nome_fantasia
        ENUM tipo
        DECIMAL cet_maximo
        ENUM status
    }

    MARGENS {
        UUID id PK
        VARCHAR nome
        ENUM tipo
        DECIMAL percentual_maximo
        ENUM status
    }

    PRODUTOS {
        UUID id PK
        VARCHAR nome
        ENUM tipo
        ENUM tipo_desconto
        UUID margem_id FK
        UUID consignataria_id FK
        DECIMAL juros_minimo
        DECIMAL juros_maximo
        INT prazo_minimo
        INT prazo_maximo
        ENUM status
    }

    CONTRATOS {
        UUID id PK
        VARCHAR numero_contrato UK
        UUID servidor_id FK
        UUID consignataria_id FK
        UUID produto_id FK
        DECIMAL valor_total
        DECIMAL valor_parcela
        INT quantidade_parcelas
        DECIMAL taxa_juros
        DECIMAL cet
        ENUM status
        ENUM tipo_operacao
        UUID contrato_origem_id FK
    }

    PARCELAS {
        UUID id PK
        UUID contrato_id FK
        INT numero_parcela
        DECIMAL valor
        VARCHAR competencia
        ENUM status
        VARCHAR motivo_nao_desconto
    }

    USUARIOS {
        UUID id PK
        VARCHAR nome
        VARCHAR email UK
        VARCHAR senha_hash
        UUID perfil_id FK
        UUID consignataria_id FK
        ENUM status
        BOOLEAN mfa_habilitado
    }

    PERFIS_ACESSO {
        UUID id PK
        VARCHAR nome UK
        JSON permissoes
    }

    LOGS_AUDITORIA {
        UUID id PK
        UUID usuario_id FK
        VARCHAR entidade
        UUID entidade_id
        ENUM acao
        JSON dados_anteriores
        JSON dados_novos
        VARCHAR ip_origem
        DATETIME data_hora
    }

    FLUXOS_APROVACAO {
        UUID id PK
        VARCHAR nome
        ENUM tipo_operacao
        JSON etapas
        ENUM acao_expiracao
        ENUM status
    }

    ARQUIVOS_INTEGRACAO {
        UUID id PK
        ENUM tipo
        VARCHAR competencia
        VARCHAR nome_arquivo
        ENUM status
        UUID usuario_id FK
    }

    MARGEM_SERVIDOR {
        UUID id PK
        UUID servidor_id FK
        UUID margem_id FK
        DECIMAL valor_total
        DECIMAL valor_utilizado
        DECIMAL valor_reservado
        DECIMAL valor_disponivel
        VARCHAR competencia_base
    }
```

---

## Cardinalidades Detalhadas

| Relacionamento | Cardinalidade | Descrição |
|----------------|--------------|-----------|
| Servidor → Contrato | 1:N | Um servidor pode ter vários contratos |
| Servidor → Margem_Servidor | 1:N | Um servidor tem uma margem por tipo de margem |
| Consignatária → Contrato | 1:N | Uma consignatária opera vários contratos |
| Consignatária → Produto | 1:N | Uma consignatária oferece vários produtos |
| Consignatária → Usuário | 1:N | Uma consignatária tem vários operadores |
| Margem → Produto | 1:N | Uma margem pode ter vários produtos atribuídos |
| Margem → Margem_Servidor | 1:N | Uma margem se aplica a vários servidores |
| Produto → Contrato | 1:N | Um produto pode estar em vários contratos |
| Contrato → Parcela | 1:N | Um contrato gera várias parcelas |
| Contrato → Contrato | 1:0..1 | Um contrato pode originar outro (portabilidade) |
| Fluxo → Contrato | 1:N | Um fluxo se aplica a vários contratos do mesmo tipo |
| Perfil → Usuário | 1:N | Um perfil é atribuído a vários usuários |
| Usuário → Log_Auditoria | 1:N | Um usuário gera vários logs |
| Usuário → Arquivo_Integração | 1:N | Um usuário processa vários arquivos |
| Arquivo_Integração → Parcela | 1:N | Um arquivo processa várias parcelas |

---

## Índices Recomendados

| Tabela | Índice | Tipo | Colunas |
|--------|--------|------|---------|
| servidores | idx_servidores_cpf | Unique | cpf |
| servidores | idx_servidores_matricula | Unique | matricula |
| contratos | idx_contratos_servidor | Index | servidor_id |
| contratos | idx_contratos_consignataria | Index | consignataria_id |
| contratos | idx_contratos_status | Index | status |
| parcelas | idx_parcelas_contrato | Index | contrato_id |
| parcelas | idx_parcelas_competencia | Index | competencia |
| parcelas | idx_parcelas_status | Index | status |
| logs_auditoria | idx_logs_data | Index | data_hora |
| logs_auditoria | idx_logs_usuario | Index | usuario_id |
| logs_auditoria | idx_logs_entidade | Index | entidade, entidade_id |
| margem_servidor | idx_margem_srv_unique | Unique | servidor_id, margem_id |
