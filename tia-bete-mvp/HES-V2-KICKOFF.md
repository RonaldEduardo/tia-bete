# Tia-Bete — Kickoff com HES V2

**Objetivo:** usar o Harness Engineering System V2 instalado globalmente para montar e demonstrar um harness reprodutível para o MVP Tia-Bete (Nuxt 4 / TypeScript / Supabase), antes da implementação das funcionalidades.

**Documentação de produto:** `README.md` deste pacote. **Este arquivo substitui o fluxo genérico do `AGENT-PROMPT.md` quando a execução utilizar HES V2.**

> Não trate a V2 como release com todas as garantias: use apenas capacidades verificadas nesta instalação. `LOCAL_TRUSTED` exige autorização explícita, usa o host e não equivale a `ISOLATED` ou `VERIFY` de alta garantia. Não atribua resultado `PASS` a código gerado, teste não executado ou recurso bloqueado.

## Prompt para OpenCode / Claude Code

Você é o agente de engenharia do projeto **Tia-Bete**. Utilize a **skill global HES V2** como mecanismo principal de descoberta, contratos, staging, revisão, aplicação, auditoria e evidência. Não crie uma implementação paralela do HES. Não modifique o repositório do HES para adaptar o projeto Nuxt: a V2 é uma skill universal e o Nuxt é o alvo a ser descoberto.

### 0 — Preflight seguro

1. Localize a raiz do repositório do Tia-Bete, leia `README.md` e inspecione `git status --short --branch`; não sobrescreva conteúdo existente.
2. Verifique que a skill global foi carregada. Consulte a ajuda real do CLI; rode, se disponíveis, `hes --help`, `hes doctor`, `hes discover` e `hes status`. Descoberta deve funcionar sem inicialização obrigatória; se a CLI instalada pedir inicialização, documente a versão, a necessidade e o comando antes de alterar estado.
3. Registre versão e capacidades efetivamente disponíveis: DISCOVER, DESIGN, CONTRACT registry, CREATE, REVIEW, APPLY, AUDIT, LOCAL_TRUSTED, ISOLATED, VERIFY. Use nomes e flags encontrados na CLI real; não invente subcomandos.
4. Se o projeto estiver vazio, proponha bootstrap mínimo Nuxt 4 + TypeScript, sem dependências de produção desnecessárias. Comunique mudanças de ferramentas/infra e execute somente as ações permitidas pelo escopo.
5. Não execute comandos destrutivos, `audit fix`, deploy, migrations remotas, nem ações com dados reais sem autorização. Não armazene chaves, tokens, payloads clínicos ou logs sensíveis em `.hes`, evidências, Git ou conversas.

### 1 — DISCOVER → DESIGN

1. Descubra arquitetura e ferramentas reais do projeto; para projeto novo, classifique o inventário como **bootstrap/proposto** em vez de alegar cobertura.
2. Projete um harness adaptativo a Nuxt 4 / Vue 3 / TypeScript. Use Vitest para regras puras, Playwright para fluxos móveis, testes SQL/pgTAP para autorização RLS e testes com relógio/push simulados. O HES deve controlar estado/evidências, não substituir os frameworks.
3. Crie matriz rastreável **requisito → contrato aprovado → cenário → teste → execução/evidência → estado** com os cenários H01–H18 do `README.md`.
4. Priorize cinco contratos críticos antes das telas: tempo do evento versus tempo de gravação; aplicação de insulina confirmada; carboidratos por 100 g e snapshot; ocorrência/lembrete idempotente; isolamento multiusuário.
5. Para cada regra, descreva entrada, pré-condições, ação, resultado esperado, casos negativos, risco e oráculo de teste. Nenhum oráculo deve ser derivado exclusivamente da implementação que o agente escreverá.

### 2 — CONTRACT → CREATE → REVIEW → APPLY

1. Registre os contratos no Registry do HES, com revisão rastreável. Faça revisão humana do significado antes de promover qualquer contrato a `APPROVED`; o estado estrutural `APPROVED` não equivale a autorização de execução.
2. Use CREATE para gerar **testes reais** no framework descoberto, preferindo staging e revisão de diff. Aceite `GENERATED_NOT_VERIFIED` como estado intermediário normal.
3. Inspecione paths, imports, fixtures, riscos, hashes, diffs e escopo de cada artefato antes de APPLY. Não sobrescreva testes ou contratos existentes sem revisão explícita.
4. Testes devem usar somente dados sintéticos. Não incluir valores pessoais, parâmetros reais de insulina nem doses calculadas aplicáveis ao usuário.
5. Para capacidades não suportadas pela instalação HES, registre `ASSISTIDO`/`BLOCKED` e uma proposta manual revisável, sem fingir que CREATE gerou ou verificou o artefato.

