# INS-REC-001 — Aplicações manuais de insulina

## Contratos

| ID | Contrato |
| --- | --- |
| INS-REC-001 | Uma aplicação é declarada manualmente como `basal` ou `rapid`, com nome, unidades positivas, `occurredAt`, `createdAt` e timezone IANA. |
| INS-REC-002 | `occurredAt` resolve data/hora local no timezone informado e rejeita data, hora, timezone e instantes DST inexistentes ou ambíguos inválidos. |
| INS-REC-003 | Histórico local SQLite é ordenado por aplicação efetiva decrescente e sobrevive a reload e restart. |
| INS-REC-004 | Persistência falha sem confirmação de sucesso. |
| INS-REC-005 | Aplicação manual não recomenda, calcula, infere, cria ou conclui lembretes; insulina não é concluída automaticamente. |

## Evidências locais

- `npm run test:unit` — 35 testes PASS, incluindo domínio, falha de persistência e integração SQLite.
- `npm run typecheck`, `npm run build` e `npm run test:isolated` — PASS; migration 004 incluída no pacote do servidor.
- `npm run test:e2e` — 13/13 PASS, incluindo basal, rápida, validação, reload, detalhe, falha HTTP e não alteração de lembrete.
- Execuções locais em 2026-11-04 não equivalem a `VERIFIED` do HES.

## Fora do escopo

Edição/exclusão, recomendações ou cálculo de doses, correções, doses de refeição, criação por lembrete, confirmação automática, scheduler, push, Cron, serviços externos e dados clínicos reais.
