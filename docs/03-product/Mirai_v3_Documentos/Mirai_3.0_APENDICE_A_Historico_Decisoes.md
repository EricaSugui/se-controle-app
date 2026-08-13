# Apêndice A — Histórico das Decisões

## A.1 Decisões Estratégicas (Timeline)

### 2024 — O MVP: Se Controle

**Decisão:** Nomear o MVP "Se Controle"

**Contexto:** App inicial para organizar gastos compartilhados de família

**Critério:** Semântica de controle (vigilância pessoal de gastos)

**Resultado:** Nome apropriado para MVP, mas carregava conotação de restrição

**Aprendizado:** Nomes importam porque refletem compreensão. Quando compreensão evolui, nome precisa evoluir.

---

### 2025 — Primeira Evolução: Tenência

**Decisão:** Rebrand de "Se Controle" para "Tenência"

**Gatilho:** Descoberta de dois eixos (competência e caixa); mudança de foco de "vigilância" para "planejamento"

**Processo:** 
- Análise de 40+ nomes candidatos
- Redução para 12 finalistas
- Verificação INPI (marca livre)
- Teste de pronunciabilidade

**Por que Tenência venceu:**
- Significado profundo (expressão brasileira)
- Semântica correta (prudência, sabedoria, cuidado)
- Dupla camada (patrimônio + juízo)
- História verdadeira (avó da fundadora)

**Riscos conhecidos aceitos:**
- Comprimento (4 sílabas) — mitigado por apelido "Tenê"
- Desconhecimento entre público jovem — oportunidade educativa

**Resultado:** Nome que comunicava mudança estratégica; alinhava compreensão interna com identidade externa

---

### 2025-2026 — Motor de Cenários

**Decisão:** Investir em Motor de Cenários como core technology

**Contexto:** Realização de que o verdadeiro valor não era "registro histórico" mas "compreensão de futuro"

**Implicação:** Produto não era mais "app de finanças que organiza" mas "plataforma de apoio à decisão"

**Resultado:** Descoberta que exigia novo nome (Tenência era muito "finanças")

---

### 2026 — Segunda Evolução: Mirai

**Decisão:** Rebrand de "Tenência" para "Mirai"

**Gatilho:** Motor de Cenários pronto; expansão de domínio além de finanças (saúde, educação, patrimônio)

**Processo:**
- Análise de 40+ nomes
- Redução para 12 finalistas (Prism, Mellon, Nexa, Mirai, etc.)
- Critérios: estratégicos, linguísticos, emocionais
- Verificação de domínios e colisões legais

**Por que Mirai venceu:**
- Significado universal (futuro em japonês, fácil pronunciável em português/inglês/espanhol)
- Filosofia alinhada (futuro que se constrói, não se prediz)
- Expansão global naturalmente (não é preso a idioma)
- Defensibilidade emocional (nome comunica essência, não features)

**Decisão paralela:** Estratégia de domínios
- `mirai.app` — produto (todo acesso unificado)
- `tenhatenencia.com.br` — casa institucional (história, landing, marketing)
- Rejeição de `tenencia.com.br` (especulado, não crítico)

**Resultado:** Nome que comunica transformação; marca pronta para expansão global

---

## A.2 Decisões Operacionais (Como Fazemos As Coisas)

### Decisão: Dois Eixos Sempre Visíveis

**O Quê:** Competência e Caixa devem estar presentes em *todas* as visualizações

**Por Quê:** Porque a mesma pergunta financeira tem duas respostas legítimas. Esconder uma é mentir.

**Como implementar:**
- Dashboard: duas colunas (competência | caixa)
- Projeção: dois gráficos sobrepostos
- Relatórios: sempre as duas métricas

**Custo:** Maior complexidade de UI  
**Benefício:** Honestidade; usuário nunca é enganado

**Status:** Implementado

---

### Decisão: Casa Como Unidade Central (Não Pessoa)

**O Quê:** Raiz da árvore de dados é "Casa", não "Usuário"

**Por Quê:** Porque decisões financeiras em família são coletivas. Privilegiar pessoa sobre casa é contramão.

**Como implementar:**
- Auth: usuário entra
- Mas imediatamente seleciona casa
- Todos os dados são scoped a casa
- Pessoa pode participar de múltiplas casas, mas nunca se misturam

**Custo:** Mais queries no banco (denormalização)  
**Benefício:** Isolamento de dados; modelo mental correto

**Status:** Implementado

---

### Decisão: Sem Recomendações Genéricas

**O Quê:** Mirai nunca diz "você deveria economizar 20%" ou "esse gasto é incompatível com seu perfil"

**Por Quê:** Porque contextos são específicos. Regras genéricas são injustas.

**Como implementar:**
- Bloquear qualquer feature que tenha sabor de "recomendação impositiva"
- IA (Mei) oferece cenários, não recomendações
- Dashboard mostra dados, não avaliações

**Custo:** Menos features "wow"  
**Benefício:** Autonomia preservada

**Status:** Lei; nenhuma exceção permitida

---

### Decisão: Sem Publicidade

**O Quê:** Mirai nunca venderá dados ou espaço de publicidade

**Por Quê:** Porque publicidade pressupõe que você (usuário) é o *produto*, não o cliente

**Como implementar:**
- Modelo de negócio: subscription/premium
- Dados: nunca compartilhados (mesmo anonimizados)
- Parceiros: apenas técnicos (Supabase, Vercel, etc.)

