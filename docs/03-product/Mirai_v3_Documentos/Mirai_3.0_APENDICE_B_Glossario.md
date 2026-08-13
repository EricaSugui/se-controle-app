# Apêndice B — Glossário

Glossário de termos usados em Mirai e este Brand Book.

Quando há confusão entre "como diríamos internamente" vs. "como diríamos ao usuário", ambos aparecem.

---

## C

### Casa
**Definição interna:** A unidade central de dados em Mirai. Raiz da árvore de permissões, dados, relatórios.

**Definição para usuário:** "Seu lar, a família que compartilha finanças."

**Contexto:** Uma pessoa pode participar de múltiplas casas (a sua, a dos pais que ela ajuda a sustentar). Dados de casas nunca se misturam.

**Exemplos:**
- Casa própria (4 pessoas, orçamento de R$ 10k/mês)
- Casa dos pais (2 gerações, múltiplas rendas)
- Casa compartilhada com amigos (joint expenses)

---

### Caixa
**Definição:** Um dos dois eixos de leitura financeira. Mostra "quanto sai do bolso *este mês*".

**Contraste com:** Competência.

**Exemplo:** Você compra uma geladeira por R$ 3.000 em 10x (R$ 300/mês). 
- Competência: R$ 3.000 (você se comprometeu com R$ 3.000 em MAIO)
- Caixa: R$ 300 (R$ 300 sai do bolso a CADA MÊS)

**Por que importa:** Mesma pergunta ("quanto gastei?") tem duas respostas válidas.

---

### Cenário
**Definição:** Simulação de um "e se?" (what-if). Combina estado real + mudanças hipotéticas + projeção.

**Exemplos:**
- "E se eu comprar um carro?"
- "E se a renda cair 20%?"
- "E se minha filha entrar numa escola mais cara?"

**Output:** Linha do tempo projetada (como fica o saldo em 6, 12, 24 meses)

**Diferença com "simulador":** Cenário usa dados históricos reais. Simulador é entrada manual de tudo.

---

### Competência
**Definição:** Um dos dois eixos de leitura financeira. Mostra "quanto está comprometido *este mês*", independente de quando o dinheiro sai.

**Contraste com:** Caixa.

**Exemplo:** (mesmo da Caixa acima)
- Competência: R$ 3.000 (você se comprometeu)
- Caixa: R$ 300 (o que sai agora)

**Por que importa:** Planejamento. Você precisa saber "quanto da minha renda está prometida?" (competência) E "quanto preciso ter em cash agora?" (caixa).

---

### Contrato
**Definição interna:** Despesas ou Receitas Fixas — padrão que se repete (aluguel, salário, mensalidade).

**Definição para usuário:** "Gastos que se repetem todo mês" ou "Receitas que se repetem todo mês".

**Características:**
- Data de início
- Valor
- Frequência (mensal é padrão; semanal, bimestral, etc. são casos especiais)
- Vigência (começa em tal data, termina em tal data)

**Não é:** Uma transação única. Contratos são padrões.

**Ver também:** Reajuste, Exceção.

---

## D

### Dashboard
**Definição:** A tela inicial de Mirai. Mostra "situação atual" da casa.

**Informações que contém:**
- Resumo do mês (receitas, gastos, saldo)
- Dois eixos (competência e caixa)
- Participantes da casa
- Alertas (contas não configuradas, etc.)

**Diferentes de:** Projeção (que é futuro).

---

## E

### Exceção
**Definição:** Um desvio do padrão de contrato que precisa de justificativa.

**Exemplo:** "Contrato de diarista é 2x/semana. Este mês, ela veio só 1x porque ficou doente."

**Como registrar:** Marcar que houve exceção e documentar por quê.

**Efeito:** Status do contrato não fica "atrasado", fica "em dia com exceção justificada".

**Não confundir com:** Falta (ausência sem justificativa) — esses viram atraso.

---

## F

### Fluxo de Caixa
**Definição:** Movimento de dinheiro (entrada, saída) em um período.

**Também chamado de:** Eixo de Caixa.

**Usado em:** Projeção, Acerto de Contas.

---

## H

### Histórico
**Definição:** Registro de tudo o que aconteceu até hoje.

**Também chamado de:** Passado, Dados históricos.

**Importância em Mirai:** Histórico alimenta Motor de Cenários (de onde vem o padrão).

---

## I

### Inteligência Artificial
**Definição em Mirai:** Camada que transforma dados brutos em compreensão.

**Personificada em:** Mei (assistente).

**Papel:** Explicar, contextualizar, questionar — nunca decidir.

**Tecnologia:** Pode ser heurísticas, pode ser LLM, pode ser híbrido.

---

## K

### Kata
**Definição:** Design System de Mirai.

**Origem:** Palavra que significa "padrão" ou "forma de fazer" (termo de artes marciais).

**Contém:** Tokens de design (cores, tipografia, espaçamento), componentes, padrões comportamentais.

**Propósito:** Linguagem visual e comportamental consistente em toda a plataforma.

---

## M

### Mei
**Definição:** Assistente inteligente de Mirai.

**Papel:** Explicar dados, contextualizar, questionar, ensinar.

**Personalidade:** Perceptiva, educada, curiosa, humilde.

**Nunca faz:** Decide, culpa, força recomendações.

**Tecnologia:** IA que passa a ser mais sofisticada conforme produto evolui.

