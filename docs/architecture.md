# Arquitetura do app

> Atualizado em 2026-11-18. O que cada tela FAZ está em
> [`fluxo-telas.md`](./fluxo-telas.md); este documento é o mapa técnico.
> Onboarding e ajuda: [`onboarding.md`](./onboarding.md).
> Aprendizados técnicos: [`lessons-learned/`](./lessons-learned/).

## Nome do produto × nome técnico

O produto se chama **Tenência** — é o nome que aparece para o usuário
(título da aba, sidebar, login, manifest PWA, nome do app no Android,
e-mails). **Se Controle** continua como nome técnico e não deve ser
trocado sem uma migração planejada:

| Onde | Valor | Por que não muda |
|---|---|---|
| `package.json` → `name` | `se-controle-rn` | nome do pacote/repositório |
| `app.json` → `slug` | `se-controle` | vinculado ao projeto EAS (`projectId`) |
| `app.json` → `scheme` | `secontrolern` | deep links já emitidos |
| Android `applicationId` / `namespace` | `com.ericasugui.secontrole` (flavor `prod`; `tcc` e `dev` usam sufixo `.tcc`/`.dev`) | identidade do app no Firebase e na loja; trocar = app novo |
| Backend | `se-controle-backend` | repositório e URL da API |

Texto visível ao usuário usa sempre "Tenência". Referência da decisão de
marca: [`03-product/tenencia.md`](./03-product/tenencia.md).

## Rotas (Expo Router)

```
app/
├── _layout                    ← AuthProvider + OnboardingProvider; segura a
│                                splash até auth e onboarding inicializarem
├── +html                      ← shell web: lang pt-BR, metas PWA/iOS, manifest
├── index                      ← trata o hash dos links do Supabase (invite,
│                                signup, recovery) e redireciona p/ (app) ou (auth)
│
├── (auth)/                    ← login, cadastro, confirmacao, convidado,
│                                recuperar-senha, redefinir-senha
│
└── (app)/
    ├── _layout                ← 5 abas (mobile) / sidebar (desktop) — fonte única em
    │                            src/navigation/abas.ts; banner de homologação; sino;
    │                            redireciona p/ onboarding quando status = not_started
    ├── dashboard/index        ← inclui o checklist de onboarding
    ├── despesas/              ← index (lista), novo, [id] (detalhe/edição)
    ├── receitas/              ← index (lista), novo, [id] (edição)
    ├── projecao/index         ← saldo projetado
    ├── onboarding/index       ← wizard "Comece aqui" (aba oculta da sidebar)
    └── mais/                  ← hub de gestão
        ├── index              ← menu
        ├── metas/             ← index, novo, [id]
        ├── cartoes-contas/    ← index, novo, [id], faturas, fatura, visibilidade
        ├── despesas-fixas/    ← index (status), contratos, novo, [id], pagamento, justificar, reajuste
        ├── receitas-fixas/    ← index (status), contratos, novo, [id], recebimento, justificar, reajuste
        ├── relatorios/        ← index (fechamento mensal), despesas (matriz categoria×pessoa)
        ├── casas/             ← index, nova, [id], combinado, acerto,
        │                         acertos (histórico), acerto-detalhe (snapshot)
        ├── convidar
        ├── ajuda              ← central "Ajuda e como usar"
        ├── perfil             ← fuso horário e casa principal
        └── administracao      ← catálogos; só admin_sistema
```

- `(auth)` e `(app)` são route groups — não viram segmento de URL.
- **Uma árvore de rotas só para mobile e desktop**: o layout de `(app)`
  alterna abas embaixo × sidebar lateral pelo breakpoint
  (`useBreakpoint`); nenhuma rota é duplicada.
- A aba `onboarding` existe em `ABAS` com `exibirNaSidebar: false`; o
  layout só a mostra enquanto o onboarding está `not_started` ou
  `in_progress`. Fora disso recebe `href: null`: toda aba precisa ser
  declarada no `<Tabs>`, senão o expo-router a recria sozinho, sem ícone.
- Abas: Dashboard, Despesas, Receitas, Projeção e Mais (Metas fica em Mais).
- `popToTopOnBlur`: ao sair de uma aba, a pilha dela volta à primeira
  tela. As pilhas de Gastos, Receitas e Mais declaram
  `unstable_settings.initialRouteName = 'index'`, para que uma tela interna
  aberta direto (atalho de outra aba, link, recarregar) tenha a tela
  principal embaixo e mostre o botão de voltar.

## src/

