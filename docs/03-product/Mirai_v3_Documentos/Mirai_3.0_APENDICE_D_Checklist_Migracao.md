# Apêndice D — Checklist de Migração (De Tenência para Mirai)

Plano prático de como executar a migração de marca de Tenência para Mirai.

Cada item tem responsável, deadline, e critério de "feito".

---

## Fase 0: Preparação (This Week)

### Comunicação Interna
- [ ] Reunião com toda equipe: apresentar mudança
  - **Responsável:** Fundadora
  - **Deadline:** Até terça
  - **Critério:** Todos entendem por quê (ler Capítulo 1-2 de Mirai.md antes)

- [ ] Slack: #mirai-migration criado (coordenação central)
  - **Responsável:** Ops
  - **Deadline:** Hoje
  - **Critério:** Canal existe, todos adicionados

### Planejamento de Terceiros
- [ ] Contato com Vercel: avisar mudança de domínio (se necessário)
  - **Responsável:** Engenharia
  - **Deadline:** Hoje
  - **Critério:** Email enviado

- [ ] Contato com Supabase: verificar impacto em Auth
  - **Responsável:** Engenharia
  - **Deadline:** Hoje
  - **Critério:** Confirmado que redirect URLs precisam mudar

- [ ] Contato com Notarize/Domain Registrar
  - **Responsável:** Ops
  - **Deadline:** Hoje
  - **Critério:** Verifica se mirai.app está disponível + preço

---

## Fase 1: Registro Legal & Domínios (Week 1)

### INPI (Marca)
- [ ] Protocolar "Mirai" no INPI (classes NCL 36 e 42)
  - **Responsável:** Ops / Jurídico
  - **Deadline:** Quinta, antes das 18h (último dia útil)
  - **Custo:** ~R$ 425
  - **Critério:** Protocolo em mão (PDF)

### Domínios
- [ ] Registrar mirai.app
  - **Responsável:** Ops
  - **Deadline:** Hoje
  - **Registrar em:** Cloudflare Registrar
  - **Custo:** US$ 14,20/ano
  - **Critério:** Domain apontando para servidores Vercel

- [ ] Registrar tenhatenencia.com.br
  - **Responsável:** Ops
  - **Deadline:** Hoje
  - **Registrar em:** registro.br
  - **Custo:** ~R$ 40/ano
  - **Critério:** Domain registrado, DNS apontando para hospedagem

- [ ] Setup de SSL/HTTPS (automático, mas verificar)
  - **Responsável:** Engenharia
  - **Deadline:** Vir
  - **Critério:** mirai.app abre sem warning de certificado

### Social Media
- [ ] Verificar disponibilidade de @mirai
  - **Responsável:** Marketing
  - **Deadline:** Hoje
  - **Redes:** Twitter, LinkedIn, Instagram, TikTok
  - **Critério:** Já reservamos os que existem (ou esperamos se não temos conta)

---

## Fase 2: Código & Backend (Week 1-2)

### Renomear Repositórios
- [ ] GitHub: renomear se-controle-app → mirai
  - **Responsável:** Engenharia
  - **Deadline:** Seg (semana 2)
  - **Checklist:**
    - [ ] Renomear repo
    - [ ] Atualizar URL do clone (git remote)
    - [ ] Avisar time de qualquer CI/CD que referencie URL
  - **Critério:** Repo novo existe; old URL redireciona

- [ ] GitHub: renomear se-controle-backend → mirai-backend
  - **Responsável:** Engenharia
  - **Deadline:** Seg
  - **Critério:** Renomeado; CI/CD atualizado

### Variáveis de Ambiente
- [ ] `.env.local`: atualizar API_URL de se-controle-app.vercel.app para mirai.app
  - **Responsável:** Engenharia
  - **Deadline:** Ter (semana 2)
  - **Verificar:**
    - [ ] Desktop (Expo web)
    - [ ] Mobile (Expo Go, dev client, eventual APK)
  - **Critério:** Todos os ambientes apontam para mirai.app

