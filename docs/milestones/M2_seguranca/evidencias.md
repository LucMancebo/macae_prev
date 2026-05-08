# Evidências de Funcionamento — Milestone 2

## 1. Testes Automatizados
A suite de testes E2E validou 11 cenários críticos de segurança, atingindo 100% de sucesso.

### 1.1 Sumário de Execução (Auth & Security)
```text
Test Suites: 3 passed, 3 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        7.784 s
```

## 2. Logs de Auditoria
A tabela `LogAuditoria` está registrando corretamente as ações:
- `LOGIN`: Sucesso no login.
- `LOGIN_MFA`: Sucesso na segunda etapa.
- `FALHA_LOGIN`: Tentativa com credenciais inválidas.
- `MFA_ENABLE`: Configuração do MFA pelo usuário.
- `ALTERACAO`: Registro de aceite dos termos LGPD.

## 3. Segurança de Senhas
As senhas no banco de dados estão criptografadas usando **BCrypt**, impossibilitando a leitura em texto plano.

## 4. Documentação de API (Swagger)
A documentação está acessível no endpoint `/docs`, permitindo testar os fluxos de autenticação diretamente pelo navegador.