```
src/
├── components/
│   ├── ui/                    ← agnóstico de negócio: Button, Sheet, Sidebar,
│   │                            CurrencyInput, DatePickerField, MonthPicker,
│   │                            EmptyState, ContextualHelp, EnvironmentBanner,
│   │                            NotificationBell, selectors (Categoria/CartaoConta/
│   │                            FormaPagamento — chip + bottom sheet, usam
│   │                            icone/cor do banco)
│   └── domain/                ← conhece o domínio: forms de compra/receita/
│                                contratos/meta/cartão, OnboardingChecklist e
│                                charts (projeção, gastos)
│
├── context/
│   ├── AuthContext            ← sessão Supabase, pessoa logada (/auth/me)
│   └── OnboardingContext      ← estado do onboarding da pessoa
├── hooks/                     ← useBreakpoint, useDashboard, useHover
├── navigation/abas.ts         ← fonte única das abas (Tabs + Sidebar leem daqui)
│
├── services/
│   ├── api/                   ← 1 módulo por recurso do backend (client.ts é o
│   │                            fetch autenticado); espelha o contrato OpenAPI
│   └── supabase/              ← client do Supabase (auth): client.ts (nativo)
│                                e client.web.ts (web)
│
├── theme/                     ← tokens visuais
├── types/                     ← tipos do domínio (espelham o contrato)
└── utils/                     ← competência (MMM-AA), formatadores, confirmar
```

`NotificationBell` consulta convites internos pendentes e é exibido no
cabeçalho das telas autenticadas. O convite de uma pessoa já cadastrada não
envia e-mail: a aceitação explícita cria `casa_pessoas`.

### Inicialização, sessão e onboarding

- `app/_layout` só monta o `Stack` quando `AuthContext.initializing` é
  `false` **e** `OnboardingContext.initialized` é `true`; até lá a splash
  nativa continua visível.
- `initialized` marca só a **primeira** carga do onboarding. Recargas
  posteriores (ex.: depois do login) usam `loading` e não podem voltar
  `initialized` para `false` — isso desmontava a navegação e devolvia o
  usuário ao login no Android. Detalhes em
  [`lessons-learned/context-init_auth_life-cicle.md`](./lessons-learned/context-init_auth_life-cicle.md).
- A sessão do Supabase persiste entre recargas (F5 na web, reabrir o app no
  Android): `persistSession` + `autoRefreshToken`, gravando em
  `window.localStorage` na web e no `localStorage` do `expo-sqlite` no
  nativo. `detectSessionInUrl` fica desligado; os links do Supabase
  são tratados à mão em `app/index`.
- `AuthContext` restaura a sessão no evento `INITIAL_SESSION` e busca
  `/auth/me`; qualquer 401 do `client.ts` faz `signOut` e volta ao login.
- Na tela `convidado`, a sessão local é encerrada antes de definir a senha
  e aceitar o convite, para não misturar o convidado com uma sessão já
  aberta no aparelho.
- `mais/casas/nova` só chama `createCasa`. O front não chama mais
  `vincularPessoa` depois de criar a casa: essa chamada quebrava o fluxo de
  usuário novo.

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
- **Texto para o usuário diz "Tenência"**; identificadores técnicos seguem
  "se-controle" (ver tabela no topo).

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

## Ambientes e variáveis

Variáveis lidas pelo bundle (modelo em `.env.example`):