### 3 — Executar e demonstrar o harness

1. Instale dependências autorizadas e configure scripts reais do projeto: `test:unit`, `test:e2e`, `typecheck`, `lint`, `build`, `harness`. Não declare comandos funcionais sem executá-los.
2. A execução no host deve seguir **LOCAL_TRUSTED apenas se houver autorização explícita, repositório confiável e escopo literal revisado**; não a chame de `VERIFY` de alta garantia nem de sandbox.
3. Demonstre pelo menos um ciclo verificável de comportamento: teste que falha quando a regra ainda não é implementada (RED), implementação mínima que o faz passar (GREEN) e regressão real em uma alteração controlada e reversível quando apropriado. Não mutar dados ou código de produção sem escopo explícito.
4. Execute somente os testes compatíveis com o slice atual; marque integração Supabase real, pgTAP ou push em aparelhos reais como `BLOCKED`/`PENDING` quando dependências ainda não estiverem provisionadas.
5. Registre evidências com comando, working directory, hash/revisão, duração, exit code, saída resumida não sensível e relação com cenário/contrato. Evidência bruta sensível não deve ser commitada.

### 4 — AUDIT → REPAIR/EVOLVE

1. Audite lacunas efetivas (por exemplo, contratos sem teste, testes sem assertiva, runner não executado, E2E ausente), deixando explícito o escopo inspecionado.
2. Diferencie falha do harness de defeito do produto, ambiente indisponível e causa inconclusiva. Não enfraqueça contratos para forçar PASS.
3. Quando uma regra mudar, evolua sua revisão e marque os testes afetados, preservando histórico.

### 5 — Plano de slices

- **S0**: Git/estrutura Nuxt; HES doctor/discover/status; configuração Vitest; primeiro teste real e relatório de baseline.
- **S1**: Auth + banco Supabase; migrations reproduzíveis; RLS e testes A/B. Sem dados reais enquanto não houver gate de segurança.
- **S2**: Captura de glicemia e aplicações confirmadas; testes de `occurred_at`, validação, persistência e auditoria.
- **S3**: Alimentos e pratos; cálculo decimal e snapshots com fixtures sintéticas.
- **S4**: Regras e ocorrências de lembretes, adiamento e conclusão; fake clock, idempotência, timezone e concorrência.
- **S5**: PWA + Web Push + dispatcher. Testar Android e iPhone reais; caso contrário declarar `PENDING`.
- **S6**: Relatório, CSV, impressão PDF, backup/restauração e endurecimento do deploy.
- **S7 (opcional)**: laboratório matemático isolado com dados sintéticos, sem recomendação ou vínculo com doses reais.

### Entregáveis esperados da primeira sessão

1. Diagnóstico real do HES (`doctor`, capacidades e limites) e do Tia-Bete (vazio ou existente).
2. Estratégia de harness Nuxt documentada em `.specs/tia-bete/harness-design.md`, sem impor arquitetura desnecessária.
3. Matriz H01–H18 com prioridades P0/P1, dependências, status `PLANNED/PASS/FAIL/BLOCKED` e contratos candidatos.
4. Primeiro pacote de testes em staging → revisão → aplicação → execução autorizada, com evidência real.
5. Resumo de `PASS`, `FAIL`, `BLOCKED` e `NOT_RUN` separado para **HES**, **harness do projeto** e **produto**, e próxima tarefa objetiva.

**Pare antes de produzir features completas.** A primeira sessão termina quando o harness mínimo foi criado, revisado e executado. Só então inicie S1 e seguintes.

## Ordem para o operador

1. Criar repositório privado `tia-bete` e colocar `README.md` e este arquivo na raiz.
2. Abrir o projeto no OpenCode com a skill HES V2 global disponível.
3. Enviar o prompt acima ou pedir: **"Leia HES-V2-KICKOFF.md e execute somente até o encerramento da primeira sessão."**
4. Revisar contratos, diff, ações `LOCAL_TRUSTED` e evidências antes de permitir S1.

## Resultados que não são equivalentes

- `DISCOVER` concluído ≠ harness criado.
- `CREATE` em staging ≠ teste integrado.
- `APPLY` concluído ≠ teste executado.
- Suite de testes do HES verde ≠ teste do Tia-Bete aprovado.
- `LOCAL_TRUSTED` aprovado ≠ execução isolada.
- Fixture Angular bloqueada na avaliação da V2 ≠ dependência Angular do Tia-Bete (alvo Nuxt/Vue).