**Ver também:** Inteligência Artificial.

---

### Mirai
**Definição:** Plataforma de apoio à decisão familiar.

**Significado:** Futuro em japonês (未来).

**Escopo:** Começa com finanças, expande para saúde, educação, patrimônio, vida.

**Não é:** Um app de finanças. É *mais que isso*.

**Ver também:** Ecossistema (Mirai + Mei + Kata).

---

### Motor de Cenários
**Definição:** Camada pura de projeção. Toma dados + mudanças hipotéticas, produz linha do tempo projetada.

**Não é:** Uma tela (é backend).

**Alimenta:** Dashboard (projeção base), Saldo Projetado (exploração), Cenários (comparação).

**Core da marca:** Sem Motor, Mirai é um app de registro. Com Motor, é plataforma de decisão.

---

## O

### Orçamento
**Definição:** Plano de quanto você *planeja* gastar em cada categoria.

**Também chamado de:** Limite, Meta.

**Em Mirai:** Evitamos "orçamento" porque pressupõe que você vai *controlar* o gasto. Preferimos "explorar cenários" (mais aberto).

**Não é:** Limite hard (Mirai nunca bloqueia).

---

## P

### Pessoa
**Definição interna:** Membro de uma casa. Pode ter login (Usuário) ou não.

**Definição para usuário:** "Você, seu parceiro, seus filhos, sua mãe — qualquer um que seja parte da casa."

**Importante:** Pessoa ≠ Usuário. Uma filha pode ser pessoa na casa sem ter login.

**Rastreabilidade:** Cada lançamento registra QUEM É o dono (pessoa) vs. QUEM REGISTROU (usuário).

**Ver também:** Casa, Usuário.

---

### Projeção
**Definição:** Previsão de futuro baseada em dados históricos e padrões.

**Não é:** Previsão de verdade (não temos bola de cristal).

**É:** Simulação lógica ("se você continuar assim, eis o resultado").

**Usada em:** Tela de Saldo Projetado, Motor de Cenários, Dashboard.

---

## R

### Reajuste
**Definição:** Mudança de valor em um contrato.

**Implementação:** Cria uma *nova versão* do contrato (história preservada).

**Exemplo:** "Aluguel subiu de R$ 1.500 para R$ 1.600. A partir de junho."

**Importante:** Não é "edição" (que apagaria o histórico). É *versionamento*.

**Ver também:** Contrato, Histórico.

---

### Relatório
**Definição:** Visualização agregada de dados (não é uma transação).

**Exemplos:**
- "Matriz de gastos por categoria × pessoa da casa"
- "Fechamento mensal"
- "Acerto de contas"

**Diferente de:** Tela transacional (que mostra lançamentos individuais).

---

## S

### Saldo Projetado
**Definição:** Tela que mostra "como vai ficar seu saldo nos próximos X meses".

**Baseado em:** Dados históricos + Motor de Cenários.

**Interatividade:** Usuário consegue explorar ("e se eu comprar um carro?").

**Não é:** Previsão de verdade. É construção de possibilidades.

---

### Subalávelização
**Definição:** Sistema de categorias (sub-categorias de sub-categorias de sub-categorias).

**Em Mirai:** Não fazemos. Temos categorias flat com descrições.

**Por quê:** Reduzir carga cognitiva. Uma pessoa confusa com 3 níveis de categorias deixa de usar.

---

## T

### Tenência
**Definição histórica:** Marca anterior de Mirai (2025).

**Significado:** Prudência, sabedoria, cuidado com o que se tem.

**Origem:** Expressão brasileira (avó da fundadora).

**Quando:** Fase intermediária entre "Se Controle" e "Mirai".

**Hoje:** Tenência é história; Mirai é marca.

**Domínio:** tenhatenencia.com.br (casa institucional de Mirai).

---

### Titularidade
**Definição:** Quem é o dono de uma conta ou cartão.

**Importância:** Afeta quem é responsável por pagar (título) vs. quem tem acesso.

**Exemplo:** Cartão titulado por você, mas você compartilha com filha para compras. Responsabilidade é sua; acesso é compartilhado.

---

## U

### Usuário
**Definição:** Pessoa com login ativo em Mirai.

**Diferente de:** Pessoa (que pode não ter login).

**Permissões:** Usuário tem permissão na casa (admin, editor, visualizador).

**Ver também:** Pessoa, Casa, Autenticação.

---

## V

### Visibilidade
**Definição:** Quem consegue ver o que em uma casa.

**Configurável por:** Admin da casa.

**Exemplos:**
- Admin: vê tudo (lançamentos, cenários, acerto)
- Editor: vê tudo e pode editar
- Visualizador: vê tudo mas não edita
- Convidado: vê seleção de dados (dependendo da casa)

**Ver também:** Permissões, Casa.

---

## X

### (Nenhuma entrada com X)

---

## Z

### (Nenhuma entrada com Z)

---

## Notas Sobre Este Glossário

1. **Evoluindo:** Novo termos surgem conforme Mirai evolui. Glossário é vivo.

2. **Duas linguagens:** Cada termo tem (usualmente) versão interna (técnica) e versão para usuário (acessível).

3. **Remissões:** Termos remetem uns aos outros quando há conexão lógica.

4. **Quando em dúvida:** Consulte este glossário antes de usar termo novo ou sem definição clara.

---

**Fim do Apêndice B**
