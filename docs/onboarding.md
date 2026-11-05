# Onboarding e ajuda para novos usuários

> Decisão de produto registrada em 2026-11-01.
> Este documento descreve a experiência recomendada para o primeiro uso e
> separa o que existe hoje do que deve ser implementado.

## Decisão resumida

O produto deve usar as duas estratégias, em camadas:

1. **Wizard curto de primeiro uso** para levar a pessoa até o primeiro
   resultado útil.
2. **Ajuda contextual e central "Como usar"** para explicar conceitos quando
   eles aparecem e permitir consulta posterior.

O wizard não deve ser um treinamento longo nem bloquear o uso do sistema.
Etapas opcionais podem ser puladas e retomadas depois.

O onboarding será controlado por pessoa, enquanto o checklist será calculado
com base na casa principal escolhida pelo usuário. O wizard pode ser aberto
automaticamente no primeiro uso, mas também deve estar sempre disponível para
revisão pela central de ajuda.

## Problema que a solução resolve

O fluxo atual permite cadastro, criação ou entrada em uma casa, configuração
financeira, lançamento de gastos, dashboard, relatórios e acerto de contas.
Porém, uma pessoa nova precisa descobrir sozinha a ordem dessas ações e o
significado de conceitos como competência, caixa, custeio, pagador,
desembolsado e acerto.

O maior risco está nos estados vazios: informar que não existem dados, sem
deixar claro qual é o próximo passo. O onboarding deve transformar esses
estados em caminhos orientados, sem misturar dados entre casas nem criar
dados fictícios sem consentimento.

## Percurso recomendado

### Usuário individual

```text
Cadastro/login
→ criar casa pessoal
→ registrar primeiro gasto
→ visualizar o dashboard
→ configurar conta/cartão e demais recursos depois
```

### Responsável por uma casa compartilhada

```text
Cadastro/login
→ criar casa
→ adicionar ou convidar membros
→ configurar contas/cartões
→ definir combinado de custeio
→ registrar gastos
→ consultar o acerto de contas
```

### Usuário convidado

```text
Abrir convite
→ criar ou vincular conta
→ aceitar entrada na casa
→ receber explicação rápida da casa
→ consultar o dashboard
```

O usuário convidado não deve passar pelo fluxo de criação de casa.

## Wizard de primeiro uso

O wizard deve ser adaptado ao contexto da pessoa e ter progresso visível.
Também deve ser possível dispensá-lo, retomá-lo e reabri-lo em **Ajuda**.

### Etapa 1 — Como pretende usar?

Opções sugeridas:

- controlar a própria vida financeira;
- compartilhar uma casa;
- entrar em uma casa por convite.

Essa escolha orienta a sequência, mas não deve impedir mudanças posteriores.

### Etapa 2 — Criar ou entrar em uma casa

Para quem cria:

- solicitar o nome da casa;
- aceitar nomes simples, como "Minha casa" ou "Casa da família".

Para quem recebe convite:

- mostrar a casa e o papel que será assumido;
- pedir confirmação antes de entrar.

### Etapa 3 — Configurar o essencial

O checklist inicial deve mostrar o progresso sem exigir a conclusão de tudo:

```text
✓ Casa criada
✓ Categorias disponíveis
□ Conta ou cartão
□ Primeiro gasto
□ Combinado de custeio — opcional
```

O combinado de custeio não deve ser obrigatório para uso individual.

Categorias são um catálogo global do sistema, administrado por admins do
sistema e compartilhado entre usuários e casas. Portanto, não existe uma
etapa de criação ou cópia de categorias por usuário. O onboarding apenas
consome o catálogo global existente, incluindo seus ícones e cores.

### Etapa 4 — Registrar o primeiro gasto

O wizard deve levar à tela de novo gasto e explicar brevemente:

- quem é o responsável;
- qual categoria usar;
- qual conta ou cartão foi usado;
- como funciona o parcelamento.

O usuário deve conseguir começar com a configuração mínima disponível.

### Etapa 5 — Mostrar o resultado

Depois do primeiro gasto, mostrar o impacto no dashboard e oferecer:

- registrar outro gasto;
- configurar receita;
- configurar combinado;
- explorar o aplicativo.

## Ajuda contextual

Cada conceito deve ser explicado junto do campo ou da ação, com texto curto.
Sugestões de conteúdo:

- **Caixa**: mostra quando o dinheiro realmente sai da conta ou da fatura.
- **Competência**: mostra o mês ao qual a compra pertence, mesmo que o
  pagamento aconteça depois.
- **Combinado de custeio**: define quanto cada pessoa deve participar das
  despesas da casa.
- **Acerto de contas**: compara quanto cada pessoa deveria pagar com quanto
  realmente desembolsou.
- **Acerto irreversível**: confirma um retrato permanente do acerto atual;
  depois, o relatório não pode ser cancelado.

Também deve existir uma área permanente:

```text
Mais → Ajuda e como usar
```

Conteúdos iniciais:

- primeiros passos;
- como registrar um gasto;
- diferença entre caixa e competência;
- como funciona o combinado;
- como funciona o acerto;
- como gerar relatórios;
- como convidar alguém.

## Estados vazios orientados

Estados sem dados devem combinar explicação breve, próximo passo e ação
principal. Exemplos:

