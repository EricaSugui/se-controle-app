# Capítulo 7 — A Cultura

## 7.1 O Que É a Cultura de Mirai

Cultura é como a gente pensa e age quando ninguém está olhando.

Documentar cultura é risco: parece corporativo, superficial.

Mas é necessário — porque quando a equipe cresce, filosofia precisa estar *registrada*, não só no ar.

A cultura de Mirai tem um princípio raiz:

**"Autonomia e compreensão acima de tudo."**

Se você trabalha em Mirai, você acredita que pessoas podem compreender mais do que imaginam, e que compreensão leva a melhores decisões.

Essa crença afeta como você faz *tudo*:
- Como você escreve código (legível vs. otimizado)
- Como você desenha (simples vs. completo)
- Como você comunica (honesto vs. vendedor)
- Como você trabalha com outros (colaborativo vs. hierárquico)

---

## 7.2 Os Valores Operacionais de Mirai

### Valor 1: Honestidade

Honestidade significa: dados são dados.

Se o motor projeta que você vai quebrar em 6 meses, você vai saber disso.

Não vamos sugarcoat.

Não vamos desenhar gráfico que esconde a verdade.

Não vamos oferecer "possibilidades falsas" só para parecer esperançoso.

**Como isso afeta decisões:**
- Code review: "Esse código está confuso" (honestidade) > "Tá quase lá" (suavidade)
- Design: "Essa tela tem muita informação" (honestidade) > "É complexa, mas cabe tudo" (minimização)
- Comunicação: "Não sabemos fazer X" (honestidade) > "Estamos explorando X" (vaguidão)

### Valor 2: Humildade

Humildade significa: nós não sabemos tudo.

Esse app vai ter bugs.

Essa feature vai ter casos extremos que não pensamos.

Usuários vão usar de formas inesperadas.

Quando descobrirmos, a reação certa é: "Ótimo, aprendemos" — não "Como não vímos isso?"

**Como isso afeta decisões:**
- Code review: "Vamos testar esse cenário estranho" (humildade)
- Design: "Usuários novos podem achar confuso; vamos testar" (humildade)
- Roadmap: "Vamos desacelerar para consolidar antes de adicionar" (humildade)

### Valor 3: Impacto

Impacto significa: o que importa é se o usuário fica melhor ou não.

Não importa se foi seu código que mudou ou do colega.

Não importa se foi uma feature grande ou ajuste pequeno.

Importa se o usuário consegue tomar decisão melhor.

**Como isso afeta decisões:**
- Priorização: "Esse bug afeta decisão do usuário? Está feito hoje" (impacto)
- Design: "Essa interface bonita não ajuda compreensão; simplifica" (impacto)
- Comunicação: "Esse release note explica o impacto? Escreve de novo" (impacto)

### Valor 4: Autonomia

Autonomia significa: você toma decisão.

Não pedindo permissão para pequenos ajustes.

Não esperando consenso absoluto.

Mas também: você é responsável pelo resultado.

**Como isso afeta decisões:**
- Tarefas: você está acuado → "Que primeira coisa você faria?" e você decide
- Bloqueios: alguém discorda de você → "Quer que Fundadora decida?" → se não, vocês conversam até uma conversa boa ou experimental
- Erros: você errou → "Tudo bem, como a gente não faz isso novamente?"

---

## 7.3 Como Essas Culturas Influenciam Cada Área

### Produto

**Honestidade:** Não começamos a feature sem conversa com usuário. Dados batem ou não.

**Humildade:** MVP pequeno. Testamos antes de escalar.

**Impacto:** Pergunta é sempre "usuário vai conseguir tomar decisão melhor?" — não "feature é legal".

**Autonomia:** Product lead identifica feature, traz pro time, time debate, faz prototipo juntos.

### UX

**Honestidade:** Se a tela é confusa, dizemos que é confusa — mesmo que tenha sido nós que desenhamos.

**Humildade:** Testamos com usuário antes de enviar. Sempre ha algo que não vimos.

