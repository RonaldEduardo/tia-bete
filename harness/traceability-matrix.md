# Matriz de rastreabilidade do harness

| ID | Prioridade | Contrato/cenário | Executor planejado | Estado |
| --- | --- | --- | --- | --- |
| H01 / GLU-REC-001 | P0 | `occurredAt` preserva a hora informada, distinto de `createdAt`, com persistência local | Vitest + Playwright + build isolada | TESTED — Vitest 14/14, Playwright 4/4, typecheck, build e API compilada isolada PASS |
| H02 | P1 | edição gera auditoria, sem duplicata | Vitest + pgTAP | BLOCKED — schema ausente |
| H03 | P0 | aplicação requer confirmação explícita | Vitest + Playwright | PLANNED |
| H04 / REM-006 | P0 | uma leitura conclui no máximo uma ocorrência elegível, por menor distância temporal | Vitest domínio + SQLite futuro | TESTED — domínio REM-A (Vitest PASS); integração automática com glicemia e SQLite compartilhado fora deste slice |
| H05 / REM-008 | P0 | tipo incompatível, transporte ou horário não concluem ação clínica | Vitest domínio | TESTED — domínio REM-A (Vitest PASS); transporte e integração automática com glicemia fora deste slice |
| H06 / REM-004 | P0 | adiamento preserva agendamento original e respeita limite | Vitest com relógio controlado | TESTED — domínio + API/UI local (Vitest + Playwright PASS) |
| H07 / REM-005 | P0 | claim/replay não duplica despacho | Vitest concorrente + integração SQLite | PLANNED — scheduler/SQLite fora do REM-A |
| H08 | P1 | timezone/DST sem deslocamento silencioso, timezone IANA inválido e salto de dia rejeitados | Vitest domínio | TESTED — `npm run test:unit` PASS (timezone/DST) |
| H09 | P0 | snapshot de item não muda com alimento | Vitest + pgTAP | BLOCKED — schema ausente |
| H10 / TB-FOOD-001 | P0 | 150 g × 10 g/100 g = 15 g | Vitest | IMPLEMENTED — evidência HES pendente |
| H11 | P0 | carboidratos negativos, não numéricos e zero inválido são rejeitados | Vitest | PLANNED |
| H12 | P0 | usuário B não acessa recurso de A | pgTAP + Supabase local | BLOCKED — Supabase ausente |
| H13 | P0 | offline não confirma sucesso | Playwright | BLOCKED — UI ausente |
| H14 | P1 | exportação do autenticado, sem TIR | Vitest + Playwright | BLOCKED — relatório ausente |
| H15 | P1 | push negado mantém painel | Playwright + manual mobile | BLOCKED — PWA/push ausentes |
| H16 | P0 | laboratório isolado sem dose real | Vitest | PLANNED — S7 |
| H17 | P1 | navegação preserva persistência | Playwright | BLOCKED — Playwright ausente |
| H18 | P1 | teclado, rótulos e erros acessíveis | Playwright + revisão manual | BLOCKED — UI ausente |
| GLU-SMOKE-001 | P1 | registro, reload, inválido, HTTP 503 e viewport mobile | Playwright Chromium | TESTED — `npm run test:e2e`: 4/4 PASS |
| GLU-PERSIST-001 | P0 | reload/reinício recuperam leituras; migrations são idempotentes; SQLite e memória têm a mesma semântica; erro de escrita não gera sucesso | Vitest integração SQLite + aplicação | TESTED — 3 testes de integração SQLite PASS |
| GLU-BUILD-001 | P0 | API compilada encontra migration sem diretório-fonte | script Node + HTTP | TESTED — `npm run test:isolated` PASS |

| REM-DST-001 | P0 | horário recorrente inexistente ou ambíguo gera `skipped`, sem deslocamento silencioso | Vitest domínio | TESTED — REM-A (Vitest PASS) |

| REM-PERSIST-001 | P0 | criação, reconciliação idempotente, snooze e ignore sobrevivem ao restart SQLite | Vitest integração SQLite | TESTED — 2 testes PASS |
| REM-SMOKE-001 | P0 | criar, reload, adiar e ignorar são utilizáveis na UI mobile | Playwright Chromium | TESTED — 2 testes PASS |

| REM-D-ACTIVE-001 | P0 | ocorrência pendente é reavaliada com aba visível e ao retorno | Playwright | TESTED — smoke de retorno à aba PASS |
| REM-D-GLU-001 | P0 | leitura compatível conclui no máximo uma ocorrência e registra `glucoseReadingId` | Vitest + SQLite + Playwright | TESTED — unitário, integração e smoke PASS |
| REM-D-GLU-002 | P0 | leitura fora da janela, insulina ou falha transacional não confirma conclusão | Vitest | TESTED — 3 cenários PASS |
| INS-REC-001 | P0 | Aplicação manual basal ou rápida preserva horário efetivo, criação e timezone IANA | Vitest + SQLite + Playwright | TESTED — 35 testes unitários/integração, Playwright 13/13, typecheck, build e isolado PASS |
| INS-REC-002 | P0 | Falha não confirma sucesso; aplicação não altera nem conclui lembretes | Vitest + Playwright | TESTED — casos unitários e smoke Playwright PASS |
