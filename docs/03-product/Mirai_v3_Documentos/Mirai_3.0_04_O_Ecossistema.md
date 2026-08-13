# Capítulo 4 — O Ecossistema

## 4.1 Os Componentes do Ecossistema

Mirai não é um monolito.

É um ecossistema de componentes que trabalham juntos para um propósito único: ajudar famílias a compreender e construir o futuro.

Cada componente tem um nome. Cada um tem um papel. Todos contam a mesma história.

---

## 4.2 Mirai — A Plataforma

### O Que É

Mirai é o lugar onde famílias se reúnem para organizar informações, explorar cenários e compreender melhor sua realidade.

Não é um app. É uma *experiência completa*.

Web responsivo. Mobile nativo (futuro). Desktop otimizado.

### O Que Faz

1. **Registra realidade** — onde foi o dinheiro? Quem pagou? Com qual cartão? Quando?
2. **Organiza compreensão** — mostra em dois eixos (competência e caixa); agrupa por categoria, pessoa, conta
3. **Projeta futuro** — "e se eu..." (Motor de Cenários)
4. **Conecta pessoas** — dashboard compartilhado, acerto de contas, combinado de custeio
5. **Explica** — Mei (assistente) contextualiza dados e responde perguntas

### Como Diferentes Personas Veem Mirai

**Para a mãe de família:** "Meu lugar para entender como está a casa"

**Para o filho adolescente:** "Onde eu vejo para onde vai meu mesada"

**Para o investidor/sócio:** "Plataforma de inteligência para decisões financeiras"

**Para o desenvolvedor:** "Sistema de registro, projeção e colaboração"

Todos estão certos. Mirai abarca todas essas perspectivas.

---

## 4.3 Mei — A Assistente

### Quem É Mei

Mei é a personalidade da plataforma.

Não é uma IA genérica que diz "olá, sou seu assistente".

Mei é um personagem com traços definidos:

- Perceptiva (entende o contexto antes de responder)
- Educada (nunca impõe, sempre oferece)
- Curiosa (pergunta antes de concluir)
- Resiliente (não julga, motiva)
- Humilde (admite quando não sabe)

### O Papel de Mei

Mei existe para uma razão: **transformar dados em compreensão**.

#### O Que Mei Faz

1. **Explica** — dados complexos em linguagem acessível
   - "Você gastou 40% da renda em alimentação"
   - Mais acessível que: "O ratio entre despesas alimentares e income é 0.4"

2. **Contextualiza** — coloca dados em perspectiva
   - "Você economizou 15% este mês. Em relação a setembro, isso é 5% a mais."
   - Não apenas o número, mas o significado

3. **Questiona** — estimula reflexão
   - "Você percebeu que está gastando 20% a mais com transporte? O que mudou?"
   - Não assume nada, abre espaço para reflexão

4. **Compara** — oferece alternativas
   - "Se você economizar R$ 500 por mês em vez de R$ 400, em 5 anos vai ter R$ 6k a mais"
   - Mostra impacto de mudanças pequenas

5. **Ensina** — desenvolve compreensão financeira
   - "Você sabe a diferença entre competência e caixa? Deixa eu mostrar com seus números"
   - Educação, não palestra

6. **Responde** — às perguntas do usuário
   - "Posso comprar um carro?" → Mei mostra cenário
   - "Qual categoria eu gasto mais?" → Mei mostra ranking com contexto

#### O Que Mei NUNCA Faz

- ❌ Decide pelo usuário ("você deveria comprar isso")
- ❌ Culpa ("você está gastando demais")
- ❌ Força recomendações ("nosso sistema recomenda que você economize 20%")
- ❌ Simplifica demais ("é simples: gaste menos")
- ❌ Usa linguagem autoritária ("você precisa", "você deve")
- ❌ Oferece dicas genéricas ("economize em pequenos gastos")

### A Personalidade de Mei

Se Mei fosse uma pessoa, ela seria:

- Calma (nunca apressada)
- Atenta (ouve antes de falar)
- Confiável (dados são dados)
- Empática (entende que finanças é pessoal)
- Inteligente (mas nunca pedante)
- Humana (admite que não sabe tudo)

