#!/usr/bin/env node
// Sobe a versão do app em app.json — fonte única lida pelo Gradle
// (android/app/build.gradle) e pelo script de distribuição do Firebase.
//
//   npm run version:bump              → só versionCode +1 (novo build da mesma versão)
//   npm run version:bump -- patch     → 1.0.0 → 1.0.1  e versionCode +1
//   npm run version:bump -- minor     → 1.0.1 → 1.1.0  e versionCode +1
//   npm run version:bump -- major     → 1.1.0 → 2.0.0  e versionCode +1
//
// O versionCode sempre sobe: o Android recusa instalar por cima um APK
// com versionCode menor ou igual ao instalado.

const fs = require('fs');
const path = require('path');

const tipo = process.argv[2] ?? 'build';
const tipos = ['build', 'patch', 'minor', 'major'];

if (!tipos.includes(tipo)) {
  console.error(`Tipo inválido: ${tipo}. Use: ${tipos.join(' | ')}`);
  process.exit(1);
}

const arquivo = path.join(__dirname, '..', 'app.json');
const config = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
const expo = config.expo;

const anterior = `${expo.version} (${expo.android.versionCode})`;

if (tipo !== 'build') {
  let [major, minor, patch] = expo.version.split('.').map(Number);
  if (tipo === 'major') { major += 1; minor = 0; patch = 0; }
  if (tipo === 'minor') { minor += 1; patch = 0; }
  if (tipo === 'patch') { patch += 1; }
  expo.version = `${major}.${minor}.${patch}`;
}

expo.android.versionCode += 1;

fs.writeFileSync(arquivo, JSON.stringify(config, null, 2) + '\n');

console.log(`Versão: ${anterior} → ${expo.version} (${expo.android.versionCode})`);
