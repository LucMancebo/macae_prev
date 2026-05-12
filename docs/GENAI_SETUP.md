# Configuração GenAI (Somente Para Desenvolvimento)

Este documento descreve como usar o SDK `@google/genai` localmente para prototipagem sem integrar a API ao sistema.

## 1) Instalação

Já foi adicionada a dependência `@google/genai` no diretório `api` para testes locais. Se quiser usar o script independente, instale também no root (opcional):

```bash
# no root do projeto
cd api
npm install
```

## 2) Defina a chave de API

Crie um arquivo `.env` na raiz ou exporte a variável `GEMINI_API_KEY` no seu ambiente:

Windows PowerShell:

```powershell
$env:GEMINI_API_KEY = "sua_chave_aqui"
```

Bash (Linux/macOS):

```bash
export GEMINI_API_KEY="sua_chave_aqui"
```

> Atenção: nunca comite a chave em repositórios públicos. Use `VERCEL_ENV_VARS.md` ou variáveis de ambiente do provedor.

## 3) Executar o script de exemplo

O projeto tem um script de exemplo `scripts/genai-example.js` que usa o SDK e imprime a resposta.

Execute assim (do root do repo):

```bash
# do root
node scripts/genai-example.js "Explique IA em poucas palavras"
```

Ou defina a variável e rode sem argumento:

```bash
GEMINI_API_KEY="..." node scripts/genai-example.js
```

## 4) Integração com o sistema

Não foi feita integração com as rotas do backend. Se você quiser integrar futuramente, recomendo:

- Criar uma rota backend separada com autenticação e rate-limit
- Validar e sanitizar o payload
- Usar um serviço de filas para chamadas longas

## 5) Segurança

- Revogue chaves expostas imediatamente.
- Para desenvolvimento, use chaves com permissões limitadas e ambiente isolado.

---

Se quiser, eu posso adicionar um `npm script` no `package.json` do `api` para rodar o exemplo mais facilmente. Quer que eu adicione? (sim/não)
