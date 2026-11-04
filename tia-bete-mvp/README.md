# Tia-Bete — MVP Specification v1.0

**Status:** Grill 3/3 fechado em 2026-11-04. **Usuário inicial:** proprietário individual; arquitetura preparada para usuários adicionais. **Propósito:** diário pessoal de glicemia, insulina, alimentação e lembretes, com relatórios descritivos. **Implantação:** Vercel + Supabase. **Plataformas:** Android, iPhone e desktop via PWA.

> **Limite clínico:** o aplicativo NÃO prescreve, recomenda ou ajusta doses de insulina. O laboratório matemático deve usar dados SINTÉTICOS, sem acesso a eventos ou parâmetros reais do usuário e sem oferecer resultado aplicável a uma administração. Recomendações de doses reais exigem trabalho clínico, regulatório e de engenharia de segurança independente. Não substituir glicosímetro, profissional de saúde ou orientação de emergência.

## 1. Problema, objetivo e não objetivos

O principal problema é o atrito em registrar medidas e aplicações nos horários pretendidos. O MVP deve permitir registrar eventos em poucos segundos no celular, configurar lembretes reutilizáveis, reconciliar lembretes com eventos reais e produzir histórico/relatório sem inventar dados.

**Escopo MUST:** autenticação; PWA responsiva/instalável; registro/edição auditável de glicemia; registro/edição auditável de insulina basal/rápida; alimentos personalizados com g de carboidrato por 100 g; montagem de prato e somatório de CHO; agenda de lembretes com adiar/repetir/concluir por registro; Web Push de lembretes (com autorização e validação real em Android/iPhone para declarar pronto); histórico e exportação CSV e relatório HTML otimizado para impressão em PDF; isolamento de usuário; testes automatizados.

**SHOULD após o fluxo principal:** relatórios visuais mais elaborados, favoritos de refeição e automações adicionais. A implementação de Web Push pertence ao MVP, mas será declarada PENDENTE até validação em aparelhos reais; apenas lembretes no painel não satisfazem a meta final.

**NOT NOW:** recomendações de dose no uso real, integração com sensor CGM, gráfico TIR baseado em medidas pontuais, IA nutricional, regras clínicas automáticas, médicos acessando contas, compartilhamento público de dados, offline com escrita/sincronização, app nativo, pagamentos, gamificação punitiva.

## 2. Arquitetura e limites

- Nuxt 4 / Vue 3 / TypeScript; Tailwind CSS; PWA com manifest, ícones e service worker. Utilizar versões estáveis compatíveis, sem introduzir dependências desnecessárias.
- Aplicação Nuxt hospedada na Vercel; rotas server apenas quando estritamente necessário (relatório, assinatura push, validações especiais). Acesso a tabelas via supabase-js autenticado e RLS; nunca confiar apenas no filtro `user_id` do cliente.
- Supabase Auth, Postgres, migrations SQL, RLS e grants mínimos. Cada entidade do usuário tem `user_id` derivado da sessão/autorização; consultas e escritas devem negar usuário anônimo ou dono diferente.
- Supabase Cron (cada minuto, condicionado à disponibilidade do ambiente) + Edge Function de despacho, com credenciais no Vault, busca de ocorrências vencidas e assinaturas Web Push; sem usar cron da Vercel Hobby para notificações pontuais.
- PWA no iOS requer instalação na Tela de Início para Web Push e permissão solicitada após gesto explícito. Android e iOS exigem teste em dispositivo real. Push é auxiliar e NÃO é garantia de entrega pontual.
- Sistema online-first. Em falha de rede, nunca mostrar falso sucesso. Exibir erro, reter formulário no navegador durante a sessão e permitir nova tentativa. Offline write/sync fica fora da V1.
- Sem microserviços, mensageria externa ou domínio distribuído.

## 3. Entidades e contratos

Todas as entidades clínicas usam `id UUID`, `user_id UUID`, `created_at timestamptz`, `updated_at timestamptz` e, quando adequado, `deleted_at`. Guardar `occurred_at timestamptz` como instante verdadeiro e registrar timezone IANA do usuário. Não usar `created_at` como hora da medição.

