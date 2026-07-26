---
name: layout-web
description: Convenções de layout responsivo (mobile + desktop) do se-controle-rn e o roadmap da visão web
---

# Layout responsivo do se-controle-rn

App Expo Router servindo iOS, Android e web (Vercel) a partir de **uma árvore de rotas só**.
Nasceu focado em mobile; a visão desktop está sendo construída por cima da mesma árvore.

## Princípio: rota é "o quê", layout é "como"

**Nunca duplicar rotas por dispositivo** (`/mobile/gastos` × `/desktop/gastos`). Custos:
URL compartilhada quebra ao abrir no outro device, deep linking e guards de auth
duplicam, ~50 telas viram ~100, e redimensionar a janela viraria uma navegação.

Só o layout depende do tamanho. A separação acontece em 3 níveis:

1. **Navegação** — `app/(app)/_layout.tsx`: tabs embaixo no compacto, `Sidebar` na lateral
   no amplo. Mesmo navigator nos dois casos.
2. **Largura** — o mesmo layout limita o conteúdo a 1200px centralizados.
3. **Composição** — dentro da tela: cards empilhados × grid, lista × tabela.

## Como identificar o contexto

Duas dimensões **independentes** — confundir as duas é o erro clássico:

- **Largura → layout.** `useBreakpoint()` (`src/hooks/useBreakpoint.ts`): `compacto` (<768),
  `medio` (768–1023), `amplo` (≥1024, onde a sidebar entra). Reage a resize e rotação.
- **`Platform.OS` → capacidade.** Picker nativo, hover, atalho de teclado. **Nunca** como
  proxy de "desktop": web roda no celular e iPad em paisagem é largo.

Quando a implementação diverge de verdade, prefira split por extensão
(`Componente.web.tsx`) a `if` no corpo — o bundler nativo nem carrega o código web.

## Onde as peças vivem

| Arquivo | Papel |
|---|---|
| `src/hooks/useBreakpoint.ts` | breakpoints; `BREAKPOINTS` exportado |
| `src/navigation/abas.ts` | `ABAS` — fonte única das 5 abas (nome, título, href, ícone). `<Tabs>` e `Sidebar` leem daqui |
| `src/components/ui/Sidebar.tsx` | nav lateral do desktop; `LARGURA_SIDEBAR` |
| `src/theme/tokens.ts` | `cores` e `raio` |
| `app/(app)/_layout.tsx` | shell: sidebar + limite de largura + `<Tabs>` |

## Armadilhas já pagas

- **`<Link asChild>` não aceita array de estilos no filho.** O `Slot` precisa mesclar o
  estilo dele com o do filho; array estoura em runtime com "You are passing an array of
  styles to a child of `<Slot>`". Use `StyleSheet.flatten([...])`. Tipos passam, o erro só
  aparece rodando.
- **Gráfico não pode medir a janela.** `useWindowDimensions().width - 32` funcionava porque
  a tela tinha padding 16; com sidebar + coluna limitada, estoura. `ProjecaoChart` e
  `GastosMensalChart` medem o próprio container via `onLayout` e só renderizam o `<Svg>`
  com `largura > 0`.
- **Não trocar de navigator por breakpoint.** Retornar `<Tabs>` ou `<Drawer>` conforme a
  largura desmonta a árvore ao cruzar o limite e perde o estado de navegação. Mantenha um
  navigator e troque só a moldura (`tabBarStyle: { display: 'none' }` + sidebar ao lado).
- **`expo-router/ui` (Tabs headless) não desenha header.** `dashboard` e `projecao` dependem
  do header do `<Tabs>` para o título; as outras 3 abas têm `Stack` próprio. Migrar para
  headless exige reimplementar esses headers — só vale se a sidebar precisar de estado de
  tab (badge de contagem, etc.).
- **`PressableStateCallbackType` não tem `hovered`** nos tipos do RN. Para hover use
  `onHoverIn`/`onHoverOut` (esses são tipados) com estado local no item.

## Tokens: tema × domínio

`src/theme/tokens.ts` tem a paleta extraída do uso real — **não é um redesign**.

Regra: cor que expressa **intenção** (primária, negativo, texto suave) vem dos tokens. Cor
que é **dado** continua literal onde está — a paleta por tipo de conta em
`CartaoContaSelector` e os `COR_PADRAO` que espelham defaults de coluna do backend não são
tema, e tokenizá-los quebraria o vínculo com o backend.

A primária é `#1565c0` (azul). O app tinha duas primárias — azul nas telas, `#6200ee` roxo
nos componentes de formulário; o azul ganhou por estar em 131 dos 144 usos.

**Migração parcial e proposital:** `src/components/ui/*` usa tokens; as ~54 telas em `app/`
ainda têm literais e adotam conforme forem tocadas. Elas já usavam `#1565c0`, então seguem
coerentes.

## Roadmap da visão web

Concluído:

- [x] `useBreakpoint` + limite de 1200px no shell de `(app)`
- [x] Sidebar no desktop com tab bar escondida; gráficos medindo container
- [x] `tokens.ts` + migração de `src/components/ui/*`

Pendente, em ordem recomendada:

- [ ] **A.1 — `(auth)` fora do shell.** `login`, `cadastro`, `convidado`, `confirmacao` e
  `+not-found` são irmãos de `(app)` no Stack raiz, então não pegam o limite de largura.
  `login.tsx` é `justifyContent: 'center'` sem `maxWidth`: num monitor 2560px os campos têm
  2512px. É a primeira tela do desktop e hoje é a pior. Extrair o shell para reuso.
- [ ] **C.5/C.6 — hover e foco de teclado.** Só a sidebar tem hover; foco não existe em
  lugar nenhum (Tab é invisível). Transversal — fazer **antes** do redesenho de telas, senão
  as telas são redesenhadas duas vezes.
- [ ] **B.3 — dashboard em grid.** Os 4 resumos são linhas `space-between` empilhadas.
- [ ] **B.4 — gastos como tabela + master-detail.** Os 4 campos do card já são colunas
  querendo existir; `gastos/[id]` pode renderizar ao lado da lista.
- [ ] **C.7 — selectors deixam de ser bottom sheet no desktop.** Os 3 usam
  `animationType="slide"` colado no rodapé com `maxHeight: 70%`.
- [ ] **D.8/D.9 — web como produto.** Título da aba é `se-controle-rn` (o `expo.name`) e
  igual em toda rota; não existe `app/+html.tsx`, então a página não declara `lang="pt-BR"`.
- [ ] **A.2 — sidebar absorve os destinos de "Mais".** No desktop, "Mais" é um item de
  sidebar que leva a outro menu. Decidir depois de B, quando o formato desktop estiver claro.
- [ ] **E.11 — escala de espaçamento/tipografia nos tokens**, quando B pedir.

## Verificação

Ver a skill `verify`. Vale lembrar dos limites: tipos e probe de bundle **não pegam layout
quebrado**, e o login precisa da usuária (Supabase real, banco de produção) — então toda
mudança de layout termina em roteiro manual, não em "verificado".
