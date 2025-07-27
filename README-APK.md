# Instruções para Gerar APK do App Frases Motivacionais

## Pré-requisitos

1. **Node.js e npm** (versão 16 ou superior)
   - Download: https://nodejs.org/

2. **Java Development Kit (JDK) 11 ou 17**
   - Download: https://adoptium.net/

3. **Android Studio**
   - Download: https://developer.android.com/studio
   - Instalar Android SDK (API level 33 ou superior)
   - Configurar ANDROID_HOME nas variáveis de ambiente

4. **Git** (se não tiver)
   - Download: https://git-scm.com/

## Passo a Passo para Gerar o APK

### 1. Instalar Dependências
```bash
# Abra o PowerShell como Administrador e navegue até a pasta do projeto
cd "c:\Users\rafael.araujo\OneDrive - U&M Mineração e construção S A\Documentos\Frases"

# Instalar dependências
npm install
```

### 2. Configurar o Capacitor
```bash
# Inicializar o Capacitor (apenas uma vez)
npx cap init "Frases Motivacionais" "com.frases.app" --web-dir="."

# Adicionar plataforma Android
npx cap add android
```

### 3. Copiar arquivos para Android
```bash
# Sincronizar arquivos web com o projeto Android
npx cap sync
```

### 4. Abrir no Android Studio
```bash
# Abrir o projeto no Android Studio
npx cap open android
```

### 5. Gerar APK no Android Studio

1. No Android Studio, selecione **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Aguarde a compilação
3. O APK será gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

## Comandos Úteis

```bash
# Executar no emulador/device conectado
npm run android:run

# Rebuild completo
npm run sync

# Executar em servidor local para testes
npm run dev
```

## Personalização do App

### Ícone do App
- Coloque seus ícones em: `android-resources/`
- Use o gerador: https://capacitorjs.com/docs/guides/splash-screens-and-icons

### Nome e Versão
- Edite `capacitor.config.json` para alterar nome e ID
- Edite `android/app/build.gradle` para versão

### Permissões
- Edite `android/app/src/main/AndroidManifest.xml` para adicionar permissões

## Distribuição

### APK de Debug (para testes)
- Use o APK gerado em `debug/`

### APK de Release (para publicação)
1. Configure assinatura em `android/app/build.gradle`
2. Build > Generate Signed Bundle / APK
3. Siga o wizard do Android Studio

### Google Play Store
1. Gere um AAB (Android App Bundle): Build > Build Bundle(s)
2. Upload no Google Play Console
3. Configure store listing, preços, distribuição

## Resolução de Problemas

### Erro de SDK
```bash
# Configurar ANDROID_HOME (Windows)
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

### Erro de Permissões
- Verifique se todas as URLs estão usando HTTPS
- Configure `allowMixedContent: true` no capacitor.config.json

### App não abre corretamente
- Verifique se todos os recursos (CSS, JS, imagens) estão sendo carregados
- Use DevTools do Chrome para debug: `chrome://inspect`

## Recursos Adicionais

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia de Deployment Android](https://capacitorjs.com/docs/android/deploying)
- [Ícones e Splash Screens](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
