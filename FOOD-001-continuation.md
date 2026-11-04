# FOOD-001 — Registro de retomada

## Estado em 2026-11-04

- DESIGN corretivo ativo: `bf074335-9ec9-4a58-b70f-764a17aeea01`.
- Atomicidade de `SqliteMealRepository.save()` foi aplicada no plano `cb85e8c3-35b8-4466-9af8-253318d41c79`.
- O teste de integração cobre rollback em SQLite real quando o segundo item possui a mesma chave primária.
- O teste de snapshot foi aplicado e corrigido no plano `644ea96b-2d4d-4f49-b902-c8a93b4bdeb3`.

## Bloqueio atual

O teste de snapshot identificou um defeito real em `SqliteMealRepository.save()`:

```text
table meal_items has 6 columns but 7 values were supplied
```

O schema `server/infrastructure/foods/migrations/005_create_foods_meals.sql` declara seis colunas em `meal_items`, enquanto o `INSERT` possui sete placeholders. Por isso, nenhuma refeição válida pode persistir; o teste de rollback passa porque a inserção do primeiro item já falha.

## Próxima operação HES

Plano revisado e pendente de APPLY:

- `b04a2e3a-56e4-4a0a-aff9-4141e6fe8d8d`
- arquivo: `server/infrastructure/foods/sqliteFoodMealRepositories.ts`
- mudança: corrigir o `INSERT INTO meal_items` de sete para seis placeholders.

Após aprovação e APPLY, executar:

```bash
rtk npx vitest run tests/integration/foods/sqliteFoodMealRepositories.test.ts
rtk npm run test:unit
rtk npm run typecheck
rtk npm run build
```

## Evidências atuais

- `npm run typecheck`: passou antes da correção pendente.
- `npm run build`: passou antes da correção pendente.
- Teste de integração FOOD e `npm run test:unit`: falham pelo erro SQLite acima.
- Não executar APPLY do plano pendente sem aprovação humana vinculada.

## Escopo restante

Depois de restaurar a persistência válida, continuar sob o DESIGN corretivo com:

1. remoção de `any` no módulo alimentar;
2. apresentação de erros HTTP 422 por campo em `FoodMealsSection.vue`;
3. testes de domínio e Playwright FOOD-001;
4. validações gerais, sem declarar `VERIFIED` ou FOOD-001 concluído sem evidência compatível.
