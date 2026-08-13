# Capítulo 1 — A História

## 1.1 Antes: A Planilha (2024)

A história começa com um problema real, sem dramatização.

Uma família compartilha casa. Não a casa de uma pessoa. A *casa* como entidade.

Três irmãs. Uma casa alugada. Responsabilidades compartilhadas: quem paga o aluguel, quem paga luz, quem faz compras, quem provê a maioria dos recursos?

A resposta é sempre: "depende do mês".

Alguns meses, uma irmã está sem renda. Outra recebeu um bônus. Uma está desempregada.

Precisam responder perguntas que são simples em aparência, mas complexas na prática:

- Quanto cada uma deveria gastar *este mês*?
- Quanto já gastou?
- Quanto falta do orçamento de cada uma?
- Quem deve quanto a quem? E quando?

A solução inicial: uma planilha do Excel, compartilhada no Google Drive.

#### Por que a planilha não bastava

A planilha *funciona*, mas é exaustiva:

- A cada gasto, alguém precisa abrir, atualizar, corrigir fórmulas que quebram
- Quando alguém pergunta "e se eu comprar isso?", criam uma cópia e simulam manualmente
- Histórico se perde (qual era o gasto em março? Tem que vasculhar pastas antigas)
- Colaboração é caótica (versões conflitantes, alguém apaga sem querer)
- Discordâncias: duas pessoas calculando o mesmo acerto chegam a números diferentes

A planilha mostrava o passado de forma imprecisa e nunca conseguia responder sobre o futuro.

#### A percepção inicial do problema

A primeira interpretação foi: "Precisamos de um app para rastrear gastos compartilhados."

Essa interpretação levou ao MVP.

Mas não era a interpretação *verdadeira*.

O problema real era mais profundo: **famílias não têm ferramentas para entender decisões financeiras compartilhadas**.

---

## 1.2 O MVP: Se Controle (2024-2025)

Com essa interpretação inicial, nasceu **Se Controle**.

#### Por que esse nome

"Se Controle" é um imperativo. Ordem para si mesmo. "Controla seus gastos, você é responsável por isso."

Parecia óbvio na época. Aplicativo de finanças = controlar gastos = "Se Controle".

A semântica era: vigilância pessoal. A pessoa precisa se policiar. Seu gasto é o vilão da história.

#### O que o MVP construiu

- Registro de receitas e despesas
- Categorização de gastos (alimentação, saúde, diversão, etc.)
- Visualização de quanto entrou e quanto saiu
- Permitir múltiplas pessoas atualizarem os mesmos dados
- Noção básica de "casas" (a casa é o container dos dados compartilhados)

Funcionou para o problema técnico identificado: *organizar gastos em tempo real*.

Mas o produto carregava uma semântica que não era verdadeira para o caso real.

#### O ponto de virada

A primeira métrica importante não foi "número de usuários".

Foi: **"O usuário consegue responder 'posso comprar isso agora?'"**

A resposta era não.

O app mostrava quanto tinha sido gasto e quanto sobrava de orçamento. Mas não conseguia responder o que importava: "Se eu fizer essa compra, o que acontece com o futuro?"

Essa pergunta não podia ser respondida por um app de registro. Precisava de um app de *projeção*.

---

## 1.3 A Primeira Evolução: Tenência (2025)

Com o tempo, uma pergunta surgia naturalmente entre usuários:

"Meu gasto foi de R$ 100. Paguei à vista. Por que o saldo projetado de setembro caiu mais do que o de junho?"

A resposta: porque em junho você está vendo uma parcela de uma compra que fez em maio. Em setembro, a mesma parcela. Mas o saldo mensal de agosto caiu.

Ou seja: **o mesmo gasto tem duas respostas legítimas:**

- **Competência** (compromisso): quanto está comprometido *este mês*? (100% da compra)
- **Caixa** (fluxo): quanto sai do bolso *este mês*? (uma parcela de 10, se for parcelado)

Exemplo real:
- Compra: geladeira por R$ 3.000, parcelada em 10x (R$ 300/mês)
- Competência: R$ 3.000 no mês da decisão (você se comprometeu com R$ 3.000)
- Caixa: R$ 300 em cada um dos 10 meses (R$ 300 efetivamente sai do bolso cada mês)

A mesma compra, duas perspectivas válidas. A familia precisa entender *ambas*.

Esse foi o primeiro insight que mudou a arquitetura do produto.

#### Por que Tenência

Com a evolução do domínio, ficou claro que a semântica de "controle" era inadequada.

"Se Controle" pressupunha vigilância, restrição, uma pessoa policiando a si mesma.

A realidade era diferente: era uma *família* tentando compreender — com sabedoria, com cuidado — o próprio futuro.

