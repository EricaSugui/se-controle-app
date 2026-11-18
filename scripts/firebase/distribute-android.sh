
#!/usr/bin/env bash

set -e

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
FIREBASE_APP_ID="1:368017815488:android:1e0bf38203785b48ed7a25"
GROUP="${1:?Informe o grupo de destino: vip, tcc ou open}"

case "$GROUP" in
  vip)
    GROUP_ALIAS="tenencia-vip"
    ;;
  tcc)
    GROUP_ALIAS="tenencia-tcc"
    ;;
  open)
    GROUP_ALIAS="tenencia-open"
    ;;
  *)
    echo "Grupo inválido: $GROUP"
    exit 1
    ;;
esac

if [ ! -f "$APK_PATH" ]; then
  echo "APK não encontrado: $APK_PATH"
  exit 1
fi

# Versão lida do app.json — a mesma fonte que o Gradle usa no build.
VERSION_NAME=$(node -p "require('./app.json').expo.version")
VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")

# Notas opcionais no 2º argumento: npm run android:distribute -- vip "Corrige login"
NOTES="Tenência ${VERSION_NAME} (${VERSION_CODE}) - grupo ${GROUP^^}."
if [ -n "${2:-}" ]; then
  NOTES="${NOTES} ${2}"
fi

echo "Distribuindo ${NOTES}"
echo "Confira se o APK foi gerado depois do último version:bump."

npx firebase appdistribution:distribute "$APK_PATH" \
  --app "$FIREBASE_APP_ID" \
  --groups "$GROUP_ALIAS" \
  --release-notes "$NOTES"
