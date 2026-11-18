# Fluxo de telas — o que o usuário vê e faz hoje

> Escrito em 2026-07-26 e atualizado em 2026-11-18 para servir de FONTE em
> conversas de produto/UX (inclusive com IAs externas ao repositório).
> Descreve as telas e fluxos do **Tenência** como EXISTEM hoje, sem
> detalhes de implementação. Par de negócio no backend:
> `se-controle-backend/docs/visao-dominio.md` (modelo mental),
> [`03-product/tenencia.md`](./03-product/tenencia.md) (marca e
> posicionamento) e `backlog.md` (roadmap).
>
> Primeiro uso, ajuda contextual e estados vazios em detalhe:
> [`onboarding.md`](./onboarding.md).

## Onde o app roda

- **Web** no navegador, com sessão mantida ao recarregar a página.
- **Instalável como app** (PWA): no Android e no iPhone, "Adicionar à tela
  de início" abre o Tenência em tela cheia, com ícone próprio.
- **App Android** (APK) distribuído para grupos de testadores pelo Firebase
  App Distribution. Ao reabrir o app, a pessoa continua logada.
- Não há app nativo iOS; no iPhone o caminho é a PWA.
- Em **homologação**, uma faixa no topo avisa "Ambiente de homologação".

## Moldura

- **Mobile**: 5 abas na barra inferior. **Desktop/web**: as mesmas rotas
  com sidebar lateral — nenhuma tela é duplicada, muda só a moldura.
- Acesso: login por e-mail/senha (Supabase). Cadastro novo, confirmação de
  e-mail, recuperação de senha e entrada por **convite** (link que já
  vincula a pessoa à casa). Pessoa criada sem login (ex.: Karina) entra
  depois vinculando a conta.
- Usuários já cadastrados recebem convites de casa no **sino** de
  notificações; novos usuários recebem o convite por e-mail.

## Primeiro uso

- Quem ainda não começou o onboarding é levado ao wizard **"Comece aqui"**:
  escolhe como pretende usar (vida financeira própria, casa compartilhada
  ou entrada por convite) e segue os passos sugeridos. Pode pular a
  qualquer momento e reabrir depois pela Ajuda.
- O **Dashboard** mostra o checklist "Primeiros passos", calculado a partir
  da casa principal (casa principal definida, categorias disponíveis,
  conta ou cartão, primeiro gasto, combinado — este opcional). Cada item
  leva à tela onde se resolve; o checklist some quando tudo está feito.
- Telas vazias explicam o que falta e oferecem a ação seguinte (criar casa,
  registrar primeiro gasto, adicionar conta ou cartão...).

## As 5 abas

### 1. Dashboard
Estado do mês por casa: receitas, gastos, saldo e "minha parte" (pelo
combinado de custeio). Alterna eixo **competência/caixa** e mês. Abre na
**casa principal** escolhida no perfil. É o mapa, não o tribunal — mostra
situação, não julga. O sino da barra superior permite consultar e aceitar
convites pendentes.

### 2. Gastos
- **Lista** de compras (filtros por casa/período), com categoria (ícone e
  cor), responsável e meio de pagamento.
- **Novo gasto**: form com casa, responsável, categoria (selector visual),
  cartão/conta, forma de pagamento, data (competência derivada da data,
  editável), parcelas. Pode vincular a uma despesa fixa (aí herda o meio
  padrão do contrato). Ajuda curta junto dos conceitos.
- **Detalhe/edição** de uma compra, com rateio por pagadores quando a
  compra é exceção ao combinado. Em casas sem combinado, o bloco "Acerto
  de contas" não aparece.

### 3. Projeção
Saldo projetado por conta: saldo base + o que vai entrar/sair (receitas
esperadas, parcelas, faturas, despesas fixas) até a data escolhida. Exibe
os avisos de configuração incompleta (cartão sem conta de débito, contrato
sem meio padrão etc.) — guiam, não bloqueiam.

### 4. Metas
Lista, criação e edição de metas.

### 5. Mais (hub de gestão)
- **Receitas** — lista, nova, detalhe/edição.
- **Cartões e contas** — lista, novo, detalhe; **faturas** do cartão
  (lista e detalhe); **visibilidade/compartilhamento** com casas
  (incl. compartilhar saldo, opt-in).
- **Despesas fixas** — status do mês (em dia/atrasado), lista de
  **contratos** (com linhagem de versões), novo contrato,
  **registrar pagamento** (gera a compra vinculada), **justificar**
  (exceção do mês) e **reajuste** (valor novo + início da nova vigência —
  atômico no backend).
- **Receitas fixas** — espelho: status, contratos, novo,
  **registrar recebimento**, justificar, reajuste.
- **Relatórios** — "Para onde foi meu dinheiro?" (matriz categoria ×
  pessoa da casa, com período e eixo) e **Fechamento mensal** (com filtro
  de casa).
- **Gerenciar casas** — lista, nova, detalhe (membros com e-mail e
  papéis), **combinado de custeio** (percentuais por mês) e **acerto de
  contas** (saldo corrente entre as pessoas, extrato mensal, registrar
  pagamento/adiantamento), histórico de acertos confirmados e detalhe do
  relatório persistente. O usuário pode exportar o snapshot em PDF ou CSV.
  O combinado pode ser desativado para a casa quando não houver rateio entre
  pessoas; nesse caso cada gasto conta integralmente para quem pagou.
- **Convidar** — gera convite para entrar numa casa.
- **Ajuda e como usar** — primeiros passos, como registrar um gasto, caixa
  e competência, combinado, acerto, relatórios e convites; permite rever o
  wizard de primeiro uso.
- **Perfil** — dados da pessoa, fuso horário e **casa principal**.
- **Administração** — só para admin do sistema: gestão dos catálogos
  (categorias, formas de pagamento, origens de receita).

## Fluxos que cruzam telas (os que importam para pensar UX)

1. **Primeiro acesso**: cadastro/login → wizard "Comece aqui" → criar ou
   entrar numa casa → primeiro gasto → Dashboard com o checklist
   "Primeiros passos".
2. **Lançar um gasto do dia a dia**: Gastos → Novo → salvar. Competência
   default deriva da data escolhida.
3. **Mês a mês das fixas**: Mais → Despesas fixas → status mostra o que
   falta → "registrar pagamento" cria a compra vinculada ao contrato → o
   status vira "em dia". Se não vai acontecer no mês: "justificar".
4. **Reajuste de contrato**: Despesas/Receitas fixas → contrato →
   Reajuste → informa valor novo + a partir de quando. Uma ação só.
5. **Acerto entre pessoas** (casa compartilhada): Mais → Casas → casa →
   Acerto → vê quem deve quanto → confirma o acerto de forma irreversível ou
   registra o pagamento/adiantamento quando a transferência acontece. O
   histórico permite consultar o snapshot e gerar novamente PDF/CSV.
6. **Entrada de um familiar**: quem convida gera o convite em Mais →
   Convidar; usuários existentes aceitam pelo sino e novos usuários
   definem nome e senha pelo link do e-mail, entram na casa certa e voltam
   para o login.
7. **Esqueci a senha**: login → recuperar senha → link no e-mail →
   redefinir senha.

## O que a tela NÃO faz (por design)

- Não edita totais nem "fecha" mês na mão — resumos são todos derivados.
- Não apaga nada — contratos encerram, cadastros desativam.
- Não mistura casas em nenhuma visão.
- Reembolso não vira receita — vive só no acerto.
- Não bloqueia o uso até o checklist de primeiro uso estar completo.
