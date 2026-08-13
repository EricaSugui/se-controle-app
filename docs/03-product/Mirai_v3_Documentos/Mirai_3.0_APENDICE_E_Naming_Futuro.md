# Apêndice E — Naming Futuro

Quando (e como) os nomes evoluem em Mirai.

Este apêndice registra como pensamos sobre nomenclatura *futuro*, para que decisões sejam coerentes com a filosofia, não apenas com gosto pessoal.

---

## Princípios de Naming em Mirai

Antes de nomear *qualquer coisa* (feature, componente, conceito, futuro domínio), siga estes princípios:

### Princípio 1: Clareza
Nome comunica função, não impressiona.

✅ "Saldo Projetado" (claro: saldo que será)  
❌ "Futuro Iluminado" (bonito, confuso)

### Princípio 2: Raiz Semântica
Nome reflete essência, não é arbitrário.

✅ "Cenários" (vem de "cena", múltiplas possibilidades)  
❌ "Simulações" (neutro demais, pode significar qualquer coisa)

### Princípio 3: Sem Culpa
Nome nunca pressupõe julgamento.

✅ "Projeção" (neutral, factual)  
❌ "Orçamento Apertado" (pressupõe problema)

### Princípio 4: Expansibilidade
Nome funcionará ainda quando escopo mudar?

✅ "Mirai" (futuro em geral, não só finanças)  
❌ "FinMiraiNet" (muito específico)

---

## Naming de Sub-Marcas (Se Existirem)

Se Mirai tiver sub-produtos, como nomear?

### Opção 1: Nomes em Japonês (Coerência com Mirai)
**Mirai** (futuro, presente) — plataforma principal  
**Mei** (め? 名? 明?) — assistente (já escolhido)  
**Kata** (型) — design system (já escolhido)  

**Possíveis novos nomes:**
- **Karada** (体 — corpo) — para app de saúde
- **Kyoiku** (教育 — educação) — para app de educação
- **Ie** (家 — lar/casa) — para app de patrimônio

**Vantagem:** Coerência linguística, som, memorabilidade  
**Desvantagem:** Precisa explicar significado; pode não funcionar em todas as regiões

### Opção 2: Nomes em Português (Acesso Direto)
**Mirai** — plataforma principal  
**Saúde** — para app de saúde (ou "Bem-estar")  
**Educação** — para app de educação  
**Casa** — para app de patrimônio  

**Vantagem:** Óbvio em português; não precisa explicar  
**Desvantagem:** Genérico; perde coerência visual/sonora

### Opção 3: Nomes Próprios (Histórico/Cultural)
Usar nomes que têm significado na cultura brasileira (como "Tenência" para a avó da fundadora).

**Possibilidades:**
- **Saúde:** "Cuidança" (cuidado + redundância)
- **Educação:** "Andança" (jornada educativa)
- **Patrimônio:** "Herança" (o que se passa para frente)

**Vantagem:** Raízes culturais; memorabilidade  
**Desvantagem:** Precisa história verdadeira; pode parecer forçado

### **Recomendação:** Opção 1 (Japonês)
Mantém coerência com Mirai, facilita branding global, mantém "vibe" da marca.

---

## Naming de Features (Linguagem Para Usuário)

Quando lançar nova feature, o nome que o usuário vê não deve ser interno.

### Exemplo: "Cenários"

**Nome Interno:** "What-If Engine" ou "Scenario Generator"

**Nome Para Usuário:** "Cenários" ou "E se?" 

**Por quê?:** "Cenários" é uma palavra que famílias usam ("a gente pensou em cenários diferentes")

---

## Naming de Fases (De Desenvolvimento)

Não use "v2.0", "Phase 2", "Sprint X" em comunicação externa.

**Ruim:**
"Mirai v3.0 está pronto" — confunde com versão de app

**Melhor:**
"Mirai lança novo Motor de Cenários" — comunica feature, não versão

**Quando usar versões numeradas:**
- Internamente (código, branches, databases)
- Com poder técnico
- Nunca com usuários (confunde)

---

## Naming de Futuras Expansões

### Quando Mirai Expande Para Saúde

Decisão: Fica sob "Mirai" ou ganha marca nova?

**Opção A: Sub-brand**
"Mirai Saúde" ou "Mirai + Karada"  
Benefício: Associação com Mirai; confiança herdada  
Custo: Mais nomes pra manter

**Opção B: Extensão natural**
"Mirai" continua mesmo nome (saúde é novo domínio)  
Benefício: Uma marca; simplicidade  
Custo: Confusão se usuário não entender escopo