Tenência (palavra brasileira que significa juízo, prudência, tino para cuidar do que se tem) tornou-se o nome natural.

"Tenência" não é imperativo. É substantivo. "A tenência de um patrimônio familiar."

A semântica mudou de: "você precisa se controlar"  
Para: "vamos compreender junto"

#### O que Tenência construiu

- Dois eixos de leitura (competência e caixa) — a mesma pergunta, duas respostas
- Noção de contratos (despesas fixas e receitas fixas) — o que se repete
- Conceito de reajuste — quando um contrato muda, cria uma nova versão (histórico preservado)
- Acerto de contas entre pessoas — quem deve quanto a quem
- Dashboard como mapa, não tribunal — mostra situação, não julga
- Combinado de custeio — cada pessoa pode ter % diferente de responsabilidade
- Exceções justificadas — "a diarista não veio, é exceção", não atraso

#### A descoberta do verdadeiro problema

No meio do desenvolvimento de Tenência, uma pergunta que parecia simples revelou a profundidade:

"Se eu perder este emprego, a gente consegue se manter por quanto tempo?"

Ou:

"Se meu pai se aposenta, como fica o orçamento?"

Ou:

"Consigo comprar uma casa nos próximos 5 anos?"

O app de registro não conseguia responder nenhuma dessas.

Era claro agora: o produto *não era sobre organizar o passado*. Era sobre *compreender o futuro*.

---

## 1.4 A Descoberta: O Motor de Cenários (2025-2026)

A tecnologia que resolve a pergunta "E se?" é chamada de **Motor de Cenários**.

Não é um nome comum em produtos de consumer. É mais comum em ferramentas de planejamento empresarial (VBA, modelos de projeção corporativa).

Mas a lógica é a mesma: tomar o estado atual e projetar consequências de mudanças hipotéticas.

#### Como funciona (em linguagem simples)

Estado real:
- Contas: duas contas (uma com R$ 10k, outra com R$ 3k)
- Receitas fixas: salário de R$ 5k
- Despesas fixas: aluguel R$ 2k, serviços R$ 500
- Histórico de compras (padrão de consumo)

Cenário: "E se eu comprar um carro por R$ 30k em 60 meses?"

Motor faz:
1. Subtrai o valor inicial (R$ 30k) das contas
2. Adiciona a parcela do financiamento (R$ 500/mês) às despesas
3. Projeta para frente (12 meses, 24 meses, 5 anos)
4. Mostra o resultado: "Seu saldo vai para X; em 5 anos, vai estar em Y"

#### Por que muda tudo

Antes: "Posso comprar o carro?" → app diz "você tem R$ 13k" → resposta: "não sei"

Depois: "Posso comprar o carro?" → app mostra a projeção para 5 anos → você vê que continua com saldo positivo, e em quanto tempo fica sem dívida → resposta: "sim, posso, e aqui é como fica"

O motor não decide por você. **Torna as consequências visíveis**.

#### A mudança de mentalidade

O Motor de Cenários marcou a virada de mentalidade interna:

- Não é um app de finanças que projeta
- É uma plataforma de *apoio à decisão* que usa finanças como primeiro domínio

Porque a decisão "comprar um carro" não é só financeira. É vida (transporte para o trabalho), é família (mobilidade para atividades), é futuro (compromisso de renda).

O app começou a ser visto como uma ferramenta de *compreensão*, não de *restrição*.

---

## 1.5 A Transformação: Mirai (2026)

Com o Motor pronto e a arquitetura clara, ficou evidente que o produto havia evoluído radicalmente.

Não era mais "um app de finanças para a casa".  
Não era "um app que projeta".

Era "uma plataforma de apoio à decisão familiar".

#### Por que o nome precisava mudar novamente

Tenência ainda carregava a semântica de "finanças" e "patrimônio".

O produto estava começando a responder perguntas que iam além:

- Educação: "Consigo bancar a escola particular?"
- Saúde: "Quanto preciso economizar para emergências?"
- Carreira: "Qual é o impacto real de trabalhar remoto?"
- Vida: "Em quanto tempo consigo comprar uma casa?"

Essas perguntas têm componente financeiro, mas não são *sobre* finanças.

São sobre *futuro*.

#### Por que Mirai

Mirai (未来) significa "futuro" em japonês.

O nome foi escolhido não só pelo significado literal, mas pelo que representa filosoficamente:

**A Mirai não acredita que o futuro possa ser previsto.**

**Acredita que ele pode ser compreendido, planejado e construído.**

Cada decisão tomada hoje modifica o amanhã.

Comprar o carro hoje afeta os próximos 5 anos.

Matricular a filha na escola particular hoje afeta a renda disponível pelos próximos 14 anos.

