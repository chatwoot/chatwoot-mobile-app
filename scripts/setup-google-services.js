#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cria o diretório android/app se não existir
const androidAppDir = path.join(__dirname, '..', 'android', 'app');
if (!fs.existsSync(androidAppDir)) {
  fs.mkdirSync(androidAppDir, { recursive: true });
}

// Caminho do arquivo google-services.json
const googleServicesPath = path.join(androidAppDir, 'google-services.json');

// Se a variável de ambiente estiver definida (do EAS Secret), escreve o conteúdo no arquivo
if (process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE) {
  try {
    // A variável contém o caminho do arquivo, então lemos o conteúdo
    const secretContent = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE;
    
    // Se for um caminho, lemos o arquivo; se for conteúdo JSON direto, usamos diretamente
    if (fs.existsSync(secretContent)) {
      const content = fs.readFileSync(secretContent, 'utf8');
      fs.writeFileSync(googleServicesPath, content, 'utf8');
      console.log('✓ google-services.json copiado do secret para android/app/');
    } else {
      // Assume que é conteúdo JSON direto
      fs.writeFileSync(googleServicesPath, secretContent, 'utf8');
      console.log('✓ google-services.json criado a partir do secret');
    }
  } catch (error) {
    console.error('Erro ao copiar google-services.json:', error);
    process.exit(1);
  }
} else {
  // Se não houver secret, verifica se o arquivo já existe localmente
  if (!fs.existsSync(googleServicesPath)) {
    console.warn('⚠️  EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE não está definido e o arquivo não existe localmente');
  } else {
    console.log('✓ google-services.json já existe localmente');
  }
}

