# GLU-REC-001 — Registro local de glicemia

## Revisão 2

- **Governança:** APPROVED
- **Entrega:** TESTED
- **Fonte funcional:** revisão semântica aprovada em 2026-11-04; `tia-bete-mvp/README.md` §§ 3, 4 e H01
- **Substitui:** revisão 1 desta especificação

### Regra

Uma leitura possui identificador próprio, `occurredAt` em UTC/ISO 8601, `createdAt` em UTC/ISO 8601 e `timeZone` IANA. A data/hora local informada é convertida para um único instante UTC. Horários inexistentes ou ambíguos em DST são rejeitados; nunca são normalizados silenciosamente.

O histórico é ordenado por `occurredAt` decrescente, depois `createdAt` e `id`, ambos decrescentes.

Registros são persistidos exclusivamente no arquivo SQLite local do backend Nuxt. Eles sobrevivem ao reload da página e ao reinício do servidor local. Não há sincronização, autenticação, backup automático ou acesso público autorizado. Falha de persistência deve ser comunicada como erro, sem retorno de sucesso.

### Rastreabilidade

- Domínio: `tests/unit/glucose/validateGlucoseReading.test.ts`
- Aplicação: `tests/unit/glucose/glucoseUseCases.test.ts`
- Integração SQLite: `tests/integration/glucose/sqliteGlucoseReadingRepository.test.ts`
- Matriz: H01, H08 e GLU-PERSIST-001
- E2E: `tests/e2e/glucose.spec.ts` cobre registro, reload, inválido, falha HTTP e viewport mobile.
- Evidência: `npm run test:unit` (4 arquivos, 14 testes PASS), `npm run test:e2e` (4 cenários Chromium PASS), `npm run typecheck` (PASS), `npm run build` (PASS) e `npm run test:isolated` (API compilada sem diretório-fonte PASS), executados manualmente no host em 2026-11-04.

---

## Revisão 1 — Registro temporário de glicemia

- **Governança:** SUPERSEDED
- **Entrega:** TESTED
- **Motivo da substituição:** persistência SQLite local aprovada para sobreviver a reload e reinício do servidor.

Uma leitura possuía identificador próprio, `occurredAt` em UTC/ISO 8601, `createdAt` em UTC/ISO 8601 e `timeZone` IANA. A data/hora local informada era convertida para um único instante UTC; horários inexistentes ou ambíguos em DST eram rejeitados.

O repositório em memória representava somente a aba atual e seus registros eram perdidos ao recarregar. O histórico era ordenado por `occurredAt` decrescente, depois `createdAt` e `id`, ambos decrescentes.
