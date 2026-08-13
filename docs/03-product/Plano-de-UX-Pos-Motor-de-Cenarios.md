Plano de UX — Pós Motor de Cenários

Objetivo

Após a conclusão do Motor de Cenários, o desenvolvimento do Tenência entrará em uma nova fase.

Até este momento, o foco foi construir um domínio sólido e coerente.

A partir daqui, o foco deixa de ser criar funcionalidades e passa a ser tornar esse domínio simples, intuitivo e prazeroso de utilizar.

O objetivo desta etapa é reduzir o esforço cognitivo do usuário, aumentar a velocidade das tarefas frequentes e alinhar a experiência ao modelo mental das famílias.

⸻

Princípio

Entraremos em Feature Freeze.

Novas funcionalidades só serão adicionadas caso sejam motivadas por:

* entrevistas com usuários;
* testes de usabilidade;
* observação de uso real.

Ideias que surgirem durante esse período serão registradas no backlog, mas não implementadas imediatamente.

⸻

Objetivos da fase

Esta etapa deve responder três perguntas.

1. O usuário encontra facilmente o que procura?

Não avaliar se a funcionalidade existe.

Avaliar se ela é descoberta naturalmente.

Exemplo observado:

Como cadastrar um novo recebimento recorrente?

A funcionalidade existia.

A jornada não era evidente.

⸻

2. O usuário pensa pouco durante tarefas frequentes?

As tarefas recorrentes devem exigir o menor esforço possível.

Exemplos:

* registrar pagamento;
* registrar recebimento;
* consultar projeção;
* lançar compra;
* consultar acerto entre pessoas.

⸻

3. O modelo interno está vazando para a interface?

O domínio utiliza conceitos como:

* contrato;
* reajuste;
* exceção;
* competência;
* caixa.

Esses conceitos podem continuar existindo internamente.

Entretanto, a interface deve priorizar a linguagem natural utilizada pelas famílias.

Exemplo:

Ao invés de:

Novo contrato de receita fixa

Avaliar:

Nova receita recorrente

ou

Receita que acontece todo mês

⸻

Mudança de abordagem

Até agora o produto foi organizado por telas.

A partir desta fase o produto será organizado por jornadas.

O foco deixa de ser:

* Dashboard
* Gastos
* Projeção
* Metas
* Mais

e passa a ser:

* Quero registrar uma compra.
* Quero pagar minhas contas.
* Quero cadastrar um novo salário.
* Quero dividir despesas.
* Quero saber se posso comprar.
* Quero entender para onde vai meu dinheiro.

As telas passam a ser consequência dessas jornadas.

⸻

Jornadas prioritárias

Jornada 1

Comecei um novo emprego.

Objetivo:

Cadastrar um novo recebimento recorrente.

Perguntas:

* Onde o usuário procuraria essa ação?
* Quantos passos existem?
* Existe algum momento de dúvida?
* A palavra utilizada faz sentido?

⸻

Jornada 2

Assinei uma nova despesa mensal.

Exemplos:

* academia;
* internet;
* streaming;
* escola.

Objetivo:

Cadastrar uma nova despesa recorrente.

⸻

Jornada 3

Paguei uma conta.

Objetivo:

Registrar o pagamento em poucos segundos.

Avaliar:

* quantidade de cliques;
* tempo;
* necessidade de navegar até o contrato.

⸻

Jornada 4

Recebi meu salário.

Objetivo:

Registrar o recebimento rapidamente.

⸻

Jornada 5

Uma despesa aumentou.

Exemplo:

O aluguel sofreu reajuste.

Objetivo:

Modificar o comportamento futuro sem receio de perder histórico.

⸻

Jornada 6

Quero saber se posso comprar.

Objetivo:

Executar uma simulação através do Motor de Cenários.

Avaliar:

* facilidade de acesso;
* compreensão do resultado;
* confiança na decisão.

⸻

Jornada 7

Preciso acertar contas com outra pessoa.

Objetivo:

Entender rapidamente:

* quem deve;
* quanto deve;
* registrar o acerto.

⸻

Revisão do vocabulário

Toda a interface será revisada.

Pergunta obrigatória para cada texto:

Essa frase foi escrita pensando no domínio ou pensando no usuário?

Sempre que possível utilizar linguagem baseada em acontecimentos da vida.

Exemplos:

* Novo salário.
* Nova conta mensal.
* Registrar pagamento.
* Registrar recebimento.
* Alterar valor.
* Encerrar recorrência.

Evitar expor conceitos internos quando não agregarem valor.

⸻

Revisão da arquitetura da navegação

Avaliar se as funcionalidades estão agrupadas de acordo com a forma como o usuário pensa.

Exemplo observado durante uso real:

A necessidade era:

“Cadastrar um novo recebimento recorrente.”

O caminho esperado pela usuária não ficou evidente.

Esse tipo de atrito deverá ser registrado para todas as jornadas.

⸻

Método de trabalho

Cada jornada será analisada utilizando a seguinte estrutura.

Situação

O que aconteceu na vida da pessoa?

⸻

Objetivo

O que ela deseja fazer?

⸻

Caminho esperado

Onde ela naturalmente procuraria essa funcionalidade?

⸻

Caminho atual

Quais telas percorre hoje?

⸻

Pontos de atrito

Em quais momentos surge dúvida?

⸻

Hipóteses de melhoria

Quais mudanças podem reduzir o esforço?

⸻

Validação

Testar novamente após a alteração.

⸻

Métricas

Durante esta fase serão observados:

* quantidade de cliques;
* tempo para concluir a tarefa;
* número de dúvidas;
* número de retornos entre telas;
* necessidade de ajuda;
* erros de navegação.

⸻

Resultado esperado

Ao final desta fase, o Tenência deverá transmitir a sensação de simplicidade mesmo possuindo um domínio complexo.

O usuário não deverá aprender como o sistema funciona.

O sistema deverá acompanhar a forma como as famílias naturalmente pensam sobre suas finanças.

O sucesso desta etapa será medido pela capacidade do usuário concluir suas tarefas sem precisar entender conceitos internos como contratos, versionamento, exceções ou projeções.