**Impacto:** Cada elemento tem razão de ser. Se não reduz carga cognitiva, sai.

**Autonomia:** UX designer tem veto em qualquer proposta de UI que nao siga Kata. Sem discutir.

### Design / Kata

**Honestidade:** "Esse componente tem 4 variações, é confuso" → simplifica para 2.

**Humildade:** Design System vai evoluir. Não prende em versão v1.0.

**Impacto:** Cada token existe porque resolve um problema. Sem tokens decorativos.

**Autonomia:** Designer UI tem autoridade sobre como aplicar Kata. Se aplicar errado, mostra precedente, não proibe.

### Engenharia

**Honestidade:** "Esse código é legacy e confuso" → refactor pequeno agora vs depois com dívida.

**Humildade:** "Não sei como fazer isso performant" → procura ajuda, experimenta, aprende.

**Impacto:** Performance que usuário não vê não é prioridade. Performance que afeta decisão (demora pra carregar cenário) é.

**Autonomia:** Dev escolhe linguagem/framework dentro dos constraints do projeto. Não precisa consenso absoluto se conseguir defender.

### IA / Mei

**Honestidade:** Se IA não tem certeza, ela diz. Não inventa dados.

**Humildade:** IA vai errar. Quando errar, aprendemos.

**Impacto:** IA existe para ampliar compreensão, não para impressionar. Explicação simples > resposta complexa.

**Autonomia:** IA faz recomendações, nunca decisões. Usuário tem 100% da autonomia.

---

## 7.4 Como Tomamos Decisões

### Decisões Pequenas (afetam uma pessoa)
- Proprietário (quem tá tocando aquele código/design/feature)
- Se bloqueado, traz para time — conversam 20 minutos, decide
- Se ainda bloqueado, Fundadora decide

**Tempo:** < 1 dia

### Decisões Médias (afetam um sprint ou uma área)
- Área (Produto, UX, Engenharia, etc.)
- Dono da área propõe
- Team alinhado em 24h-48h
- Executa

**Tempo:** 2-3 dias

### Decisões Grandes (afetam roadmap, estratégia, cultura)
- Toda equipe
- Discussão assíncrona (Slack, Doc)
- Sincro se houver blockers
- Decida together

**Tempo:** 1-2 semanas

### Decisão Filosofia (afeta identidade ou valores)
- Vai pra Fundadora
- Fundadora conversa com equipe antes de decidir
- Uma vez decidida, é Lei

**Tempo:** Varia, mas é raro

### Regra de Ouro Para Qualquer Decisão

**Pergunta #1:** "Essa decisão reflete nossa crença em compreensão > controle?"

Se não, pare. Re-pense.

**Pergunta #2:** "Alguma stakeholder seria infeliz com essa decisão sem conversa?"

Se sim, converse antes.

**Pergunta #3:** "Conseguimos revertê-la facilmente?"

Se não, tenha mais cuidado. Se sim, pode ser ousado.

---

## 7.5 O Que Temos (e Não Temos) de Política Corporativa

### O Que NÃO Temos

- ❌ Hierarquia rígida
- ❌ Processo de aprovação (código, design, features)
- ❌ Reunião diária obrigatória
- ❌ KPIs individuais (só de time)
- ❌ Bônus atrelado a métricas curtas
- ❌ Política de dress code
- ❌ Férias controladas / PTO contado

### O Que Temos

- ✅ Clareza de responsabilidade (quem cuida de cada coisa)
- ✅ Código de Conduta (respeito, sem assédio, sem discriminação)
- ✅ Transparência de salário (ranges públicos, não secreto)
- ✅ Processo de contratação explicado
- ✅ Processo de feedback regularizado
- ✅ Direito de desligar-se sem motivo (em período de experiência, obvio)
- ✅ Aprendizado como direito (tempo pra aprender, livros, cursos)

---

## 7.6 A Cultura de Feedback

Feedback é como a gente aprende.

### Como Fazemos Feedback

