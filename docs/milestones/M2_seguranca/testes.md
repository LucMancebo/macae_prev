# Plano e Resultados de Testes — Milestone 2

## 1. Resumo dos Testes
Foram realizados testes de ponta a ponta (E2E) para garantir a integridade do fluxo de autenticação e segurança.

## 2. Casos de Teste Executados

| ID | Descrição | Entrada | Resultado Esperado | Status |
|----|-----------|---------|--------------------|--------|
| CT01 | Login com Sucesso | Email/Senha válidos | Status 200 + JWT Token | ✅ PASSOU |
| CT02 | Senha Incorreta | Email válido + Senha errada | Status 401 + Erro credenciais | ✅ PASSOU |
| CT03 | Incremento de Tentativas | Senha incorreta | Campo `tentativas_login` aumenta | ✅ PASSOU |
| CT04 | Bloqueio de Usuário | 5 tentativas falhas | Status 401 + Mensagem de bloqueio | ✅ PASSOU |
| CT05 | Reset de Tentativas | Login após falhas | `tentativas_login` volta a 0 | ✅ PASSOU |
| CT06 | Acesso Protegido (/me) | Token JWT válido | Status 200 + Dados do usuário | ✅ PASSOU |
| CT07 | Acesso Sem Token | Nenhuma credencial | Status 401 | ✅ PASSOU |
| CT08 | Healthcheck | GET /health | Status 200 + Status OK | ✅ PASSOU |

## 3. Comandos para Execução
Para reproduzir os testes localmente:
```bash
cd api
npm test
```

## 4. Ambiente de Teste
- **Node.js**: v18+
- **Database**: PostgreSQL 15 (Docker)
- **Framework**: Jest + Supertest