**Recomendação:** Opção B (Mirai = plataforma, domínios são features)

---

## Naming de Domínios Futuros

Quando internacionalizar ou criar landing pages específicas:

### Brasil (Já documentado)
- `mirai.app` — produto
- `tenhatenencia.com.br` — casa institucional

### Portugal
- `mirai.pt` — produto (mesmo app)
- `mirai.pt` pode ser landing customizada
- Ou `portugal.mirai.app` (subdomínio)

**Recomendação:** Subdomínios para agora; TLDs nacionais só se crescer muito (e valer custo)

### Futuro Global
- `mirai.app` — universal (será feito)
- Subdomínios: `en.mirai.app`, `es.mirai.app`, `pt.mirai.app`
- Landing de empresa: `about.mirai.app` ou `tenhatenencia.com` (global)

---

## Quando Rebrand Seria Necessário Novamente

Mirai é nome *final*, mas em cenários extremos, rebrand faria sentido:

### Cenário 1: Pivot Total
Se descobrisse que Mirai não é sobre futuro, é sobre X.

**Exemplo:** "Mirai é sobre transparência em relacionamentos familiares" (não sobre finanças).  
**Então rebranding seria justificado.**  
**Threshold: Só se core mission mudar.**

### Cenário 2: Conflito Legal
Se descobrisse que "Mirai" (marca ou domínio) já é propriedade de alguém no Brasil.

**Threshold: Só se houver obrigação legal.**

### Cenário 3: Cultural
Se em país novo, "Mirai" ganha conotação negativa (exemplo hipotético: significa "miserável" em língua X).

**Threshold: Só se alienar mercado inteiro.**

**Probabilidade de Rebrand Total:** <1%

Mirai é nome *sólido* para os próximos 10+ anos.

---

## Naming De Mei (Assistente) — Próximas Versões

Mei é nome escolhido. Mas como ela evolui nominalmente?

### Versão Atual (MVP)
"Mei" — assistente básica, explicações templated.

### Versão Média (Futuro próximo)
"Mei" + descritor ("Mei inteligente", "Mei premium")?  

**Não.** Nome continua "Mei". Features são features, não justificam novo nome.

### Versão Avançada (Futuro distante)
Se Mei virar tão sofisticada que é praticamente personagem, poderia ganhar apelido?

**Exemplo:** "Mei" como nome, "Sophia" como apelido carinhoso?

**Recomendação:** Evitar. Um nome é menos confuso.

---

## Naming de Sucessos (Quando Decisão Sai Bem)

Quando usuário consegue fazer algo graças a Mirai, como celebrar?

❌ "Achievement Unlocked: R$ 10k Economizados"  
✅ Mei: "Você economizou R$ 10k em 6 meses! Isso significa que consegue [coisa X]."

Celebração via **contexto**, não via **badge system**.

---

## Checklist De Naming (Para Toda Nova Entidade)

Antes de nomear feature/domínio/produto novo:

1. ✅ Comunica claramente função?
2. ✅ Reflete raiz semântica verdadeira?
3. ✅ Evita linguagem de culpa ou julgamento?
4. ✅ Funcionará quando escopo mudar?
5. ✅ Alinha com filosofia de Mirai?
6. ✅ É fácil de pronunciar em múltiplos idiomas?
7. ✅ Não colide com marca conhecida?
8. ✅ Funcionará em 10 anos?

Se responder "não" em qualquer uma → volte à estaca zero.

---

## Histórico De Naming (Para Futuro)

**Registro permanente:**

| Entidade | Nome | Data | Por Quê | Alternativas |
|---|---|---|---|---|
| Marca principal | Mirai | Ago/2026 | Futuro que se constrói | Prism, Mellon, Nexa |
| Assistente | Mei | Ago/2026 | Compreensão | (n/a) |
| Design System | Kata | 2025 | Padrão/método | (n/a) |
| Feature | Cenários | 2025 | Múltiplas possibilidades | Simulações, What-if |

*Continua...*

---

## Reflexão Final

Nomes são mais que etiquetas.

São **promessas**.

Quando você escolhe "Mirai", está prometendo que ajudará o futuro.

Quando escolhe "Mei", está prometendo que a assistente é sábia.

Quando escolhe "Kata", está prometendo que o design é padrão e manutenível.

Por isso nomes importam.

E por isso esse apêndice existe — para que todo nome *escolhido* tenha razão de ser.

Não será suficiente dizer "a gente gostou da palavra".

Precisa ser: "a palavra comunica a verdade do que oferecemos".

---

**Fim do Apêndice E**
