---
name: verify
description: Como verificar mudanças do se-controle-rn em runtime (Expo web + backend local)
---

# Verificação do se-controle-rn

## Superfície

App Expo (expo-router) com backend Express em `../back`. O app aponta para a
API via `EXPO_PUBLIC_API_URL`: `.env.dev` (DEV local, padrão dos scripts sem
sufixo), `.env.tcc` (TCC) e `.env.prod` (produção, só com `:prod`
explícito). Nunca usar uma configuração implícita.

## Subir o app (web — iteração mais rápida)

```powershell
npm run web            # DEV local (.env.dev), porta 8081
npm run web:tcc        # TCC (.env.tcc), com o back em `npm run dev:tcc`
# porta 8081 costuma estar ocupada por um Metro da dona do repo — use outra:
npx expo start --web --port 8082
```

## Probe de compilação sem browser

O Metro só compila sob demanda. Para forçar e pegar erros de bundle/import:

1. `GET http://localhost:8082/` → extrair `src="...bundle..."` do HTML e requisitar
   (bundle principal, ~4.5 MB).
2. Rotas são lazy no web dev — compile cada tela alterada individualmente:
   `GET http://localhost:8082/app/(app)/<rota>.tsx.bundle?platform=web&dev=true&hot=false&lazy=true&transform.routerRoot=app&modulesOnly=true&runModule=false`
   (o caminho usa o arquivo da rota com parênteses/colchetes literais).

## Limites conhecidos (bloqueiam E2E automatizado)

- **Auth**: backend valida token Supabase real (`src/middleware/auth.ts` do
  backend) e exige pessoa vinculada. O login de teste usa os usuários
  fixture configurados em `back/.env.dev` (ou `back/.env.tcc`); senhas não
  devem ser registradas neste arquivo.
- **Banco**: os testes de escrita devem usar o Supabase local (DEV) ou o do
  TCC, sempre com a casa fixture. Nunca criar dados de teste na produção. No
  backend, use `db:reset`/`db:clean` (DEV) ou `db:reset:tcc`/`db:clean:tcc`
  para preparar e limpar os dados.
- **Dev client nativo**: módulos nativos novos (ex. react-native-svg) exigem rebuild EAS do
  dev client; web e Expo Go funcionam sem rebuild.

## Checks que valem a pena

- `npx tsc --noEmit` (tipos, rápido).
- Probe de bundle acima para toda tela nova/alterada.
- Flows com login/escrita: roteiro manual para a usuária, com passos concretos.