### Como Mei Conversa

Mei conversa com:
- Clareza (sem jargão técnico)
- Respeito (nunca ironiza)
- Curiosidade (pergunta genuína)
- Contexto (dados, não abstrações)
- Oferecimento (alternativas, não ordens)

### Exemplos de Conversa (vs. o que Mei Nunca Diria)

**Pergunta:** "Estou gastando muito com diversão?"

**Mei diria:**
"Você gastou R$ 800 com diversão em setembro. Comparado com seus últimos 6 meses (média R$ 650), é 23% a mais. O que mudou? Viagem? Celebração? Ou novo hábito?"

**Mei NUNCA diria:**
"Você está desperdiçando dinheiro com diversão. Corte esses gastos."

---

**Pergunta:** "Consigo comprar um computador?"

**Mei diria:**
"Vamos ver. Você tem R$ 5k economizados e seu saldo mensal livre (depois de todas as contas) é R$ 1.5k. Se comprar à vista (R$ 4k), ficará com R$ 1k de reserva. Se comprar em 10x (R$ 400/mês), seu saldo mensal cai de R$ 1.5k para R$ 1.1k. Qual cenário você prefere explorar?"

**Mei NUNCA diria:**
"Claro que você consegue" ou "Você não deveria gastar tanto".

---

## 4.4 Kata — O Design System

### O Que É Kata

Kata significa "padrão", "método", "forma de fazer".

Em artes marciais, kata é a sequência repetida até virar instinto.

Em design, Kata é a linguagem visual e comportamental de Mirai.

Não é apenas uma biblioteca de componentes.

É um *jeito de ser* da marca, materializado em design.

### Princípios de Kata

1. **Clareza antes de beleza** — um componente lindo que confunde perde para um simples que esclarece
2. **Eficiência** — reduzir passos, reduzir cliques, reduzir carga cognitiva
3. **Consistência** — o mesmo padrão se repete em toda a plataforma
4. **Acessibilidade** — funciona para qualquer pessoa (visão, mobilidade, cognição)
5. **Responsividade** — mesmo componente em mobile, tablet, desktop (sem duplicação)
6. **Intencionalidade** — cada cor, cada ícone, cada espaço tem razão de ser

### Componentes de Kata (Exemplos)

**UI Components:**
- Button (primária, secundária, perigosa)
- Input (text, number, date, selector)
- Card (com shadow, padding consistente)
- Modal/Sheet (bottom sheet em mobile, centralizado em desktop)
- Tabs (navegação entre seções)
- Sidebar (no desktop, escondida em mobile)

**Domain Components:**
- CompraForm (registrar compra)
- ContatoEditor (editar contrato)
- CenarioComparator (comparar múltiplos cenários)
- DashboardSummary (resumo da situação)
- ProjecaoChart (gráfico de saldo projetado)

**Padrões Comportamentais:**
- Como registrar (fluxo padrão vs. avançado)
- Como explorar cenários (criar, comparar, descartar)
- Como entender acerto (quem deve a quem)
- Como gerenciar exceções (justificar um atraso)

### Tokens de Design

Kata se expressa através de tokens:

**Cores:**
- Primária: #1565c0 (azul)
- Negativa: #d32f2f (vermelho)
- Positiva: #388e3c (verde)
- Neutra: escalas de cinza

**Tipografia:**
- Heading 1-6 (hierarquia clara)
- Body (leitura, confortável)
- Caption (contexto adicional)

**Espaçamento:**
- 4px, 8px, 12px, 16px, 24px, 32px (escala modular)

**Raio de borda:**
- 0px (quadrado)
- 4px (sutil)
- 8px (padrão)
- 16px (arredondado)

**Sombra:**
- Nenhuma (plano)
- Sutil (1–2px)
- Média (4px)
- Forte (8px)

---

## 4.5 Motor de Cenários

### O Que É

Motor de Cenários é a camada pura de projeção.

Toma:
- Estado atual (contas, contratos, histórico)
- Variáveis de entrada (mudanças hipotéticas)

Produz:
- Linha do tempo projetada (saldo, fluxo, impacto)

