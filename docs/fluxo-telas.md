# Fluxo de telas — o que o usuário vê e faz hoje

> Escrito em 2026-07-26 para servir de FONTE em conversas de produto/UX
> (inclusive com IAs externas ao repositório). Descreve as telas e fluxos
> como EXISTEM hoje, sem detalhes de implementação. Par de negócio no
> backend: `se-controle-backend/docs/visao-dominio.md` (modelo mental),
> `tenencia.md` (posicionamento) e `backlog.md` (roadmap).

## Moldura

- **Mobile**: 5 abas na barra inferior. **Desktop/web**: as mesmas rotas
  com sidebar lateral — nenhuma tela é duplicada, muda só a moldura.
- Acesso: login por e-mail/senha (Supabase). Cadastro novo, confirmação de
  e-mail e entrada por **convite** (link que já vincula a pessoa à casa).
  Pessoa criada sem login (ex.: Karina) entra depois vinculando a conta.

## As 5 abas

### 1. Dashboard
Estado do mês por casa: receitas, gastos, saldo e "minha parte" (pelo
combinado de custeio). Alterna eixo **competência/caixa** e mês. É o mapa,
não o tribunal — mostra situação, não julga.

### 2. Gastos
- **Lista** de compras (filtros por casa/período), com categoria (ícone e
  cor), responsável e meio de pagamento.
- **Novo gasto**: form com casa, responsável, categoria (selector visual),
  cartão/conta, forma de pagamento, data (competência derivada da data,
  editável), parcelas. Pode vincular a uma despesa fixa (aí herda o meio
  padrão do contrato).
- **Detalhe/edição** de uma compra, com rateio por pagadores quando a
  compra é exceção ao combinado.

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
- **Gerenciar casas** — lista, nova, detalhe (membros e papéis),
  **combinado de custeio** (percentuais por mês) e **acerto de contas**
  (saldo corrente entre as pessoas, extrato mensal, registrar
  pagamento/adiantamento).
- **Convidar** — gera convite para entrar numa casa.
- **Perfil** — dados da pessoa, fuso horário.
- **Administração** — só para admin do sistema: gestão dos catálogos
  (categorias, formas de pagamento, origens de receita).

## Fluxos que cruzam telas (os que importam para pensar UX)

1. **Lançar um gasto do dia a dia**: Gastos → Novo → salvar. Competência
   default deriva da data escolhida.
2. **Mês a mês das fixas**: Mais → Despesas fixas → status mostra o que
   falta → "registrar pagamento" cria a compra vinculada ao contrato → o
   status vira "em dia". Se não vai acontecer no mês: "justificar".
3. **Reajuste de contrato**: Despesas/Receitas fixas → contrato →
   Reajuste → informa valor novo + a partir de quando. Uma ação só.
4. **Acerto entre pessoas** (casa compartilhada): Mais → Casas → casa →
   Acerto → vê quem deve quanto → registra o pagamento/adiantamento
   quando a transferência acontece.
5. **Onboarding de um familiar**: quem convida gera o convite em Mais →
   Convidar; quem entra cadastra-se pelo link e já cai na casa certa.

## O que a tela NÃO faz (por design)

- Não edita totais nem "fecha" mês na mão — resumos são todos derivados.
- Não apaga nada — contratos encerram, cadastros desativam.
- Não mistura casas em nenhuma visão.
- Reembolso não vira receita — vive só no acerto.
