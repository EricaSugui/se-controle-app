
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

npx firebase appdistribution:distribute "$APK_PATH" \
  --app "$FIREBASE_APP_ID" \
  --groups "$GROUP_ALIAS" \
  --release-notes "Tenência 1.0.0 - Distribuição para o grupo ${GROUP^^}."
