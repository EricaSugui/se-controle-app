# Arquitetura do app

> Atualizado em 2026-11-01. O que cada tela
> FAZ está em `fluxo-telas.md`; este documento é o mapa técnico.
> A proposta de onboarding e ajuda está em [`onboarding.md`](./onboarding.md).

## Rotas (Expo Router)

```
app/
├── (auth)/                    ← login, cadastro, confirmacao, convidado,
│                                recuperar-senha, redefinir-senha
│
├── (app)/
│   ├── _layout                ← 5 abas (mobile) / sidebar (desktop) — fonte única em src/navigation/abas.ts
│   ├── dashboard/index
│   ├── gastos/                ← index (lista), novo, [id] (detalhe/edição)
│   ├── projecao/index         ← saldo projetado
│   ├── metas/                 ← index, novo, [id]
│   └── mais/                  ← hub de gestão
│       ├── index              ← menu
│       ├── receitas/          ← index, novo, [id]
│       ├── cartoes-contas/    ← index, novo, [id], faturas, fatura, visibilidade
│       ├── despesas-fixas/    ← index (status), contratos, novo, [id], pagamento, justificar, reajuste
│       ├── receitas-fixas/    ← index (status), contratos, novo, [id], recebimento, justificar, reajuste
│       ├── relatorios/        ← index (fechamento mensal), gastos (matriz categoria×pessoa)
│       ├── casas/             ← index, nova, [id], combinado, acerto,
│       │                         acertos (histórico), acerto-detalhe (snapshot)
│       ├── convidar
│       ├── perfil
│       └── administracao      ← catálogos; só admin_sistema
│
└── index                      ← redireciona auth → (app) ou (auth)
```

- `(auth)` e `(app)` são route groups — não viram segmento de URL.
- **Uma árvore de rotas só para mobile e desktop**: o layout de `(app)`
  alterna abas embaixo × sidebar lateral pelo breakpoint
  (`useBreakpoint`); nenhuma rota é duplicada.

## src/

```
src/
├── components/
│   ├── ui/                    ← agnóstico de negócio: Button, Sheet, Sidebar,
│   │                            CurrencyInput, DatePickerField, MonthPicker,
│   │                            selectors (Categoria/CartaoConta/FormaPagamento —
│   │                            chip + bottom sheet, usam icone/cor do banco)
│   └── domain/                ← conhece o domínio: forms de compra/receita/
│                                contratos/meta/cartão, charts (projeção, gastos)
│
├── context/                   ← AuthContext (sessão, pessoa logada)
├── hooks/                     ← useBreakpoint, useDashboard, useHover
├── navigation/abas.ts         ← fonte única das abas (Tabs + Sidebar leem daqui)
│
├── services/
│   ├── api/                   ← 1 módulo por recurso do backend (client.ts é o
│   │                            fetch autenticado); espelha o contrato OpenAPI
│   └── supabase/              ← client do Supabase (auth)
│
├── theme/                     ← tokens visuais
├── types/                     ← tipos do domínio (espelham o contrato)
└── utils/                     ← competência (MMM-AA), formatadores, confirmar
```

### Recuperação de senha e e-mail da pessoa

A recuperação de senha é feita pelo Supabase Auth. O link enviado para
`auth.users.email` abre `redefinir-senha`, que atualiza a senha da conta.

Quando uma pessoa já cadastrada no sistema recebe um e-mail pela primeira vez,
o endereço deve ser atualizado nos dois registros:

- `auth.users.email`, usando o usuário Supabase vinculado;
- `pessoas.email`, usando a pessoa correspondente.

O vínculo continua sendo `pessoas.supabase_user_id`; alterar o e-mail não cria
uma nova pessoa. Manter os dois e-mails iguais é necessário para recuperação
de senha, convites internos e exibição dos membros da casa.

## Regras que valem no repo todo

- **Todo acesso a dados passa por `services/api`** — componente nunca
  chama fetch direto; `client.ts` injeta o token.
- **Contrato manda**: tipos e services seguem o OpenAPI do backend
  (`se-controle-backend/openapi.yml`); mudanças chegam via
  handoffs (`se-controle-backend/docs/handoff-frontend-*.md`).
- **`components/ui` não conhece negócio**; o que conhece domínio vive em
  `components/domain`.
- **Competência** é `MMM-AA` em português (JAN..DEZ) — helpers em
  `utils/competencia.ts`; a competência default de um lançamento deriva
  da DATA escolhida, não de hoje.

## Testes e desenvolvimento

- **TDD é a prática preferencial para código novo e mudanças relevantes**:
  escrever um teste que expresse o comportamento esperado, implementar a
  menor mudança necessária e refatorar mantendo os testes passando.
- **Jest** é o runner padrão para testes unitários.
- Testes unitários devem priorizar regras de domínio, utils, hooks e
  componentes com comportamento observável, usando dependências externas
  isoladas por mocks ou fakes.
- Testes de integração devem validar a interação entre tela, services/api e
  contrato da API quando esse comportamento não puder ser coberto de forma
  confiável por um teste unitário.
- O código legado será coberto progressivamente, começando por regras
  financeiras e fluxos alterados. A ausência atual de testes não deve impedir
  melhorias incrementais.
- Toda correção de bug deve incluir um teste de regressão sempre que o
  comportamento puder ser reproduzido automaticamente.
- Uma mudança só deve ser considerada concluída quando os testes direcionados
  passarem; o conjunto completo deve ser executado quando a alteração afetar
  contratos ou infraestrutura compartilhada.

## Deploy

Web na Vercel (`vercel.json`) e APK Android via EAS (`eas.json`). Produção e
homologação devem ter projetos, variáveis públicas e backends separados.
O deploy web usa a raiz `front`, `npx expo export -p web` e a saída `dist`.
As variáveis do bundle são `EXPO_PUBLIC_API_URL`,
`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_API_KEY`; `REACT_APP_*`
não é consumida pelo app.
