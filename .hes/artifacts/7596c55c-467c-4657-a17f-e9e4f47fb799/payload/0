# GLU-SMOKE-001 — Smoke E2E de glicemia local

- **Revisão:** 2
- **Governança:** APPROVED
- **Entrega:** TESTED
- **Executor:** Playwright Chromium em viewport `390 × 844`
- **Dados:** exclusivamente sintéticos; SQLite em `test-results/glucose-e2e.sqlite`.

## Cenários

1. Registra uma glicemia sintética e a exibe no histórico.
2. Recarrega a página e recupera a mesma leitura pela API local.
3. Rejeita `0 mg/dL` e mantém o formulário aberto.
4. Simula HTTP 503 no POST, não confirma sucesso e mantém o formulário aberto.
5. Verifica a navegação principal e o campo de valor no viewport mobile.

## Evidências

- `npm run test:e2e` — 4 cenários PASS no Chromium local em 2026-11-04.
- O executor usa SQLite exclusivo em `test-results/glucose-e2e.sqlite`; o banco local de desenvolvimento não é usado.

## Limites

- Não substitui a integração SQLite nem a validação de DST no domínio.
- Valida Chromium local; não inclui dispositivos móveis reais, Safari ou Firefox.
- Não testa autenticação, rede pública, sincronização ou backup.
