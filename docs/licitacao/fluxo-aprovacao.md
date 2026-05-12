---
title: Aprovação e fluxo de status
lastUpdated: 12 de maio de 2026
---

Após um contrato ser digitado no sistema, ele entra em uma máquina de estados (workflow) para garantir que seja auditado antes do desconto cair na folha do servidor.

## Entendendo os Status

- **SOLICITADA**: O contrato foi recém-criado pelo banco. Neste momento, a margem do servidor fica _reservada_ (bloqueada), mas o contrato ainda não é oficial.
- **APROVADA**: O contrato foi verificado por um supervisor do banco e está pronto para virar um desconto ativo.
- **ATIVA**: O empréstimo está em vigor. As parcelas começarão a ser conciliadas mensalmente quando a Prefeitura enviar o arquivo CSV da Folha.
- **QUITADA**: O contrato chegou ao fim do prazo e todas as parcelas foram pagas. A margem do servidor é liberada automaticamente.
- **CANCELADA**: Ocorre quando há desistência ou erro de digitação. Um contrato cancelado não pode ser reativado; deve-se criar um novo.

## Como alterar o status?

Na tela de **Consignações**, localize o contrato na tabela. Na coluna "Ações", você verá botões para avançar o fluxo (Aprovar, Ativar, Cancelar).

> **Nota de Auditoria:** Contratos **nunca são excluídos** do banco de dados. Caso tenha digitado algo errado, altere o status para `CANCELADA`. Isso garante a transparência da operação para o TCE/RJ.