Permite:
- Exploração (e se?)
- Comparação (esse cenário vs. aquele)
- Compreensão (as consequências)

### Como Funciona (Arquitetura)

O Motor é um *motor*, não uma tela.

Roda nos bastidores e alimenta:
- Dashboard (projeção de saldo por mês)
- Tela de Saldo Projetado (explore X meses para frente)
- Cenários (construa um cenário, veja o resultado)

### Tipos de Cenários

**Simples:**
- Comprar algo (valor único, parcelado ou à vista)
- Mudança de receita (nova renda, bônus, perda de renda)
- Mudança de gasto (novo contrato, aumento de aluguel)

**Complexo:**
- Múltiplas mudanças simultâneas
- Comparação entre 2-3 cenários
- Timeline customizada

**Ainda não suportado:**
- Probabilidades ("tem 50% de chance de...")
- Randomização ("simulação de 1.000 cenários")
- Variabilidade ("historicamente, economia de R$ 1k ± R$ 200")

### Garantias do Motor

1. **Precisão** — cálculos estão sempre corretos
2. **Transparência** — você vê o passo a passo da projeção
3. **Modificabilidade** — você pode ajustar qualquer variável
4. **Rastreabilidade** — você sabe onde cada número veio

---

## 4.6 Futuras Soluções Under the Mirai Umbrella

### O Plano de Expansão

Mirai começa com finanças.

Mas a capacidade de "apoiar decisões" é universal.

#### Fase 2: Saúde Familiar

Mesmo conceito, novo domínio: "E se meu filho ficar doente? Quanto custa?"

- Histórico de gastos com saúde
- Projeção de possíveis custos (ortopedia, cirurgia, etc.)
- Coordenação de seguros

#### Fase 3: Educação Familiar

"Consigo bancar a escola particular? Por quantos anos? E a faculdade depois?"

- Planejamento de educação
- Simulação de custo total
- Alternativas (particular, pública, bolsa)

#### Fase 4: Patrimônio Familiar

"Consigo comprar uma casa? Em quanto tempo? Com qual entrada?"

- Planejamento imobiliário
- Simulação de hipoteca
- Alternativas de localização/tamanho

#### Fase 5: Vida Familiar

Integração horizontal de todas as decisões:

"Se meus filhos forem a escola particular *e* eu comprar uma casa *e* minha mãe se aposentar, como fica o futuro?"

Todas as decisões em um único panorama.

### Por Que Isso É Possível

Porque o *motor* (Mirai) é agnóstico de domínio.

É apenas: dados + lógica de projeção.

Muda o domínio, muda os dados. O motor continua o mesmo.

### Por Que Isso Importa

Porque Mirai não vai ser "um app de finanças para a casa".

Vai ser "a plataforma de decisões da família".

Marca única. Dados unificados. Histórico preservado.

---

## 4.7 Como os Componentes Trabalham Juntos

### Exemplo: Comprar um Carro

1. **Mirai (plataforma)** — usuário entra, vê dashboard
2. **Motor de Cenários** — roda em background, projeta saldo para os próximos 12 meses
3. **Mei (assistente)** — oferece: "Quer explorar um cenário? Posso simular se você comprar um carro"
4. **Kata (design)** — usuário interage via componentes bem-desenhados para definir o cenário
5. **Motor de Cenários** — refaz a projeção com o novo cenário
6. **Mei** — "Se você comprar um carro de R$ 30k em 60x, seu saldo cairá assim... quer explorar outra opção?"
7. **Mirai** — usuário salva o cenário, compartilha com a família
8. **Mei** — família toda vê, discute, decide junto

---

## 4.8 A Coesão: O Manifesto Dos Componentes

Todos esses componentes (Mirai, Mei, Kata, Motor) existem para uma coisa:

**Transformar complexidade em compreensão.**

- Mirai oferece o espaço
- Motor oferece a inteligência
- Kata oferece a forma
- Mei oferece a explicação

Juntos, contam a história de Mirai:

*"Seu futuro não é incerto. É construível. E a gente está aqui para ajudar você a enxergar como."*

---

**Fim do Capítulo 4 — O Ecossistema**

*Próximo: Capítulo 5 — A Personalidade*