| Entidade | Dados essenciais | Regras |
|---|---|---|
| user_preferences | user_id; timezone IANA; formato hora; preferências push | timezone configurável; default sugerido pelo navegador, confirmável |
| glucose_readings | glucose_mg_dl; occurred_at; context [fasting, pre_meal, post_meal, bedtime, other]; notes | valor positivo plausível por validação de entrada; nunca fabricar medição |
| insulin_applications | insulin_type [basal, rapid, other]; insulin_name opcional; units; occurred_at; notes; confirmed_applied=true | só grava aplicação realizada e explicitamente confirmada; não inferir dose por lembrete |
| foods | name; preparation_state; carbohydrates_g_per_100g; owner_id; active | usuário cadastra valores a partir de rótulo/fonte escolhida; distinguir cru/cozido |
| meals | occurred_at; label; notes | refeição pode existir sem medição ou aplicação |
| meal_items | meal_id; food_id opcional; food_name_snapshot; carbs_per_100g_snapshot; grams; calculated_carbs_g | carboidratos = grams × snapshot / 100; edição posterior do alimento NÃO altera histórico |
| clinical_parameters | user_id; effective_from; target_mg_dl; correction_factor_mg_dl_per_unit; carbohydrate_ratio_g_per_unit; insulin_action_duration opcional; source/confirmed_by_clinician opcional | versionar; somente registro de parâmetros; não ativar prescrição |
| reminder_rules | type [glucose, insulin_basal, insulin_rapid, meal, custom]; title; days_of_week; local_time; timezone; snooze_minutes; max_repeats; enabled | dias/horário controlados pelo usuário; limite antispam |
| reminder_occurrences | rule_id; scheduled_for; current_due_at; status [scheduled, snoozed, completed, skipped, expired]; attempts; related_event_id opcional | UNIQUE(rule_id, scheduled_for); idempotência; transições validadas |
| push_subscriptions | user_id; endpoint; keys (protegidas); platform; enabled; last_failure_at | revogação e endpoint expirado tratáveis |
| audit_events | entity_type; entity_id; actor_id; action; changed_at; before/after com minimização | guarda histórico de edição sem expor em logs |

Outros vínculos opcionais: `glucose_readings.meal_id`, `insulin_applications.meal_id`; não obrigar a sequência medição → refeição → aplicação.

### Contratos de domínio

- `calculateCarbohydrates(grams, carbsPer100g)` usa números decimais seguros, rejeita negativos/NaN, arredonda SOMENTE na apresentação conforme regra documentada, mantém precisão no valor salvo.
- `completeRelatedReminder(event)` procura somente a ocorrência pendente de mesmo `user_id` e tipo apropriado, dentro de janela configurada (proposta inicial: ±30 min em torno do `scheduled_for` para o primeiro ciclo; decisão explícita antes do go-live), escolhe a mais próxima e não conclui outras automaticamente. Uma aplicação basal não conclui lembrete de medição; uma refeição não confirma insulina.
- `snoozeOccurrence(id)` mantém `scheduled_for` original, atualiza `current_due_at`, aumenta contador somente quando aplicável; após máximo de repetições, marca como expirada/não confirmada, sem inferir ação realizada.
- `dispatchDueReminders()` usa claim atômico, token/lease ou transação e chave idempotente para evitar envio duplicado em concorrência; retries limitados, com métricas sem dados clínicos.
- Eventos criados a posteriori conservam `occurred_at` escolhido e `created_at` real. Correções deixam trilha no `audit_events`. Não permitir data impossível futura sem confirmação explícita.
- O indicador 'registros previstos x confirmados' é apenas completude do diário, NÃO adesão terapêutica nem comprovação de aplicação.

## 4. Fluxos principais

**F1 Medição rápida:** abrir tela → toque em 'Medir' → informar mg/dL (teclado numérico), hora atual por padrão/editável, contexto opcional → Salvar → retorno visual imediato do sucesso real → possível conclusão de ocorrência compatível.

**F2 Aplicação:** escolher tipo basal/rápida → quantidade, insulina opcional, horário real → confirmação explícita 'Apliquei esta dose' → Salvar → associar à refeição se desejar. Ação nunca inicia aplicação automaticamente.

**F3 Montar prato:** selecionar alimentos pessoais → peso em gramas → subtotal e total de carboidratos → salvar snapshots. Valores de alimentos são informados pelo usuário; não tratar exemplo fictício como tabela clínica.

**F4 Lembrete:** criar regra com tipo, hora, dias, repetição, pausa e timezone → criar ocorrências antecipadas de forma idempotente → disparar push se autorizado; fallback no painel → abrir registro, adiar, marcar como não realizado → conclusão por evento correspondente real. Caso push negado, deixar explícito e oferecer lembrete no painel; não prometer notificação de background.

**F5 Relatório:** selecionar período → consultar somente dados da pessoa autenticada → apresentar lista cronológica, valores por dia, estatísticas descritivas e lacunas de registro → CSV + página print-friendly (imprimir / salvar PDF) → marcações de dados declarados, não verificados e medições pontuais. Nunca calcular TIR como se houvesse CGM. Não inventar dados ausentes.