### Supabase
- [ ] Supabase Auth: adicionar novo domínio às redirect URLs
  - **Responsável:** Engenharia
  - **Deadline:** Ter (semana 2)
  - **URLs a adicionar:**
    - [ ] mirai.app
    - [ ] www.mirai.app (se necessário)
    - [ ] localhost:8081 (dev)
    - [ ] localhost:3000 (futuro Android backend)
  - **Critério:** Login funciona em mirai.app

### Deep Links
- [ ] Atualizar deep links (convite, relatório compartilhado, etc.)
  - **Responsável:** Engenharia
  - **Deadline:** Ter (semana 2)
  - **Verificar:** mirai.app/convite/xyz ainda funciona
  - **Critério:** Links antigos 404 ou redirectam; novos funcionam

---

## Fase 3: UI/UX & Design (Week 1-2)

### Ícone & Splash Screen
- [ ] Novo ícone do app (se mudou)
  - **Responsável:** Design
  - **Deadline:** Seg (semana 2)
  - **Sizes necessários:**
    - [ ] iOS (AppStore, 1024x1024)
    - [ ] Android (Play Store, 512x512 e múltiplos sizes)
    - [ ] Web (favicon, 16x16 a 512x512)
  - **Critério:** Ícone renderiza bem em todos os tamanhos

- [ ] Splash screen atualizado
  - **Responsável:** Design
  - **Deadline:** Seg (semana 2)
  - **Onde aparece:** iOS boot, Android boot, Expo web initial load
  - **Critério:** Splash renderiza, não tem bugs de imagem

### Onboarding
- [ ] Telas de onboarding: atualizar contexto/messaging
  - **Responsável:** Product + Design
  - **Deadline:** Ter (semana 2)
  - **Verificar:**
    - [ ] Menção a "Mirai" em vez de "Tenência"
    - [ ] Messaging alinhada com Capítulo 5 (Personalidade)
    - [ ] Nenhuma imagem/referência a "Se Controle" ou "Tenência"
  - **Critério:** Novo usuário vê "Mirai" desde o início

### Microcopy Review
- [ ] Revisar *todo* texto do app: remover "Tenência", "Se Controle"
  - **Responsável:** Product + Design
  - **Deadline:** Ter-Qua (semana 2)
  - **Checklist:**
    - [ ] Títulos de telas
    - [ ] Botões
    - [ ] Placeholders de input
    - [ ] Mensagens de erro
    - [ ] Help text
  - **Ferramenta:** grep "tenência\|se.controle" src/
  - **Critério:** 0 resultados

---

## Fase 4: Infraestrutura & Deploy (Week 2)

### Vercel
- [ ] Vercel: adicionar novo domínio mirai.app
  - **Responsável:** Engenharia + Ops
  - **Deadline:** Qua (semana 2)
  - **Checklist:**
    - [ ] Domain adicionado em Vercel settings
    - [ ] SSL certificado gerado (automático)
    - [ ] Build deploy em novo domínio
    - [ ] Teste de acesso
  - **Critério:** mirai.app/dashboard abre (com login)

- [ ] Vercel: Redirects configurados
  - **Responsável:** Engenharia
  - **Deadline:** Qua (semana 2)
  - **Verificar:**
    - [ ] se-controle-app.vercel.app/dashboard → mirai.app/dashboard (301)
    - [ ] Links compartilhados antigos continuam funcionando
  - **Critério:** Redirect funciona; SEO não é impactado

### Backend
- [ ] Deploy backend em novo domínio (se tiver domínio próprio)
  - **Responsável:** Engenharia
  - **Deadline:** Qua (semana 2)
  - **Verificar:**
    - [ ] APIs respondendo
    - [ ] Logs limpios (sem erros de CORS, etc.)
  - **Critério:** Backend responde em nova URL

### Monitoring
- [ ] Monitoring: adicionar alertas para mirai.app
  - **Responsável:** Engenharia
  - **Deadline:** Qua (semana 2)
  - **Verificar:**
    - [ ] 404 errors
    - [ ] 500 errors
    - [ ] Latência
    - [ ] Uptime
  - **Critério:** Dashboard monitora novo domínio

