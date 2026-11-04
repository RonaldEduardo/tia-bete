# REM-001 — Motor local de lembretes

## Revisão 1

- **Governança:** APPROVED
- **Entrega:** TESTED — REM-A
- **Escopo:** domínio puro e testes unitários; sem SQLite, scheduler, transporte ou Vue.

## Contratos aprovados

| ID | Contrato |
| --- | --- |
| REM-001 | Configuração válida contém tipo, hora local, dias da semana, timezone IANA e limites de adiamento. Padrões: 10 minutos e 2 adiamentos. |
| REM-002 | A identidade da ocorrência é determinística por lembrete, revisão de configuração, data local e hora local; geração repetida não duplica a mesma ocorrência. |
| REM-003 | Estados: `scheduled`, `due`, `snoozed`, `completed`, `ignored`, `expired`, `skipped`. Os quatro últimos são terminais. |
| REM-004 | Adiamento mantém `scheduledFor` imutável e atualiza somente `nextActionAt`; atingir o limite mantém a pendência. |
| REM-005 | Claims, leases e tentativas de notificação serão tratados na etapa de scheduler/persistência; falha de transporte não conclui ocorrência. |
| REM-006 | Uma leitura de glicemia usa `occurredAt`, janela de -30/+60 minutos e conclui no máximo uma ocorrência elegível pela menor distância temporal, com desempate determinístico e evidência `glucoseReadingId`. |
| REM-007 | SQLite, recuperação pós-restart e prevenção de replay pertencem à próxima etapa; o domínio já preserva estados e identidade necessários. |
| REM-008 | Tentativa, aceitação pelo transporte, visualização, ignorar e conclusão são fatos distintos. Insulina nunca é concluída automaticamente nem comprova aplicação. |

## REM-DST-001

Para horário local inexistente ou ambíguo, a ocorrência histórica é `skipped`, preserva data/hora local, timezone e revisão de configuração, e mantém `scheduledFor = null`. Os motivos são `nonexistent-local-time` e `ambiguous-local-time`. Ela não notifica, não adia e não conclui automaticamente; as próximas ocorrências válidas continuam sendo geradas.

## Evidências

- `npm run test:unit` — 20 testes PASS, incluindo 6 cenários REM-A.
- `npm run typecheck` — PASS.
- `npm run build` — PASS.
- Execuções manuais no host em 2026-11-04; não equivalem a `VERIFIED` do HES.

## Rastreabilidade

- Domínio: `tests/unit/reminders/reminder.test.ts`.
- Harness: H04–H07 serão detalhados nas etapas de SQLite e scheduler; REM-A cobre configuração, transições, adiamento, DST, idempotência e compatibilidade básica.
- GLU-REC-001 permanece independente e inalterado.


## Revisão 2 — vertical slice local

- **Governança:** APPROVED
- **Entrega:** TESTED — REM-A + criação, SQLite, reconciliação sob consulta, adiamento, ignore e interface local.
- **Fora do escopo:** scheduler, claims, leases, transporte, push, Cron, edição de configuração e integração automática com glicemia.

### Evidências da revisão

- `npm run test:unit` — 24 testes PASS, incluindo domínio, casos de uso e integração SQLite de lembretes.
- `npm run typecheck` — PASS.
- `npm run build` e `npm run test:isolated` — PASS; migrations 001 e 002 foram empacotadas.
- `npm run test:e2e` — 6/6 PASS, incluindo criação, reload, adiamento e ignore na interface.
- Execução manual local em 2026-11-04; não equivale a `VERIFIED` do HES.


## Revisão 3 — lembretes ativos e glicemia (REM-D)

- **Governança:** APPROVED
- **Entrega:** TESTED — a aba visível reavalia lembretes a cada 60 segundos e ao retornar à aba; uma leitura válida pode concluir uma única ocorrência de glicemia compatível.
- **Atomicidade:** a leitura e a conclusão são persistidas na mesma transação SQLite; a falha retorna erro sem confirmar sucesso.
- **Preservado:** REM-004, REM-006, REM-008 e REM-DST-001. A janela usa `occurredAt`: 30 minutos antes e 60 minutos depois de `scheduledFor`.
- **Fora do escopo:** app fechado, scheduler servidor, push, Cron, claims, leases, edição de configuração e conclusão automática de insulina.

### Evidências da revisão

- `npm run test:unit` — 29 testes PASS; inclui conclusão única, fora da janela, tipo incompatível e falha transacional.
- `npm run typecheck`, `npm run build` e `npm run test:isolated` — PASS.
- `npm run test:e2e` — 8/8 PASS; inclui retorno à aba, registrar pelo lembrete e conclusão automática visível.
- Execuções manuais locais em 2026-11-04; não equivalem a `VERIFIED` do HES.