| Variável | Uso |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL do backend |
| `EXPO_PUBLIC_SUPABASE_URL` | projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_API_KEY` | anon key do Supabase |
| `EXPO_PUBLIC_APP_ENV` | `desenvolvimento`, `tcc` ou `homologacao` exibem o `EnvironmentBanner` (rótulo em `src/utils/ambiente.ts`); `producao` ou ausente, não |

`REACT_APP_*` não é consumida pelo app. Os valores ficam em `.env.dev`,
`.env.tcc` e `.env.prod` (fora do git; modelo em `.env.example`). Os
scripts do `package.json` desligam o dotenv do Expo (`EXPO_NO_DOTENV=1`) e
carregam o arquivo explicitamente com `dotenv-cli`, para não haver mistura
de ambientes. **Sem sufixo = DEV local**; TCC e produção são sempre
explícitos:

| Script | Ambiente | O que faz |
|---|---|---|
| `start`, `web`, `android`, `ios`, `eas:dev` | dev (`.env.dev`) | dev server / `expo run:*` |
| `start:tcc`, `web:tcc`, `android:tcc`, `ios:tcc` | tcc (`.env.tcc`) | dev server |
| `start:prod`, `web:prod`, `ios:prod` | prod (`.env.prod`) | dev server |
| `build:web:dev`, `build:web:tcc`, `build:web:prod` | conforme sufixo | `expo export -p web` local (a Vercel usa as próprias variáveis) |
| `android:create:<amb>`, `android:assemble:<amb>`, `android:install:<amb>` | `prod`, `tcc` ou `dev` | APK release do flavor (ver Android abaixo) |
| `android:distribute -- <amb> <grupo>` | conforme argumento | Firebase App Distribution |
| `version:bump` | — | sobe versão/versionCode no `app.json` |

DEV local, TCC e produção têm variáveis públicas e backends separados. O
DEV usa backend e Supabase locais (`back`: `npm run dev`). O plano de
ambientes completo fica no repositório `se-controle-workspace`
(`docs/planos/estrategia-ambientes-e-roadmap-baseline-tcc.md`).

## Branches

Fluxo: `feature/*` (a partir de `develop`) → PR para `develop` → validação
no DEV local → PR `develop` → `main` (produção), seguindo o checklist de
release do plano de ambientes. O PR `develop → main` usa **merge commit**
(não squash), para as duas branches não divergirem. Depois de cada
release, `develop` é alinhada com `main` por fast-forward.

A branch `hml` corresponde ao ambiente que será convertido em **TCC**
(branch `tcc`). Ela deixa de receber features e passa a receber só `main`,
até a baseline do TCC.

## Deploy e distribuição

### Web (Vercel) e PWA

- Raiz do projeto: `front`; build `npx expo export -p web`; saída `dist`
  (`vercel.json`).
- Há um projeto Vercel para prod e outro para o TCC (antiga hml). As
  variáveis `EXPO_PUBLIC_*` de cada um ficam nas **Environment Variables
  do projeto na Vercel**, com os mesmos valores do `.env.prod` / `.env.tcc`
  locais. (A Vercel do TCC ainda usa `EXPO_PUBLIC_APP_ENV=homologacao`
  até a conversão HML → TCC.) Os arquivos `.env.*` não vão para o git, então a Vercel não os
  enxerga; o `vercel.json` não define variáveis.
- O app é instalável como PWA: `public/manifest.json` (nome "Tenência",
  `display: standalone`, cor `#FDF6EF`) e as metas de `app/+html.tsx`
  (incluindo `apple-mobile-web-app-*` para "Adicionar à Tela de Início"
  no iPhone).
- Ícones web/PWA ficam em `public/` (`favicon.png`, `apple-touch-icon.png`,
  `pwa-192.png`, `pwa-512.png`); os originais centralizados estão em
  `assets/images/`.
- Logos dos templates de e-mail (Supabase Auth) ficam em
  `public/assets/brand/` e são servidos pela própria URL do app.

### Android

O projeto nativo `android/` **é versionado** e é a fonte do build de
release: o APK sai do Gradle local, não do EAS nem de `expo prebuild`.
Ele carrega configuração que o `app.json` sozinho não gera (plugins Gradle
do Firebase e App Distribution, assinatura).

- **Um app por ambiente (*product flavors*)**, instaláveis lado a lado
  no mesmo aparelho:

  | Flavor | `applicationId` | Nome no aparelho | Env | Firebase |
  |---|---|---|---|---|
  | `prod` | `com.ericasugui.secontrole` | Tenência | `.env.prod` | projeto de produção |
  | `tcc` | `com.ericasugui.secontrole.tcc` | Tenência TCC | `.env.tcc` | projeto `tenencia-tcc` |
  | `dev` | `com.ericasugui.secontrole.dev` | Tenência DEV | `.env.dev` | projeto de produção (junto com `prod`) |

  Cada flavor tem o próprio `google-services.json` em
  `android/app/src/<flavor>/` e o próprio nome em
  `src/<flavor>/res/values/strings.xml` (o `prod` usa o de `src/main`). O
  `namespace` (pacote Kotlin) continua `com.ericasugui.secontrole` em
  todos. Só o flavor `dev` aceita `http://` no release (`src/dev/AndroidManifest.xml`),
  para o APK falar com backend e Supabase locais pelo IP da máquina. As
  variantes de debug estão listadas em `debuggableVariants` no
  `react { }` do Gradle; sem isso, o bundle seria embutido no debug.
- **Versão — fonte única no `app.json`**: `expo.version` (versionName) e
  `expo.android.versionCode`. O `android/app/build.gradle` lê esses dois
  valores do `app.json`, e o script de distribuição também; não edite
  versão no Gradle. Para subir:

  ```bash
  npm run version:bump              # só versionCode +1 (novo build da mesma versão)
  npm run version:bump -- patch     # 1.0.0 → 1.0.1 e versionCode +1 (também minor | major)
  ```

  O `versionCode` precisa subir a cada APK distribuído: o Android não
  instala por cima um APK com `versionCode` igual ou menor.
- Assinatura release: keystore e senhas vêm das propriedades Gradle
  `TENENCIA_UPLOAD_STORE_FILE`, `TENENCIA_UPLOAD_STORE_PASSWORD`,
  `TENENCIA_UPLOAD_KEY_ALIAS` e `TENENCIA_UPLOAD_KEY_PASSWORD`
  (fora do git).
- Ícones e splash nativos ficam gerados em `android/app/src/main/res`.
  Mudar ícone/splash no `app.json` ou em `assets/images/` não chega ao APK
  sozinho. **Só quando mexer em ícone ou splash**, regenerar com o prebuild
  e revisar o diff antes de commitar:

  ```bash
  npx expo prebuild --platform android --no-install   # sem --clean
  git status
  git diff android/
  ```

  Commitar apenas ícones, splash e recursos (`res/mipmap-*`, `drawable*`,
  `values*`). Se o prebuild tiver alterado ajustes manuais — assinatura,
  `productFlavors`/`debuggableVariants`, blocos `firebaseAppDistribution`
  ou a leitura de versão no `android/app/build.gradle`, ou ainda recriado
  `android/app/google-services.json` (que agora fica por flavor) —
  descartar essa parte
  (`git checkout -- android/app/build.gradle` ou `git restore -p`).
  Gerar um APK e conferir o ícone no aparelho antes de distribuir.
  Fora isso, o prebuild não faz parte do fluxo de release.
- Firebase: `@react-native-firebase/app`, `crashlytics`, `analytics` e
  `remote-config`. O Gradle lê o `google-services.json` de
  `android/app/src/<flavor>/`. O da raiz (`front/google-services.json`,
  referenciado pelo `app.json`) só é usado pelo prebuild e deve ser igual
  ao de `src/prod/`.

  Remote Config e Analytics são por **projeto** Firebase. A divisão é:

  | Projeto | Apps | Remote Config |
  |---|---|---|
  | Produção (`tenencia-b28c9`) | `prod` e `dev` | Compartilhado, **com condição por app** em cada parâmetro: liga primeiro no DEV, depois para parte dos testadores de PROD, e então para todos |
  | `tenencia-tcc` | só `tcc` | Não usado. O TCC é acadêmico e congelado, isolado de qualquer configuração |

  Por isso o `google-services.json` de `src/dev/` é do projeto de
  produção, e o de `src/tcc/` é do `tenencia-tcc`. **Cada arquivo contém
  só o app do próprio flavor.** O console do Firebase baixa um arquivo com
  todos os apps do projeto. Ao atualizar um deles, remova as entradas
  (`client`) dos outros packages, para nenhum flavor carregar
  configuração de outro ambiente. No Analytics de produção, os eventos do app DEV aparecem
  separados por app e devem ser filtrados nas análises.
- Build release local, por ambiente (`prod`, `tcc` ou `dev`):

  ```bash
  npm run version:bump              # (ou -- patch/minor/major)
  npm run android:create:prod       # gera o bundle JS e os assets
  npm run android:assemble:prod     # gera android/app/build/outputs/apk/prod/release/app-prod-release.apk
  npm run android:install:prod      # instala o APK no aparelho via adb
  ```

  Para TCC e DEV, troque o sufixo (`:tcc`, `:dev`). O APK `dev` aponta
  para o `.env.dev`. Para usar no celular, o `EXPO_PUBLIC_API_URL` e o
  `EXPO_PUBLIC_SUPABASE_URL` precisam usar o IP da máquina na rede, não
  `localhost`. No dia a dia, prefira o dev client (`npm run android`, que
  roda a variante `devDebug`).

  O flavor `dev` é o **app de pré-produção** no aparelho: serve ao DEV
  local e, quando existir, ao HML na nuvem (sob demanda). O que muda é só
  o arquivo de ambiente do build (`.env.dev` ou um futuro `.env.hml`). Não
  há flavor `hml`: o flavor define o app (package, nome, Firebase), e o
  arquivo de ambiente define o backend.
- Distribuição para testadores via **Firebase App Distribution**:

  ```bash
  npm run android:distribute -- prod vip                    # ou: prod open
  npm run android:distribute -- prod vip "Corrige o login"  # notas extras opcionais
  npm run android:distribute -- tcc tcc
  npm run android:distribute -- dev dev
  ```

  `scripts/firebase/distribute-android.sh` lê o App ID do Firebase no
  `google-services.json` do flavor e só aceita combinações coerentes
  (`prod`→`tenencia-vip`/`tenencia-open`, `tcc`→`tenencia-tcc`,
  `dev`→`tenencia-dev`). Um APK de TCC nunca vai para os testadores VIP.
  As release notes são montadas a partir da versão do `app.json`. Exige
  `firebase login` feito antes (o `firebase-tools` está nas
  devDependencies).
- `eas.json` e `npm run eas:prod` existem, mas não são o caminho usado
  para lançamentos.

### iOS

Ainda não há build nativo iOS (`/ios` é ignorado). No iPhone o app é usado
como PWA pela web.
