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
- **O `title` das telas não chega à aba do browser.** `ExpoRoot` roda com
  `documentTitle: { enabled: false }`, então `options.title` serve só ao header. Quem
  escreve a aba é o `<Head>` de `expo-router/head` (react-helmet) — há um `<Head>` padrão
  no layout raiz. Não adianta pôr `<title>` no `+html.tsx`: o helmet renderiza o dele
  antes, e com dois `<title>` o browser usa o primeiro.

## O que o react-native-web já resolve (não reimplementar)

Verificado no `node_modules`, não suposto:

- **Foco de teclado já funciona.** `Pressable` recebe `tabIndex = disabled ? -1 : 0` e o RNW
  não reseta `outline` em lugar nenhum — o browser desenha o anel padrão. O `+html.tsx` só
  troca esse padrão por um anel da marca via `:focus-visible`.
- **`cursor: pointer` já vem** em `Pressable` e em `Text` com `onPress`.
- **Hover não vem de graça** — esse é o gap real, e é por componente.

## Master-detail: search param no desktop, rota no celular

Padrão estabelecido em gastos, para repetir nas outras listas:

- **Estado da tela vai para a URL**, não para `useState`: `/gastos?competencia=MAI-26&editar=123`.
  Mês vira compartilhável e o voltar do browser funciona.
- **Desktop largo (`painelDuplo`, ≥1280)** abre o detalhe num painel via `router.setParams`.
  Não usar `router.push` para o painel: o `Stack` mantém a lista montada por baixo, então a
  rota de detalhe renderizaria uma **segunda** instância da lista — refetch e scroll novo a
  cada clique, justo o que master-detail existe para evitar.
- **Celular e desktop estreito** continuam em `push` para a rota `[id]`. `setParams` não
  empilha no navegador nativo, então o gesto de voltar deixaria de fechar o formulário.
- **O editor é um componente compartilhado** (`CompraEditor`), não uma tela. O que muda entre
  os dois contextos é só `onSalvo` (voltar × fechar painel e recarregar).
- **`key={idSelecionado}` no editor.** Sem isso, trocar de linha mantém o formulário montado
  com os valores da compra anterior enquanto o fetch não volta.
- **`useEffect` além do `useFocusEffect`** para recarregar: no painel a tela nunca perde nem
  reganha foco quando o id muda.

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
- [x] **A.1** — `CenteredColumn` + limite de 420px nos formulários de `(auth)`
- [x] **C.6 / D.9 / D.8** — `+html.tsx` com `lang="pt-BR"` e anel de foco da marca;
  `<Head>` no layout raiz dando título à aba (que estava **vazia**, não com o nome do app)
- [x] **C.5 parcial** — hover no `Button`

- [x] **B.3** — dashboard em grade (resumos em cards, casas com `flexWrap`)
- [x] **B.4** — gastos como tabela (≥768) + master-detail com painel (≥1280)

Pendente, em ordem recomendada:
- [ ] **C.7 — selectors deixam de ser bottom sheet no desktop.** Os 3 usam
  `animationType="slide"` colado no rodapé com `maxHeight: 70%`.
- [ ] **C.5 restante — hover nas outras listas.** Feito em gastos e no dashboard; as demais
  telas de lista (`receitas`, `metas`, `cartoes-contas`, `despesas-fixas`, …) seguem sem.
  Fazer junto com o redesenho de cada uma, usando `useHover`.
- [ ] **Master-detail nas outras listas**, seguindo o padrão da seção acima. `receitas` e
  `metas` são as candidatas óbvias.
- [ ] **Título por rota.** Hoje toda aba do browser diz "Se Controle". Cada tela precisaria
  do próprio `<Head>`; vale fazer junto com o redesenho de cada uma.
- [ ] **A.2 — sidebar absorve os destinos de "Mais".** No desktop, "Mais" é um item de
  sidebar que leva a outro menu. Decidir depois de B, quando o formato desktop estiver claro.
- [ ] **E.11 — escala de espaçamento/tipografia nos tokens**, quando B pedir.

## Verificação

Ver a skill `verify`. Vale lembrar dos limites: tipos e probe de bundle **não pegam layout
quebrado**, e o login precisa da usuária (Supabase real, banco de produção) — então toda
mudança de layout termina em roteiro manual, não em "verificado".
