# Prompt de kickoff — Tia-Bete / OpenCode ou Claude Code

Você é engenheiro responsável por implementar o MVP Tia-Bete. Leia integralmente `README.md` deste pacote e trate-o como fonte de verdade do escopo. Não invente necessidades clínicas nem transforme o protótipo matemático em calculadora de doses real.

## Modo de trabalho

1. Primeiro faça `DISCOVER`: detecte diretório/repositório existente, scripts, versões, CI, ambiente de banco e credenciais disponíveis SEM mostrar ou registrar segredos. Se for projeto novo, faça bootstrap mínimo.
2. Crie `.specs/tia-bete/decisions.md`, `domain.md`, `flows.md`, `acceptance.md` e `risks.md`, adaptados ao ambiente real, sem reabrir decisões já congeladas no README.
3. Antes de produção, crie harness reproduzível com Vitest, Playwright, testes de RLS e fixtures sintéticas. Escreva testes para H01–H18. Anote testes ainda impossíveis por dependência ambiental como BLOCKED (não PASS).
4. Trabalhe em slices S0 a S6: bootstrap; Auth+RLS; captura; alimentos; lembretes in-app; push; relatórios+deploy. Após cada slice, rode testes pertinentes e informe resultado real. S7 laboratório matemático isolado é opcional e deve ocorrer só depois de S0–S6.
5. Nunca execute ações destrutivas (banco, Git, deploy) sem descrever a operação e verificar o ambiente. Não faça deploy usando dados reais em banco não protegido.
6. Escolha soluções simples. Não introduza microserviços, fila externa, Kafka, monorepo ou arquitetura hexagonal extensa. Separe funções puras de domínio de infraestrutura/UI para testabilidade.
7. Sem `supabase service_role` ou chaves privadas no bundle; nenhuma tabela de dados de saúde com RLS desativado; não usar `localStorage` como fonte final de verdade.
8. Se Web Push não puder ser validado em Android+iPhone hoje, implemente lembretes na aplicação com estado real, documente a lacuna e pare de declarar push como pronto.
9. O simulador matemático de insulina, se iniciado, é protótipo de testes com dados sintéticos e SEM integração com eventos reais, sem exibir ou registrar doses de aplicação.
10. Finalize com matriz de critérios PASS/FAIL/BLOCKED, evidências (comandos executados e outputs resumidos), riscos e próximos passos. Não confunda 'arquivo criado' com 'teste passou'.

## Primeiro retorno esperado do agente

- Estrutura existente do repositório e diagnóstico.
- Comandos necessários para rodar localmente.
- Lista exata de migrations e policies RLS antes de qualquer gravação de dados.
- Primeiro slice implementável sem dependência externa.
- Ambiente/contas/segredos que o proprietário precisará provisionar manualmente em Supabase e Vercel, sem pedir que envie segredos em chat.

Prossiga autonomamente nos passos seguros do MVP; registre bloqueios em vez de simular sucesso.
