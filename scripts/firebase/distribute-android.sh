#!/usr/bin/env bash
#
# Distribui o APK release de um ambiente pelo Firebase App Distribution.
#
#   npm run android:distribute -- <ambiente> <grupo> [notas]
#
#   npm run android:distribute -- prod vip "Corrige login"
#   npm run android:distribute -- prod open
#   npm run android:distribute -- tcc tcc
#   npm run android:distribute -- dev dev
#
# Cada ambiente é um app Firebase diferente (product flavor com package
# próprio). O App ID é lido do google-services.json do flavor, e só as
# combinações ambiente × grupo abaixo são aceitas — um APK de TCC nunca vai
# para os testadores VIP, nem um de PROD para o grupo do TCC.

set -e

AMBIENTE="${1:?Informe o ambiente: prod, tcc ou dev}"
GROUP="${2:?Informe o grupo de destino (prod: vip|open; tcc: tcc; dev: dev)}"

case "$AMBIENTE:$GROUP" in
  prod:vip)  GROUP_ALIAS="tenencia-vip" ;;
  prod:open) GROUP_ALIAS="tenencia-open" ;;
  tcc:tcc)   GROUP_ALIAS="tenencia-tcc" ;;
  dev:dev)   GROUP_ALIAS="tenencia-dev" ;;
  *)
    echo "Combinação inválida: ambiente '$AMBIENTE' com grupo '$GROUP'."
    echo "Aceitas: prod vip | prod open | tcc tcc | dev dev"
    exit 1
    ;;
esac

case "$AMBIENTE" in
  prod) PACKAGE="com.ericasugui.secontrole" ;;
  tcc)  PACKAGE="com.ericasugui.secontrole.tcc" ;;
  dev)  PACKAGE="com.ericasugui.secontrole.dev" ;;
esac

APK_PATH="android/app/build/outputs/apk/${AMBIENTE}/release/app-${AMBIENTE}-release.apk"
GOOGLE_SERVICES="android/app/src/${AMBIENTE}/google-services.json"

if [ ! -f "$APK_PATH" ]; then
  echo "APK não encontrado: $APK_PATH"
  echo "Gere com: npm run android:create:${AMBIENTE} && npm run android:assemble:${AMBIENTE}"
  exit 1
fi

if [ ! -f "$GOOGLE_SERVICES" ]; then
  echo "google-services.json do ambiente não encontrado: $GOOGLE_SERVICES"
  exit 1
fi

# App ID do Firebase do package deste ambiente (lido do google-services.json).
FIREBASE_APP_ID=$(node -e '
  const [arquivo, pacote] = process.argv.slice(1);
  const cfg = require(require("path").resolve(arquivo));
  const cliente = cfg.client.find((c) => c.client_info.android_client_info.package_name === pacote);
  if (!cliente) { console.error(`Package ${pacote} não está em ${arquivo}`); process.exit(1); }
  process.stdout.write(cliente.client_info.mobilesdk_app_id);
' "$GOOGLE_SERVICES" "$PACKAGE")

# Versão lida do app.json — a mesma fonte que o Gradle usa no build.
VERSION_NAME=$(node -p "require('./app.json').expo.version")
VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")

case "$AMBIENTE" in
  prod) NOME="Tenência" ;;
  tcc)  NOME="Tenência TCC" ;;
  dev)  NOME="Tenência DEV" ;;
esac

# Notas opcionais no 3º argumento.
NOTES="${NOME} ${VERSION_NAME} (${VERSION_CODE}) - grupo ${GROUP^^}."
if [ -n "${3:-}" ]; then
  NOTES="${NOTES} ${3}"
fi

echo "Distribuindo ${NOTES}"
echo "App: ${PACKAGE}"
echo "Confira se o APK foi gerado depois do último version:bump."

npx firebase appdistribution:distribute "$APK_PATH" \
  --app "$FIREBASE_APP_ID" \
  --groups "$GROUP_ALIAS" \
  --release-notes "$NOTES"