---

## Fase 5: Comunicação (Week 2)

### Release Notes
- [ ] Blog post / Release notes: "Bem-vindo a Mirai"
  - **Responsável:** Product + Marketing
  - **Deadline:** Qua (semana 2), publicar Qui
  - **Conteúdo:**
    - [ ] Por que o nome mudou (resumido)
    - [ ] O que não muda (produto, dados, account)
    - [ ] O que muda (domínio, branding)
    - [ ] Como atualizar bookmarks/links
  - **Critério:** Post publicado no blog

### Email aos Usuários
- [ ] Email: "Bem-vindo a Mirai" aos usuários ativos
  - **Responsável:** Marketing
  - **Deadline:** Qui (semana 2), enviar 9:00am
  - **Conteúdo:**
    - [ ] Explicação breve
    - [ ] Link para novo domínio
    - [ ] "Nada muda na sua experiência"
    - [ ] CTA: "Acessar Mirai"
  - **Critério:** Email enviado; open rate monitorado

### Social Media
- [ ] Twitter: anúncio de rebrand
  - **Responsável:** Marketing
  - **Deadline:** Qui (semana 2), post 10:00am
  - **Conteúdo:** Tweet + thread (máx 3 tweets)
  - **Critério:** Posted; respostas respondidas em <4h

- [ ] LinkedIn: post profissional
  - **Responsável:** Fundadora
  - **Deadline:** Qui (semana 2), post 10:00am
  - **Tom:** Professional, explicando visão
  - **Critério:** Posted; engajamento monitorado

### Press (Opcional)
- [ ] Email para press/blogs de tech: "Mirai rebrands from Tenência"
  - **Responsável:** Fundadora + PR
  - **Deadline:** Qui (semana 2)
  - **Alvo:** Blogs de startups, FinTech, Tech
  - **Critério:** Emails enviados

---

## Fase 6: Limpeza (Week 3)

### Documentação Interna
- [ ] README.md: atualizar todas as referências
  - **Responsável:** Engenharia
  - **Deadline:** Seg (semana 3)
  - **Verificar:**
    - [ ] Setup instructions
    - [ ] Deployment instructions
    - [ ] API docs
    - [ ] Qualquer hardcoded URL
  - **Critério:** 0 referências a "Se Controle" ou "Tenência"

- [ ] Docs internas: migrar/atualizar
  - **Responsável:** Produto
  - **Deadline:** Seg (semana 3)
  - **Verificar:**
    - [ ] Architecture.md
    - [ ] Fluxo-telas.md
    - [ ] Visão de Domínio
  - **Critério:** Tudo referencia "Mirai" ou é agnóstico

### Repositórios Antigos
- [ ] GitHub: archive se-controle-app (old repo)
  - **Responsável:** Engenharia
  - **Deadline:** Ter (semana 3)
  - **Checklist:**
    - [ ] Clone local feita (backup)
    - [ ] Repo marcado como archived
    - [ ] README indicando "Este projeto agora é Mirai"
    - [ ] Link para novo repo

- [ ] GitHub: archive se-controle-backend
  - **Responsável:** Engenharia
  - **Deadline:** Ter (semana 3)
  - **Mesmos passos acima**

### Vercel
- [ ] Vercel: deabilitard deploy de old project (se tiver)
  - **Responsável:** Engenharia
  - **Deadline:** Ter (semana 3)
  - **Critério:** se-controle-app.vercel.app não deploya novo código

- [ ] Vercel: deletar project se não precisar mais
  - **Responsável:** Ops
  - **Deadline:** Ter (semana 3) — APÓS verificar que nada depende
  - **Critério:** Deletado; ninguém reclama 48h depois

---

## Fase 7: Validação (Week 3-4)

