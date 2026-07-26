# Arquitetura do app

> Atualizado em 2026-07-26 (contrato 3.8.0 do backend). O que cada tela
> FAZ está em `fluxo-telas.md`; este documento é o mapa técnico.

## Rotas (Expo Router)

```
app/
├── (auth)/                    ← login, cadastro, confirmacao, convidado
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
│       ├── casas/             ← index, nova, [id], combinado (custeio), acerto
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

## Deploy

Web na Vercel (`vercel.json`; FRONTEND_URL do backend aponta para lá) e
APK Android via EAS (`eas.json`).
