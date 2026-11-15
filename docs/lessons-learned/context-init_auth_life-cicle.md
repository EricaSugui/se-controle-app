# Aprendizado técnico: inicialização de contexto, autenticação e ciclo de vida da navegação

**Projeto:** Tenência  
**Área:** React Native / Expo Router  
**Contextos envolvidos:** `AuthContext`, `OnboardingContext` e navegação raiz

## 1. Contexto do problema

Durante a geração e instalação de uma nova versão Android do Tenência, o aplicativo passou a apresentar um comportamento inesperado:

- A tela de splash era exibida normalmente.
- O login com Supabase era realizado com sucesso.
- A API `/auth/me` retornava os dados corretos do usuário.
- Mesmo assim, o aplicativo retornava à tela de login em vez de permanecer na área autenticada.

O problema não estava na autenticação propriamente dita, mas no gerenciamento do estado de inicialização dos contextos e no ciclo de vida da árvore de navegação.

## 2. Diagnóstico

A investigação foi realizada por meio de logs no Android (`adb logcat`).

Foi possível confirmar que:

1. O Supabase restaurava uma sessão existente (`INITIAL_SESSION`).
2. O token de acesso estava disponível.
3. A consulta `/auth/me` retornava o usuário corretamente.
4. O evento `SIGNED_IN` também era recebido.
5. Não havia evidência de erro de autenticação ou resposta HTTP 401 que justificasse um logout.

A análise dos componentes mostrou que o problema estava na interação entre o `AppInitializer` e o `OnboardingContext`.

## 3. Causa raiz

No `app/_layout.tsx`, o componente `AppInitializer` controla a montagem da navegação:

```tsx
const ready = !initializing && initialized;

if (!ready) {
  return null;
}
```

O `Stack` só é renderizado quando a autenticação e a inicialização do onboarding estão concluídas.

No `OnboardingContext.tsx`, a função `carregar` executava:

```tsx
setInitialized(false);
setLoading(true);
```

O problema era que essa função também era executada quando o usuário mudava após um login bem-sucedido.

A sequência era:

1. O usuário fazia login.
2. O `AuthContext` atualizava `user`.
3. O `OnboardingContext` iniciava uma nova consulta.
4. `initialized` voltava para `false`.
5. `AppInitializer` identificava `ready === false`.
6. O componente retornava `null`, desmontando a árvore de navegação.
7. Após a consulta, `initialized` voltava para `true` e a navegação era montada novamente.

Essa desmontagem e remontagem interferia na navegação para o dashboard.

## 4. Correção aplicada

A solução foi remover a redefinição de `initialized` para `false` nos carregamentos posteriores.

Antes:

```tsx
async function carregar() {
  if (user == null) {
    setOnboarding(null);
    setInitialized(true);
    return;
  }

  setInitialized(false);
  setLoading(true);
  setError(null);

  try {
    setOnboarding(await getOnboarding());
  } catch (e) {
    setError(/* tratamento do erro */);
  } finally {
    setLoading(false);
    setInitialized(true);
  }
}
```

Depois:

```tsx
async function carregar() {
  if (user == null) {
    setOnboarding(null);
    setInitialized(true);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    setOnboarding(await getOnboarding());
  } catch (e) {
    setError(/* tratamento do erro */);
  } finally {
    setLoading(false);
    setInitialized(true);
  }
}
```

A alteração preservou a distinção entre os dois estados.

## 5. Aprendizado: initialized é diferente de loading

Os estados possuem responsabilidades diferentes:

| Estado | Responsabilidade |
|---|---|
| `initialized` | Indica se o contexto já concluiu sua inicialização inicial. |
| `loading` | Indica se existe uma operação de carregamento em andamento. |

A inicialização inicial é um marco do ciclo de vida do contexto. Não deve ser confundida com consultas posteriores.

Depois que a aplicação já está inicializada, uma nova consulta ao onboarding não deve fazer o `AppInitializer` desmontar toda a navegação.

### Princípio técnico

**Não utilizar um estado de inicialização global como indicador de carregamento de operações recorrentes.**

Estados que controlam a montagem da aplicação devem ter um ciclo de vida bem definido e não devem ser reinicializados a cada atualização de dados.

## 6. Validação da correção

Após a alteração, foram realizados três testes no dispositivo Android:

| Teste | Resultado |
|---|---|
| 1. Fechar completamente o aplicativo e abrir novamente, restaurando a sessão existente. | Aprovado |
| 2. Fazer logout pelo menu. | Aprovado |
| 3. Fazer login novamente e acessar o dashboard. | Aprovado |

Os três cenários funcionaram corretamente.

## 7. Lições para futuras implementações

Ao desenvolver contextos globais e componentes de inicialização:

- Separar estado de inicialização de estado de carregamento.
- Evitar desmontar a árvore de navegação durante atualizações de dados.
- Investigar a sequência dos eventos de autenticação antes de alterar o fluxo de login.
- Utilizar logs para identificar em qual etapa o estado da aplicação muda.
- Validar tanto a restauração de sessão quanto login e logout explícitos.
- Ter cuidado com componentes raiz que retornam `null` enquanto aguardam estados globais.

## 8. Arquivos envolvidos

- `app/_layout.tsx` — controle de inicialização e montagem da navegação.
- `src/context/AuthContext.tsx` — autenticação, restauração da sessão e estado do usuário.
- `src/context/OnboardingContext.tsx` — carregamento dos dados de onboarding.
- `app/(app)/_layout.tsx` — navegação autenticada e controle de redirecionamento para onboarding.

---

**Conclusão:** O problema não era uma falha de autenticação. A sessão Supabase e a comunicação com o backend estavam funcionando. A causa era a redefinição indevida do estado `initialized` durante um carregamento posterior do onboarding, provocando a desmontagem da árvore de navegação. A separação entre inicialização e carregamento resolveu o problema.