**Semanal:** One-on-one entre você e seu lead (se tiver lead). 20 minutos. Aberto para qualquer assunto.

**Mensal:** Retro de time. O que foi bem, o que foi mal, o que a gente muda.

**Trimestral:** Feedback 360. Você recebe de colegas, lead, e oferece para colegas e lead.

### Regras de Feedback

- Sempre em privado (exception: retro de time, que é coletiva)
- Sempre específico ("Seu código é confuso na linha 42" > "Seu código é confuso")
- Sempre actionable ("Poderia documentar essa função porque X usuários ficaram confusos")
- Sempre ofertado, não imposto ("Quer ouvir como eu vejo?" > "Você errou")

### Feedback Que Não Fazemos

- ❌ Feedback sobre personalidade ("Você é muito tímido")
- ❌ Feedback de segunda mão ("Fulano disse que você fez X")
- ❌ Feedback públicamente humilhante

---

## 7.7 Crescimento e Aprendizado

Mirai investe em crescimento porque:

1. **Pessoas melhores → Produto melhor**
2. **Aprendizado novo → Inovação**
3. **Desenvolvimento pessoal → Satisfação**

### Formas de Aprendizado Apoiadas

- Cursos online (custeamos)
- Livros (alocamos orçamento)
- Conferências (vamos junto se relevante)
- Discussões internas (cada area tem "tech talk" quinzenal)
- Prototipagem experimental (1/4 de hora pra explorar ideias)

### Carreira em Mirai

Mirai não tem "progressão automática".

Tem "evolução conforme você cresce".

Você cresce de dev júnior para sênior quando:
- Consegue desassistir (tomar decisão sem supervisão)
- Consegue ensinar (outros aprendem com você)
- Consegue priorizar (identifica o que importa vs. o que é curioso)

Aí salário alinha. Nada acontece em secreto.

---

## 7.8 Conflito e Desacordo

Conflito é saudável.

Desacordo é esperado (temos pessoas que pensam diferente).

### Como a Gente Lida

**Discordância:** "Acho que essa feature não é impacto"

→ Conversa (por que você acha? Por que eu acho diferente?)

→ Se continua desacordo: levanta pra área lead ou produto

→ Se ainda: Fundadora escuta os dois lados e decide

**Conflito pessoal:** Você não está gostando de trabalhar com Fulano

→ Conversa um-a-um (você desconfortável? Por quê?)

→ Se bloqueado: leva pro responsável da área

→ Se bloqueado: Fundadora facilita conversa

→ Último recurso: pessoas se separam de projeto

**Erro de alguém:** Alguém fez algo que afeta o time negativamente

→ Conversa privada (o que aconteceu?)

→ Sem pré-julgamento (Assumo que foi sem má fé)

→ "Como a gente não faz de novo?"

→ Ajusta processo, não pessoa

---

## 7.9 Reflexão: Cultura Como Produto Interno

Sua cultura é importante porque:

1. **Atraisonha as pessoas certas**
   Se você quer pessoas que amam compreensão, quer mentes curiosas, criativas, humildes — sua cultura as atrai.

2. **Repele pessoas erradas**
   Se alguém quer só vencer, ganhar bônus grande, ter status — vai ficar infeliz. Melhor ela saber antes.

3. **Define qualidade do trabalho**
   Uma cultura de honestidade + humildade produz código melhor, design melhor, decisões melhores.

4. **Cria possibilidade de crescimento juntos**
   Sem hierarquia rígida, sem política, as pessoas conseguem crescer sem derrotar ninguém.

Cultura não é "lista de valores na parede".

É "como a gente faz as coisas" — todo dia, sem lembrança.

Mirai não quer ser "grande empresa".

Quer ser "grupo de pessoas inteligentes, honestas, humildes, focadas em impacto".

Conforme cresce, cultura é o que preserva isso.

---

**Fim do Capítulo 7 — A Cultura**

*Próximo: Capítulo 8 — Manifesto*
