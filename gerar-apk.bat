@echo off
echo ========================================
echo    GERADOR DE APK - FRASES APP
echo ========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo 📥 Baixe e instale Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.

REM Verificar se está na pasta correta
if not exist "index.html" (
    echo ❌ Arquivo index.html não encontrado!
    echo 📁 Execute este script na pasta do projeto.
    echo.
    pause
    exit /b 1
)

echo ✅ Projeto encontrado!
echo.

REM Verificar se package.json existe
if not exist "package.json" (
    echo ❌ package.json não encontrado!
    echo 📄 Criando package.json...
    echo.
)

echo 📦 Instalando dependências...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas!
echo.

REM Verificar se Capacitor já foi inicializado
if not exist "capacitor.config.json" (
    echo 🔧 Inicializando Capacitor...
    call npx cap init "Frases Motivacionais" "com.frases.app" --web-dir="."
    if errorlevel 1 (
        echo ❌ Erro ao inicializar Capacitor!
        pause
        exit /b 1
    )
)

echo ✅ Capacitor configurado!
echo.

REM Verificar se Android foi adicionado
if not exist "android" (
    echo 📱 Adicionando plataforma Android...
    call npx cap add android
    if errorlevel 1 (
        echo ❌ Erro ao adicionar Android!
        echo 🔧 Verifique se Android Studio e SDK estão instalados.
        pause
        exit /b 1
    )
)

echo ✅ Plataforma Android adicionada!
echo.

echo 🔄 Sincronizando arquivos...
call npx cap sync
if errorlevel 1 (
    echo ❌ Erro ao sincronizar!
    pause
    exit /b 1
)

echo ✅ Sincronização completa!
echo.

echo 🚀 Abrindo Android Studio...
echo.
echo 📋 PRÓXIMOS PASSOS:
echo    1. Android Studio irá abrir automaticamente
echo    2. Aguarde o projeto carregar completamente
echo    3. Vá em: Build > Build Bundle(s) / APK(s) > Build APK(s)
echo    4. Aguarde a compilação finalizar
echo    5. O APK estará em: android\app\build\outputs\apk\debug\
echo.

call npx cap open android

echo.
echo ✨ PROCESSO CONCLUÍDO!
echo 📱 Seu APK será gerado no Android Studio.
echo.
pause
