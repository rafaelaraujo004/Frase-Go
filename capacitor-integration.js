// capacitor-integration.js - Integração com funcionalidades nativas do Capacitor

// Importar plugins do Capacitor se disponíveis
let CapacitorApp, CapacitorDevice, CapacitorShare, CapacitorHaptics, CapacitorStatusBar, CapacitorSplashScreen;

// Verificar se está rodando no Capacitor
const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();

// Inicializar plugins se disponível
if (isCapacitor) {
  try {
    CapacitorApp = window.Capacitor.Plugins.App;
    CapacitorDevice = window.Capacitor.Plugins.Device;
    CapacitorShare = window.Capacitor.Plugins.Share;
    CapacitorHaptics = window.Capacitor.Plugins.Haptics;
    CapacitorStatusBar = window.Capacitor.Plugins.StatusBar;
    CapacitorSplashScreen = window.Capacitor.Plugins.SplashScreen;
  } catch (error) {
    console.log('Alguns plugins do Capacitor não estão disponíveis:', error);
  }
}

// Configurações iniciais para app nativo
document.addEventListener('DOMContentLoaded', function() {
  if (isCapacitor) {
    initializeNativeFeatures();
  }
});

// Inicializar funcionalidades nativas
async function initializeNativeFeatures() {
  try {
    // Configurar status bar
    if (CapacitorStatusBar) {
      await CapacitorStatusBar.setStyle({ style: 'DARK' });
      await CapacitorStatusBar.setBackgroundColor({ color: '#3b82f6' });
    }

    // Esconder splash screen após carregamento
    if (CapacitorSplashScreen) {
      setTimeout(async () => {
        await CapacitorSplashScreen.hide();
      }, 2000);
    }

    // Obter informações do device
    if (CapacitorDevice) {
      const deviceInfo = await CapacitorDevice.getInfo();
      console.log('Device Info:', deviceInfo);
      
      // Adaptar UI baseado no device
      adaptUIForDevice(deviceInfo);
    }

    // Listener para quando app volta do background
    if (CapacitorApp) {
      CapacitorApp.addListener('appStateChange', (state) => {
        if (state.isActive) {
          // App voltou ao foreground
          console.log('App ativo novamente');
          // Refresh de dados se necessário
        }
      });

      // Listener para botão voltar do Android
      CapacitorApp.addListener('backButton', (result) => {
        // Verificar se há modais abertos
        const modalsAbertos = document.querySelectorAll('.modal-overlay[style*="flex"], .modal-overlay.ativo');
        const sidebarAberta = document.body.classList.contains('sidebar-usuario-aberta');
        
        if (modalsAbertos.length > 0) {
          // Fechar modal mais recente
          const modalAtivo = modalsAbertos[modalsAbertos.length - 1];
          modalAtivo.style.display = 'none';
          modalAtivo.classList.remove('ativo');
        } else if (sidebarAberta) {
          // Fechar sidebar
          fecharSidebarUsuario();
        } else {
          // Sair do app
          CapacitorApp.exitApp();
        }
      });
    }

  } catch (error) {
    console.error('Erro ao inicializar funcionalidades nativas:', error);
  }
}

// Adaptar UI baseado no device
function adaptUIForDevice(deviceInfo) {
  const body = document.body;
  
  // Adicionar classes CSS baseadas no device
  body.classList.add(`platform-${deviceInfo.platform}`);
  body.classList.add(`model-${deviceInfo.model?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`);
  
  // Ajustes específicos para diferentes devices
  if (deviceInfo.platform === 'android') {
    // Ajustes para Android
    body.classList.add('android-device');
    
    // Ajustar para diferentes versões do Android
    if (deviceInfo.osVersion) {
      const androidVersion = parseInt(deviceInfo.osVersion);
      if (androidVersion >= 12) {
        body.classList.add('android-12-plus');
      }
    }
  }
}

// Função melhorada de compartilhamento usando Capacitor
async function compartilharComCapacitor(texto, titulo = 'Frase Motivacional') {
  if (isCapacitor && CapacitorShare) {
    try {
      await CapacitorShare.share({
        title: titulo,
        text: texto,
        dialogTitle: 'Compartilhar frase'
      });
      
      // Feedback háptico se disponível
      if (CapacitorHaptics) {
        await CapacitorHaptics.impact({ style: 'light' });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      // Fallback para compartilhamento web
      return compartilharWeb(texto, titulo);
    }
  } else {
    // Fallback para web
    return compartilharWeb(texto, titulo);
  }
}

// Fallback para compartilhamento web
function compartilharWeb(texto, titulo) {
  if (navigator.share) {
    return navigator.share({
      title: titulo,
      text: texto
    }).then(() => true).catch(() => false);
  } else {
    // Copiar para clipboard como último recurso
    return navigator.clipboard.writeText(texto)
      .then(() => {
        alert('Frase copiada para a área de transferência!');
        return true;
      })
      .catch(() => {
        // Método manual de cópia
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Frase copiada para a área de transferência!');
        return true;
      });
  }
}

// Feedback háptico para ações
async function feedbackHaptico(tipo = 'light') {
  if (isCapacitor && CapacitorHaptics) {
    try {
      await CapacitorHaptics.impact({ style: tipo }); // light, medium, heavy
    } catch (error) {
      console.log('Haptic feedback não disponível');
    }
  }
}

// Função para detectar se está online
function isOnline() {
  return navigator.onLine;
}

// Listener para mudanças de conectividade
window.addEventListener('online', function() {
  console.log('Conectado à internet');
  // Sincronizar dados se necessário
});

window.addEventListener('offline', function() {
  console.log('Desconectado da internet');
  // Mostrar aviso de offline se necessário
});

// Exportar funções para uso global
window.capacitorIntegration = {
  isCapacitor,
  compartilharComCapacitor,
  feedbackHaptico,
  isOnline
};

// Integrar com funções existentes do app
document.addEventListener('DOMContentLoaded', function() {
  // Substituir função de compartilhar existente se houver
  if (window.copiarTextoComFonte) {
    const originalCopiar = window.copiarTextoComFonte;
    window.copiarTextoComFonte = async function(texto, fonte) {
      // Adicionar feedback háptico
      await feedbackHaptico('light');
      
      // Usar compartilhamento nativo se disponível
      const compartilhado = await compartilharComCapacitor(texto);
      
      if (!compartilhado) {
        // Fallback para função original
        return originalCopiar(texto, fonte);
      }
      
      return true;
    };
  }
  
  // Adicionar feedback háptico aos botões importantes
  const botoesImportantes = document.querySelectorAll('#novaFrase, #btnFavoritar, .coracao-btn, .favoritos-btn');
  botoesImportantes.forEach(botao => {
    botao.addEventListener('click', () => {
      feedbackHaptico('light');
    });
  });
  
  // Feedback mais forte para ações importantes
  const acoesImportantes = document.querySelectorAll('#btnDownloadCard, #btnSalvarUsuario');
  acoesImportantes.forEach(botao => {
    botao.addEventListener('click', () => {
      feedbackHaptico('medium');
    });
  });
});