- sem casa: **Criar uma casa** ou **Aceitar convite**;
- sem gastos: **Registrar primeiro gasto**;
- sem conta/cartão: **Adicionar conta ou cartão**;
- sem combinado: explicar que é opcional e oferecer **Configurar combinado**;
- sem acertos: explicar quando um acerto passa a existir e oferecer voltar
  para a casa.

O texto não deve presumir que a pessoa conhece o domínio financeiro.

## Regras de experiência

- permitir pular etapas opcionais;
- persistir a etapa concluída e o status de dispensado;
- não repetir etapas já concluídas;
- permitir retomar depois;
- oferecer "Rever primeiros passos" na central de ajuda, mesmo depois de
  concluído ou dispensado;
- manter o mesmo fluxo de negócio na web e no mobile;
- usar exemplos com valores fictícios somente quando identificados como
  exemplos;
- não criar dados de demonstração automaticamente sem consentimento;
- destacar o ambiente de homologação quando usado no TCC, usando uma variável
  explícita de ambiente;
- permitir que o usuário escolha a casa principal em Configurações/Perfil;
- usar a casa principal para o dashboard e para o checklist, sem impedir a
  navegação por outras casas;
- não bloquear o uso até conta, cartão, categoria ou combinado estarem
  configurados;
- respeitar a separação de dados entre casas.

## Fora do escopo inicial

Não implementar, na primeira versão:

- tutorial longo com tour por todas as telas;
- bloqueio do aplicativo até completar o checklist;
- criação automática de compras, contas ou pessoas fictícias;
- explicação de todos os recursos antes do primeiro lançamento.

## Plano de implementação

### Fase 1 — orientação de baixo risco

- melhorar estados vazios com ações claras;
- adicionar ajuda contextual nos conceitos principais;
- criar a página "Como usar";
- adicionar checklist no dashboard.
- adicionar a configuração de casa principal no perfil;
- exibir o indicador explícito de homologação;

### Fase 2 — onboarding persistido

- criar estado de onboarding da pessoa;
- adicionar a casa principal à configuração da pessoa;
- implementar wizard adaptado ao perfil;
- persistir etapa concluída e dispensada;
- permitir retomar e reabrir o wizard.

### Fase 3 — orientação avançada

- checklist específico para casas compartilhadas;
- ajuda detalhada para acerto de contas e relatórios persistentes;
- indicador visual do ambiente de homologação;
- instrumentação opcional para medir conclusão e abandono.

## Critérios de aceite

- uma pessoa nova consegue criar ou entrar em uma casa sem conhecer o
  sistema;
- uma pessoa nova consegue registrar o primeiro gasto sem configurar todos os
  recursos avançados;
- cada estado vazio relevante oferece uma ação de próximo passo;
- os conceitos de caixa, competência, custeio e acerto têm ajuda acessível;
- o wizard pode ser pulado, retomado e reaberto;
- usuário convidado não é conduzido para criar uma casa;
- nenhuma etapa mistura dados de casas diferentes;
- o fluxo não altera a regra de confirmação irreversível dos acertos;
- a documentação e a interface distinguem claramente recursos existentes de
  recursos planejados.

## Decisões técnicas

### Estado do onboarding

O estado persistido pertence à pessoa, não à casa. Deve registrar, no mínimo:

- perfil escolhido;
- etapa atual;
- status (`not_started`, `in_progress`, `dismissed` ou `completed`);
- data de dispensa, quando houver;
- data de conclusão, quando houver.

O checklist não será armazenado como uma cópia independente. Ele será
calculado a partir dos dados reais da casa principal, evitando divergência
quando o usuário criar ou remover recursos fora do wizard.

### Casa principal

A pessoa poderá selecionar sua casa principal nas configurações. Essa casa:

- deve pertencer ao usuário;
- será usada como contexto padrão do dashboard e do checklist;
- não restringirá o acesso às demais casas;
- não poderá ser definida como uma casa que o usuário não participa.

Quando houver apenas uma casa, ela poderá ser selecionada automaticamente.
Quando a casa principal for removida ou desativada, o usuário deverá escolher
outra casa antes de usar o contexto padrão.

### Categorias

As categorias são globais no sistema:

- não possuem `pessoa_id` ou `casa_id`;
- têm nome único globalmente;
- são visíveis para qualquer usuário autenticado;
- são criadas, alteradas e ativadas por admins do sistema;
- seus ícones e cores pertencem ao catálogo global.

O onboarding não criará, copiará ou persistirá categorias. O primeiro gasto
usará diretamente o catálogo global disponível.

### Ambiente

O indicador de homologação será controlado por variável explícita, como
`EXPO_PUBLIC_APP_ENV=homologacao`. A interface não deve inferir o ambiente
apenas pela URL da API.

### Superfícies técnicas previstas

No backend:

- migration para a casa principal da pessoa;
- tabela ou estrutura própria para o estado do onboarding;
- endpoints autenticados para consultar e atualizar esses dados;
- validação de pertencimento da casa principal;
- documentação OpenAPI correspondente.

No frontend:

- service de onboarding;
- tipos do estado e da casa principal;
- contexto ou hook centralizado;
- rota do wizard;
- central permanente de ajuda;
- checklist derivado;
- estados vazios reutilizáveis;
- indicador de ambiente;
- integração com web e mobile na mesma árvore de rotas.

Nenhuma dessas mudanças deve alterar o fluxo financeiro existente nem a regra
de confirmação irreversível dos acertos.