**F6 Laboratório matemático (isolado):** protótipo exclusivamente em ambiente/testes com parâmetros e casos sintéticos. Modelo conceitual: CHO/refeição ÷ relação CHO/insulina, correção=(glicemia-alvo)/sensibilidade; atividade de insulina e contextos clínicos tornam soma simplificada inadequada. NÃO conectar a valores pessoais, não exibir dose recomendada, não habilitar cadastro de aplicação por resultado. Uma eventual versão clínica requer validação profissional, mitigação de risco de insulina ativa, arredondamento para o dispositivo, hipoglicemia, horários, erros de glicemia, medicação e avaliação regulatória independente.

## 5. Segurança, privacidade e confiabilidade

- Dados de saúde são sensíveis. Autenticação antes de ler/escrever registros; TLS; RLS + GRANT mínimos em TODAS as tabelas expostas; `user_id` não confiável vindo da requisição; testar usuário A versus B para SELECT/INSERT/UPDATE/DELETE e joins.
- Nunca publicar chave Supabase secret/service_role, VAPID private key, tokens de push ou credenciais em frontend, Git ou logs. Aplicar segurança nas rotas server/edge, inclusive verificação de segredo do agendador.
- Não colocar glicemia, dose, nome de insulina ou outros dados sensíveis em payload visível na tela bloqueada. Texto padrão neutro: 'Você tem um registro agendado'.
- Não instrumentar analytics de terceiros com eventos clínicos; sem gravações de tela com dados reais; erros sem PHI.
- Push deve poder ser desativado e revogado; gerenciar múltiplos devices, limpar assinaturas inválidas.
- Exportação dos próprios dados; exclusão de conta e política de retenção/consentimento a definir antes de abrir a terceiros.
- Backup: no plano Supabase Free, **não há backup diário automático**. Para uso pessoal com dados reais, automatizar exportação cifrada para local seguro e testar restauração, ou contratar plano com backup; não considerar export CSV uma estratégia suficiente de restauração.
- Armazenamento em nuvem e UX clínica não substituem instrumentos de medida ou conduta médica. Não usar app para emergência.

## 6. Harness — primeiro, antes de implementar telas

**Ferramentas:** Vitest (unit/integration), Playwright (E2E e mobile viewport), pgTAP via `supabase test db` (RLS). Factory de dados 100% sintéticos, fake clock, fake scheduler, fake push transport; nenhum teste toca serviços clínicos reais ou envia push real. Contratos revisados antes de desenvolvimento, não autopromover testes gerados pela mesma IA sem inspeção.

