# Template de Entregáveis por Milestone

> Este documento define o template padrão para os 5 documentos obrigatórios gerados ao final de cada milestone.

---

## 1. DOCUMENTAÇÃO (`documentacao.md`)

```markdown
# Documentação — Milestone [N]: [Nome]

## Objetivo da Milestone
[Descrição do que foi implementado]

## Funcionalidades Implementadas
| # | Funcionalidade | Módulo | Status |
|---|---------------|--------|--------|
| 1 | ... | ... | ✅ Concluído |

## Arquitetura Implementada
[Diagrama e descrição da arquitetura desta milestone]

## Endpoints de API Criados
| Método | Rota | Descrição |
|--------|------|-----------|

## Telas Criadas/Modificadas
| Tela | Rota Frontend | Descrição |
|------|--------------|-----------|

## Modelo de Dados
[Tabelas criadas ou alteradas nesta milestone]

## Configurações
[Variáveis de ambiente, configurações adicionais]
```

---

## 2. TESTES (`testes.md`)

```markdown
# Plano de Testes — Milestone [N]: [Nome]

## Resumo
| Métrica | Valor |
|---------|-------|
| Total de casos de teste | X |
| Aprovados | X |
| Reprovados | X |
| Cobertura de código | X% |

## Casos de Teste

### CT-[N].01 — [Nome do Teste]
- **Tipo**: Unitário / Integração / E2E
- **Módulo**: [módulo]
- **Pré-condição**: [estado inicial]
- **Passos**: 
  1. ...
  2. ...
- **Resultado Esperado**: ...
- **Resultado Obtido**: ...
- **Status**: ✅ Aprovado / ❌ Reprovado

## Testes Automatizados
[Comandos executados e saída]

## Bugs Encontrados
| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
```

---

## 3. VALIDAÇÃO (`validacao.md`)

```markdown
# Validação — Milestone [N]: [Nome]

## Checklist de Requisitos

### Questões POC Validadas nesta Milestone
| POC | Requisito | Descrição Resumida | Status |
|-----|-----------|-------------------|--------|
| X | 4.1.X | ... | ✅ Atende / ⚠️ Parcial / ❌ Não atende |

### Critérios de Aceite
| # | Critério | Resultado |
|---|----------|-----------|
| 1 | ... | ✅ / ❌ |

### Aprovação
- [ ] Validado pelo responsável técnico
- [ ] Questões POC respondidas e comprovadas
- [ ] Aprovado para prosseguir à próxima milestone

**Data**: ___/___/______
**Responsável**: _______________
**Assinatura**: _______________
```

---

## 4. EVIDÊNCIAS (`evidencias.md`)

```markdown
# Evidências — Milestone [N]: [Nome]

## Evidências por Questão POC

### POC [X] — [Descrição]
- **Tipo de evidência**: Screenshot / Vídeo / Log
- **Descrição**: [o que a evidência demonstra]
- **Arquivo**: [link para screenshot/vídeo]

![Evidência POC X](./screenshots/poc_X.png)

## Evidências de Testes
- **Relatório de testes**: [link]
- **Cobertura de código**: [screenshot]

## Evidências de Infraestrutura
[Se aplicável: logs de deploy, configurações AWS, certificados SSL]

## Evidências de Segurança
[Se aplicável: scans de vulnerabilidade, testes de penetração]
```

---

## 5. ENTREGA (`entrega.md`)

```markdown
# Documento de Entrega — Milestone [N]: [Nome]

## Informações da Entrega
| Item | Valor |
|------|-------|
| **Milestone** | [N] — [Nome] |
| **Versão** | v0.[N].0 |
| **Data de entrega** | DD/MM/AAAA |
| **Responsável** | [Nome] |

## Changelog
### Adicionado
- ...

### Modificado
- ...

### Corrigido
- ...

## Questões POC Respondidas
| POC | Status |
|-----|--------|
| X | ✅ Respondida e validada |

## Artefatos Entregues
| Artefato | Caminho |
|----------|---------|
| Código-fonte | /api, /web |
| Documentação | /docs/milestones/MN/ |
| Testes | /api/tests, /web/tests |

## Métricas
| Métrica | Valor |
|---------|-------|
| Cobertura de testes | X% |
| Endpoints criados | X |
| Telas criadas | X |

## Próximos Passos
- Milestone [N+1]: [Nome da próxima]
- Foco: [resumo]

## Aprovação
- [ ] Documentação revisada
- [ ] Testes aprovados
- [ ] Evidências validadas
- [ ] Validação assinada
- [ ] **APROVADO para prosseguir à Milestone [N+1]**
```