### QA Checklist
- [ ] QA: Cenário full user journey em mirai.app
  - **Responsável:** QA / Tester
  - **Deadline:** Qua (semana 3)
  - **Cenários:**
    - [ ] Login novo
    - [ ] Login existente (redirecionado de old domain?)
    - [ ] Criar gasto
    - [ ] Ver projeção
    - [ ] Compartilhar com família
    - [ ] Logout e re-login
  - **Critério:** Sem bugs encontrados

- [ ] Validar em múltiplos devices
  - **Responsável:** QA
  - **Deadline:** Qua (semana 3)
  - **Devices:**
    - [ ] Desktop Chrome (Windows, Mac)
    - [ ] Desktop Safari (Mac)
    - [ ] Mobile iOS (Safari)
    - [ ] Mobile Android (Chrome)
    - [ ] Tablet (iPad, Android tablet)
  - **Critério:** Funciona sem issues em todos

### Analytics
- [ ] Analytics: verificar eventos estão sendo capturados
  - **Responsável:** Engenharia
  - **Deadline:** Qua (semana 3)
  - **Verificar:**
    - [ ] Users: eventos estão contabilizando
    - [ ] Session: duração está correta
    - [ ] Funnel: conversão de login → dashboard
  - **Critério:** 0 NaN values; números fazem sentido

---

## Fase 8: Pós-Migração (Week 4+)

### Monitoring (2 semanas)
- [ ] Daily: Verificar erros de 500, crashes, performance
  - **Responsável:** Engenharia (on-call)
  - **Deadline:** Daily, até fim de semana 4
  - **Critério:** Nenhum erro crítico não reportado

- [ ] Weekly: Retro de migração
  - **Responsável:** Fundadora
  - **Deadline:** Sex (semana 4)
  - **Agenda:**
    - [ ] O que saiu bem?
    - [ ] O que não saiu?
    - [ ] O que aprendemos?
    - [ ] Alguma tarefa ficou pra trás?

### Comunicação Contínua
- [ ] Email aos usuários com issues: suporte individualizado
  - **Responsável:** Support
  - **Deadline:** ASAP (se issues surgirem)
  - **Critério:** Resposta em <24h

- [ ] Blog post follow-up: "Mirai 1 month later"
  - **Responsável:** Fundadora
  - **Deadline:** Seg (semana 5)
  - **Conteúdo:** Learnings, o que vem próximo
  - **Critério:** Posted

### Otimizações (Se necessário)
- [ ] Performance: se latência aumentou, investigar
  - **Responsável:** Engenharia
  - **Deadline:** Contínuo
  - **Critério:** Latência volta ao baseline

- [ ] SEO: se tráfego orgânico caiu, investigar
  - **Responsável:** Marketing
  - **Deadline:** Contínuo (monitorar próximas 4 semanas)
  - **Critério:** Traffic recupera ou explica-se

---

## Dependências & Críticos

### Path Crítico (não pode atrasar)
1. INPI protocolo (regra legal)
2. Domínio registrado (mirai.app)
3. Supabase Auth redirect URLs
4. Vercel deploy + SSL
5. Comunicação aos usuários

**Total: 2 semanas máximo**

### Parallelizáveis
- Ícone/splash (design)
- Release notes (product)
- Email draft (marketing)
- Podem começar semana 1, entregam semana 2

### Que Pode Esperar Um Pouco
- Limpeza de repos antigos
- Archive de github
- Blog follow-ups

---

## Comunicação de Problemas

Se algo der errado:

1. **Slack:** Post em #mirai-migration com tag @here
2. **Sync:** Chamar sync em <4h (se bloqueador)
3. **Escalation:** Fundadora decide se adia, pivota, ou força

---

## Checklist Final (Release)

Antes de comunicar publicamente (Qui semana 2):

- [ ] Domínio funciona
- [ ] Login funciona
- [ ] Nenhuma referência a "Tenência" no app
- [ ] Social handles reservados
- [ ] Release notes prontos
- [ ] Email prontos
- [ ] Suporte alertado (prepara para perguntas)
- [ ] Monitoramento rodando

**Sign-off:** Fundadora + Engenharia Lead + Product Lead

---

**Fim do Apêndice D**