**Custo:** Receita menor que apps ad-supported  
**Benefício:** Confiança; economia de tempo (sem otimização para atenção)

**Status:** Promessa permanente

---

### Decisão: Design System Unificado (Kata)

**O Quê:** Uma linguagem visual para toda a plataforma (web, mobile, futuro nativo)

**Por Quê:** Porque consistência reduz carga cognitiva

**Como implementar:**
- Tokens centralizados (cores, tipografia, espaçamento)
- Componentes documentados
- Migrações graduais (não precisa ser tudo de uma vez)

**Custo:** Investimento inicial em documentação  
**Benefício:** Velocidade futura; coerência

**Status:** Em construção (Kata v1.0)

---

### Decisão: Feature Freeze Até Novo Sinal

**O Quê:** Nenhuma nova feature antes de phase de UX (pós Motor)

**Por Quê:** Porque adicionar features sem validar usabilidade cria dívida técnica de UX

**Como implementar:**
- Product: avalia propostas, mas diz "não agora"
- Roadmap: focado em "melhorar o que existe"
- Ideias: registra no backlog para futuro

**Custo:** Oportunidades perdidas  
**Benefício:** Produto melhor; usuários menos confusos

**Status:** Ativo até Q4/2026

---

## A.3 Decisões Que Foram Rejeitadas (e Por Quê)

### Rejected: Gamification ("Badges" e "Achievements")

**Proposta:** Dar badges quando usuário atinge metas (ex.: "5 meses sem overspend" → badge dourado)

**Por Quê foi proposto:** Aumentar engajamento, tornar financeira "divertida"

**Por Que foi rejeitada:** Gamification pressupõe que objetivo é usar mais o app. Nosso objetivo é que usuário *decida melhor fora* do app.

**Alternativa:** Celebração genuína (Mei reconhece conquista, mas sem sistema de pontos)

---

### Rejected: Notificações Push Agressivas

**Proposta:** Notificações daily ("Lembre-se de registrar suas compras hoje!")

**Por Quê foi proposto:** Aumentar retenção; lembrança de atividade

**Por Que foi rejeitada:** Notificações push são otimização para atenção do usuário, não para qualidade de decisão.

**Alternativa:** Notificações only para situações críticas (conta vai descoberto, vencimento de conta)

---

### Rejected: Múltiplas Casas na Mesma Visão

**Proposta:** Dashboard que agrega todas as casas simultaneamente (para quem tem múltiplas)

**Por Quê foi proposto:** Simplificar para power users com muitas casas

**Por Que foi rejeitada:** Misturar casas viola princípio de isolamento. Também confunde modelo mental (família vs. portfolio de investimentos).

**Alternativa:** Selector de casa fácil; switcher sem re-auth

---

### Rejected: Recomendações de Investimento

**Proposta:** "Com essa economia, você consegue aplicar em..."

**Por Quê foi proposto:** Valor adicional; fintech comum é oferecer produtos (poupança, CDB, etc.)

**Por Que foi rejeitada:** Implicaria parceria financeira; conflito de interesse. Mirai quer estar do lado do usuário, não vendendo produtos.

**Alternativa:** Nenhuma. Mirai não toca em investimentos.

---

## A.4 Decisões em Aberto (Ainda Pensando)

### Em Aberto: Modelo de Cobrança (SaaS vs. Freemium)

**Opção A: SaaS puro**
- R$ 9,90/mês por casa
- Todos os features inclusos
- Free trial 14 dias

**Opção B: Freemium**
- Grátis: registro + dashboard (2 meses histórico)
- Premium: Motor + histórico ilimitado (R$ 9,90/mês)

**Opção C: Baseado em Uso**
- Grátis: tudo até 100 lançamentos/mês
- Premium: ilimitado (R$ 9,90/mês)

**Status:** Será testado com usuários iniciais antes de decidir

---

### Em Aberto: Expansão Internacional (Timing)

**Pergunta:** Quando sair do Brasil?

**Opção A: Quando tiver 10k usuários ativos**
- Prioridade: Portugal (mesmo idioma, contexto similar)
- Depois: Espanha / Argentina

**Opção B: Quando tiver produto robusto + brand sólida**
- Prioridade: Expansão vertical no Brasil primeiro
- Depois: Global

**Status:** Depende de funding e team

---

### Em Aberto: IA (Mei) Em Que Nível?

**Questão:** Quão avançada Mei deveria ser?

**Opção A: Simples + Heurísticas**
- Regras escritas (if-then)
- Explicações templated
- Rápido, barato, previsível

**Opção B: LLM (Claude, GPT)**
- Mais natural
- Mais flexível
- Mais caro, menos previsível

**Opção C: Híbrido (LLM para explicação + regras para recomendação)**
- O melhor dos dois mundos
- Mais complexo

**Status:** Será decidido quando Mei sair do MVP

---

## A.5 Reflexão: Por Que Documentar Decisões

Decisões não documentadas viram "como as coisas sempre foram".

Depois, quando novo membro da equipe pergunta "por quê?", ninguém sabe.

Documentar decisões:
1. Preserva contexto (por quê foi feita, quais eram as alternativas)
2. Permite revisão (quando contexto mudar, podemos reconsiderar)
3. Facilita onboarding (novo membro entende filosofia, não apenas output)
4. Evita duplicação (não vamos rediscutir a mesma coisa 3 anos depois)

---

**Fim do Apêndice A**