**Comandos-alvo:** `npm run test:unit`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run harness` (agregador documentado); `supabase test db` quando container/CLI disponível. Sem esconder etapas bloqueadas como PASS.

**Casos mandatórios:**

H01 — glicemia com valor/hora informados preserva `occurred_at` diferente de `created_at`.
H02 — corrigir uma glicemia deixa trilha de auditoria e não produz duplicata inesperada.
H03 — aplicação basal é evento confirmado explícito; regra de insulina não pode criar aplicação.
H04 — registro de glicemia conclui no máximo UMA ocorrência adequada do próprio usuário.
H05 — registrar glicemia NÃO conclui ocorrência de insulina; registrar refeição NÃO confirma aplicação.
H06 — reagendamento preserva horário original; limite de repetições funciona; skip/expired não equivale a realizado.
H07 — concorrência/replay do worker não duplica ocorrência e despacho; recuperação de erro deixa status inspecionável.
H08 — TZ/DST e mudança de timezone não criam/deslocam ocorrências silenciosamente.
H09 — alteração de carboidratos do alimento não muda `meal_items` históricos (snapshot).
H10 — totalização de CHO: 150 g de alimento fictício com 10 g/100g + 100 g com 15 g/100g = 30 g.
H11 — valores negativos/não numéricos e zero inválido são rejeitados conforme contrato.
H12 — usuário B não lê, não altera, não exclui nem vincula recurso do usuário A (RLS e API).
H13 — sem internet, salvar NÃO retorna sucesso; entrada fica no formulário para retry.
H14 — exportação por período contém somente dados autenticados, diferencia falta de dados de leitura normal e não gera TIR.
H15 — push negado/bloqueado é mostrado; tarefas continuam no painel.
H16 — simulador isolado não consome dados reais e não cria registro nem recomendação de dose.
H17 — back/forward e recarregamento não perdem dados já persistidos.
H18 — acessibilidade: ações primárias usáveis com teclado e leitores de tela; rótulos de campos e feedback de erro.

**Bloqueios de release:** RLS cross-user falha; dado sem confirmação vira aplicação; simulador apresenta dose real; sucesso falso offline; push sem opt-in; tela principal não funciona em viewport móvel; migrations não reproduzíveis; falta de caminho para backup/restauração antes de dados reais.

## 7. Critérios de aceite do MVP

1. Acesso privado autenticado no endereço HTTPS; PWA instalável em Android e iPhone.
2. Registrar medição em até 3 ações principais **após abrir o formulário**; horário editável; resultado sincronizado e visível no histórico.
3. Registrar aplicação basal/rápida somente com confirmação explícita; edição com trilha.
4. Cadastrar alimento por 100 g, montar refeição e obter total correto com snapshots.
5. Criar/editar/pausar rotina semanal, adiar lembrete e concluir automaticamente APENAS quando houver evento real compatível.
6. Tela do dia expõe ocorrências confirmadas, pendentes e não realizadas sem misturar estados.
7. Relatório por datas, CSV e impressão para PDF sem dados fabricados.
8. Teste cross-user de RLS PASS. Sem segredo nos bundles. Sem logs clínicos.
9. Pipeline unit, e2e smoke, typecheck, lint e build PASS, com evidência armazenada.
10. Web Push testado em dispositivo real Android e iPhone antes de declarar a funcionalidade concluída. Se não puder validar hoje, registrar como **PENDENTE**, manter lembretes no app e NÃO afirmar que push funciona.
11. Para dados reais, backup/restauração estabelecidos e verificados, ou bloquear o uso além de ambiente de testes.

## 8. Plano de execução por vertical slices (ordem, sem promessa de prazo)

**S0 — Bootstrap:** Git limpo; Nuxt+TS; estrutura módulos; env.example sem segredos; lint/types/build; migrations vazias e smoke.

**S1 — Segurança/base:** Auth; schema; RLS+grants; testes A/B; seed sintética; migrations reproduzíveis. Só seguir com gate de segurança PASS.

**S2 — Captura imediata:** página Hoje; formulários rápidos glicemia e aplicação; histórico com horários; auditoria mínima; Vitest+Playwright mobile.

**S3 — Alimentação:** CRUD de alimentos; montagem prato; snapshots; testes de cálculo com aritmética decimal.

**S4 — Lembretes no app:** regras semanais, ocorrências, adiar, concluir por evento e reconciliar; fake clock; todos estados testados.

**S5 — Notificações push:** SW, manifest, opt-in, Supabase Cron/Edge Function, idempotência, observabilidade; teste manual em Android/iOS; PENDENTE se devices não disponíveis.

**S6 — Relatórios e hardening:** período, CSV, HTML print-to-PDF, testes de export, revisão de segurança, acessibilidade, backups, deploy Vercel. Não abrir acesso público antes da revisão.

**S7 — Laboratório isolado (opcional após MVP):** especificação e testes de matemática com dados sintéticos; nenhuma superfície de decisão de dose clínica.

**Definição de PASS:** comandos executados de verdade, saída e commits/documentos de evidência registrados. Documento escrito ou código gerado NÃO é evidência de execução.

## 9. Estrutura de repositório sugerida

```text
app/
  pages/{index,login,history,foods,meals,reminders,reports,settings}.vue
  components/{glucose,insulin,meals,reminders}/
  composables/
server/api/  # apenas serviços necessários com autenticação explícita
shared/domain/{glucose,insulin,foods,reminders,reports}/
supabase/{migrations,functions/dispatch-reminders,tests}/
tests/{unit,integration,e2e,fixtures}/
.specs/tia-bete/{decisions,domain,flows,acceptance,risks}.md
harness/{scenarios.md,runner.md,evidence/}
.env.example
```

## 10. Decisões/hipóteses a validar antes de uso real

- Permissões e comportamento de push em cada device/versão SO; suporte aos botões de ação da notificação varia por browser — deep link para app deve funcionar como fallback.
- Janela de auto-conclusão de ocorrência; sugestão técnica ±30 min sujeita a teste de UX.
- Uso de login privado; cadastro público desativado no lançamento pessoal.
- Fonte/estado de preparo de alimentos informados pelo usuário; não semear base inventada como clínica.
- Relatório médico é descritivo; formato final pode ser alinhado com profissional de saúde.
- A possibilidade futura de orientar doses ou abrir para terceiros requer revisão LGPD, segurança e enquadramento ANVISA (RDC 657/2022) antes de lançamento.

## Referências técnicas verificadas em 2026-11-04

- https://vercel.com/docs/cron-jobs/usage-and-pricing
- https://supabase.com/docs/guides/cron
- https://supabase.com/docs/guides/functions/schedule-functions
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/platform/backups
- https://www.gov.br/anvisa/pt-br/assuntos/produtosparasaude/temas-em-destaque/software-como-dispositivo-medico