Aposentar-se aos 60 hoje afeta se você consegue viajar aos 70.

Mirai existe para tornar essas consequências visíveis *antes da escolha*.

#### O significado das três marcas em sequência

| Nome | Período | Semântica | O que promete |
|---|---|---|---|
| Se Controle | MVP inicial | Vigilância pessoal | "Controle seus gastos" |
| Tenência | Primeiro amadurecimento | Sabedoria compartilhada | "Compreendamos juntos" |
| Mirai | Visão expandida | Construção do futuro | "Vejam as consequências; decidam com clareza" |

Não é um erro que foi corrigido.  
É uma escalada de compreensão.

Se Controle = "Você controla" (você é responsável por se policiar)  
Tenência = "A casa controla junto" (a família entende junto)  
Mirai = "A família constrói o futuro" (as decisões de hoje formam amanhã)

---

## 1.6 A Jornada Técnica Paralela

Enquanto a marca evoluía, a tecnologia acompanhava:

### 2024 — MVP mobile (Expo)
- React Native com Expo
- Backend básico em Express
- Supabase para auth
- Banco de dados PostgreSQL
- iOS (TestFlight) e Android (beta EAS)

### 2025 — Expansão para web
- Expo web (mesmo código, múltiplos alvos)
- Deploy em Vercel
- Web app responsivo (início do suporte a desktop)
- Layout que alterna mobile (tabs) × desktop (sidebar)

### 2025-2026 — Motor de Cenários
- Camada de projeção desacoplada (não é interface)
- Cálculos de linha do tempo projetada
- Integração com Dashboard
- Tela de Saldo Projetado

### 2026 — Visão web em amadurecimento
- Redesenho de telas (tabelas, não cards)
- Design System (Kata) em construção
- Master-detail para listas (painel duplo em desktop)
- Suporte completo a tablet e responsividade

---

## 1.7 O Que Não Mudou

Enquanto o nome e a estratégia evoluíram, alguns princípios permaneceram:

1. **Casa é a unidade central** — uma pessoa pode viver em várias casas (a sua, a dos pais), mas as casas nunca se misturam. O isolamento de dados é lei.

2. **Pessoa ≠ usuário** — pessoas existem sem login. Uma criança, uma avó, podem ser parte da casa sem ter app instalado. O sistema registra quem é o dono do fato, separado de quem registrou.

3. **Catálogos curados** — categorias, formas de pagamento, origens de receita não são customizadas pelos usuários. São gerenciados centralmente. A família consome o que já existe.

4. **Dois eixos sempre** — competência e caixa. Duas respostas válidas para a mesma pergunta. Nunca escolhemos entre uma ou outra; sempre mostramos as duas.

5. **O futuro é construído, não previsto** — não oferecemos respostas prontas. Oferecemos cenários. A decisão pertence ao usuário.

---

## 1.8 Os Passos Que Virão

A história de Mirai não termina com o rebrand.

Começa.

Os próximos passos documentados (Visão de Domínio, Plano de UX Pós-Motor):

- Melhorar usabilidade (reduzir carga cognitiva)
- Expandir a linguagem (usar termos que as famílias usam, não jargão técnico)
- Aprimorar o Motor (cenários mais complexos, comparações entre múltiplos cenários)
- Introduzir Mei (assistente inteligente que explica cenários)
- Preparar expansão internacional (Mirai não é só Brasil)
- Construir o Design System (Kata) — a forma consistente de materializar a filosofia

Cada passo continua respondendo à mesma pergunta: **como ajudamos famílias a compreender e construir o próprio futuro?**

---

## 1.9 Reflexão Final: Por Que Essa Trajetória Importa

Alguns diriam que foi fácil rebrand duas vezes — é só mudar nome.

Mas cada mudança de nome refletia uma mudança profunda no que o produto *é*.

"Se Controle" era um app de finanças focado em vigilância.  
"Tenência" era um app de finanças focado em planejamento familiar.  
"Mirai" é uma plataforma de apoio à decisão com finanças como primeiro domínio.

Cada iteração descobriu algo sobre o problema que estava resolvendo.

E cada nova compreensão exigiu um nome que refletisse essa verdade.

Se tivéssemos mantido "Se Controle" e simplesmente adicionado novos features, teríamos um produto confuso. O nome dizia uma coisa; o produto fazia outra.

A história de Mirai mostra que **nomes importam porque refletem verdade sobre o que o produto é**.

Quando o nome e o produto se desalinham, algo precisa mudar.

No caso de Mirai, o que mudou foi o nome. Porque o produto havia crescido para algo maior.

---

**Fim do Capítulo 1 — A História**

*Próximo: Capítulo 2 — A Filosofia*
