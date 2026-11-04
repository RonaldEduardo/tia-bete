# Estratégia de harness — Tia-Bete

## Limite e estado

Este incremento estabelece TB-FOOD-001 com dados inteiramente sintéticos. Não manipula dados médicos reais nem produz recomendação de dose. HES V2 controla design, staging, revisão e aplicação; a execução local é registrada separadamente porque `LOCAL_TRUSTED` não pode planejar sem `HEAD` Git e worktree limpo.

## Pirâmide de testes

| Camada | Ferramenta | Protege | Oráculo |
| --- | --- | --- | --- |
| Regras de domínio | Vitest | cálculo de CHO, snapshots, validações, transições de lembrete | contratos no `tia-bete-mvp/README.md`, entradas sintéticas e resultados calculados externamente |
| Componentes e fluxos | Playwright | formulário, feedback de rede, navegação, viewport móvel e acessibilidade | comportamento observado pela interface e fixtures sintéticas |
| Banco e autorização | `supabase test db` + pgTAP | RLS, grants e acesso A/B para SELECT/INSERT/UPDATE/DELETE | sessão autenticada A versus B e políticas SQL versionadas |
| Lembretes | Vitest com fake clock/scheduler/push | idempotência, lease/claim, replay, DST e limites de retry | relógio e transporte falsos, estados persistidos e concorrência controlada |

## Estratégia por risco

- **Nuxt 4/Vue 3/TypeScript:** funções puras ficam em `shared/domain`; componentes recebem testes de fluxo só quando existirem. `typecheck`, lint e build são planejados, não executados nesta sessão.
- **Vitest:** testes de domínio usam apenas entradas sintéticas. TB-FOOD-001 valida `150 × 10 / 100 = 15` sem arredondamento de persistência.
- **Playwright:** smoke de páginas e fluxos móveis será criado depois da primeira tela; viewport móvel, teclado e feedback de erro têm prioridade.
- **Supabase/RLS:** migrations e pgTAP dependem de Supabase CLI/container e schema. Até isso existir, H12 é `BLOCKED`, não `PASS`.
- **Lembretes/concorrência:** worker usa relógio e transporte falsos; os casos cobrem claim atômico, chave idempotente, retry, replay e transições. Push em Android/iPhone reais continua `PENDING`.

## Limitações verificadas

- HES `DISCOVER`/`AUDIT` são estáticos e não analisam semântica de testes TypeScript.
- HES `VERIFY`/`ISOLATED` e sandbox estão indisponíveis.
- `LOCAL_TRUSTED` requer commit `HEAD` exato e worktree limpo; o repositório não possui commit inicial.
- Playwright, Supabase CLI/container e dispositivos reais não foram provisionados.
