// --- BLOQUEIO GLOBAL USANDO SUPABASE AUTH ---
const SUPABASE_URL = 'https://lfvfvrpfrphpbsxktazn.supabase.co'; // Substitua pela sua URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdmZ2cnBmcnBocGJzeGt0YXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzgyMzgsImV4cCI6MjA2ODQ1NDIzOH0.aXIRLdSYBt5_ifMAtpKeOV1mnZooqtkWQ7OTqxcg7s4'; // Substitua pela sua anon key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function bloquearApp() {
  document.querySelectorAll('button,select,input,textarea').forEach(el => {
    el.disabled = true;
  });
}
function desbloquearApp() {
  document.querySelectorAll('button,select,input,textarea').forEach(el => {
    el.disabled = false;
  });
}

function mostrarModal(id) {
  // Hide all modals
  document.querySelectorAll('#modalLogin,#modalCadastro,#modalEsqueciSenha').forEach(m => {
    m.style.display = 'none';
    m.classList.remove('active');
  });
  
  // Show the requested modal
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Clear any previous errors and reset form states
    const form = modal.querySelector('form');
    if (form) {
      form.querySelectorAll('.modal-error, .modal-success').forEach(el => el.style.display = 'none');
      form.querySelectorAll('input').forEach(input => {
        input.classList.remove('error');
        input.value = '';
      });
      setFormLoading(form, false);
      
      // Focus on first input
      const firstInput = form.querySelector('input[type="email"], input[type="password"]');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }
}

// Anonymous user support
function isAnonymousUser() {
  return localStorage.getItem('frasego_anonymous') === 'true';
}

function setAnonymousUser(isAnonymous) {
  localStorage.setItem('frasego_anonymous', isAnonymous ? 'true' : 'false');
  if (isAnonymous) {
    localStorage.setItem('frasego_anonymous_started', new Date().toISOString());
  }
}

async function checarSessao() {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Allow anonymous usage
  if (!session && !isAnonymousUser()) {
    bloquearApp();
    mostrarModal('modalLogin');
  } else {
    desbloquearApp();
    document.getElementById('modalLogin').style.display = 'none';
    document.getElementById('modalCadastro').style.display = 'none';
    document.getElementById('modalEsqueciSenha').style.display = 'none';
    
    // Show subtle prompt for anonymous users
    if (isAnonymousUser() && !session) {
      showAnonymousUserPrompts();
    }
  }
}

// Show subtle prompts for anonymous users
function showAnonymousUserPrompts() {
  // Add subtle reminder tooltip near premium button
  const premiumBtn = document.querySelector('#btnAssinarPremium, [id*="premium"], [class*="premium"]');
  if (premiumBtn) {
    premiumBtn.title = "Crie uma conta para salvar seus favoritos e desbloquear recursos exclusivos!";
  }
  
  // Add account benefits reminder after some usage
  const frasesUsadas = Number(localStorage.getItem('frases_hoje')) || 0;
  if (frasesUsadas >= 3) {
    setTimeout(() => {
      showAccountBenefitTooltip();
    }, 2000);
  }
}

function showAccountBenefitTooltip() {
  if (document.querySelector('.account-benefit-tooltip')) return; // Don't show multiple times
  
  const tooltip = document.createElement('div');
  tooltip.className = 'account-benefit-tooltip';
  tooltip.innerHTML = `
    <div class="tooltip-content">
      <span class="tooltip-text">💡 Dica: Crie uma conta para salvar seus favoritos!</span>
      <button class="tooltip-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (tooltip.parentNode) {
      tooltip.remove();
    }
  }, 5000);
}

// Form validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

function setFormLoading(formElement, loading) {
  if (loading) {
    formElement.classList.add('loading');
    formElement.querySelectorAll('button, input').forEach(el => el.disabled = true);
  } else {
    formElement.classList.remove('loading');
    formElement.querySelectorAll('button, input').forEach(el => el.disabled = false);
  }
}

// --- HANDLERS DE AUTENTICAÇÃO ---
document.getElementById('formLogin').addEventListener('submit', async function(e) {
  e.preventDefault();
  hideError('loginErro');
  
  const email = this.loginEmail.value.trim();
  const senha = this.loginSenha.value;
  
  // Validation
  if (!validateEmail(email)) {
    showError('loginErro', 'Por favor, insira um e-mail válido.');
    this.loginEmail.classList.add('error');
    this.loginEmail.focus();
    return;
  }
  
  if (!validatePassword(senha)) {
    showError('loginErro', 'A senha deve ter pelo menos 6 caracteres.');
    this.loginSenha.classList.add('error');
    this.loginSenha.focus();
    return;
  }
  
  // Remove error states
  this.loginEmail.classList.remove('error');
  this.loginSenha.classList.remove('error');
  
  setFormLoading(this, true);
  
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      showError('loginErro', 'Erro ao fazer login: ' + error.message);
    } else {
      // Clear anonymous flag on successful login
      setAnonymousUser(false);
      checarSessao();
    }
  } catch (err) {
    showError('loginErro', 'Erro de conexão. Tente novamente.');
  } finally {
    setFormLoading(this, false);
  }
});

document.getElementById('btnGoogle').addEventListener('click', async function() {
  hideError('loginErro');
  const button = this;
  const originalText = button.innerHTML;
  
  button.disabled = true;
  button.innerHTML = '⏳ Conectando...';
  
  try {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      showError('loginErro', 'Erro ao fazer login com Google: ' + error.message);
    } else {
      // Clear anonymous flag on successful login
      setAnonymousUser(false);
    }
  } catch (err) {
    showError('loginErro', 'Erro de conexão com Google. Tente novamente.');
  } finally {
    button.disabled = false;
    button.innerHTML = originalText;
  }
});

document.getElementById('btnCriarConta').addEventListener('click', function() {
  mostrarModal('modalCadastro');
});
document.getElementById('btnEsqueciSenha').addEventListener('click', function() {
  mostrarModal('modalEsqueciSenha');
});

document.getElementById('formCadastro').addEventListener('submit', async function(e) {
  e.preventDefault();
  hideError('cadastroErro');
  
  const email = this.cadastroEmail.value.trim();
  const senha = this.cadastroSenha.value;
  
  // Validation
  if (!validateEmail(email)) {
    showError('cadastroErro', 'Por favor, insira um e-mail válido.');
    this.cadastroEmail.classList.add('error');
    this.cadastroEmail.focus();
    return;
  }
  
  if (!validatePassword(senha)) {
    showError('cadastroErro', 'A senha deve ter pelo menos 6 caracteres.');
    this.cadastroSenha.classList.add('error');
    this.cadastroSenha.focus();
    return;
  }
  
  // Remove error states
  this.cadastroEmail.classList.remove('error');
  this.cadastroSenha.classList.remove('error');
  
  setFormLoading(this, true);
  
  try {
    const { error } = await supabase.auth.signUp({ email, password: senha });
    if (error) {
      showError('cadastroErro', 'Erro ao criar conta: ' + error.message);
    } else {
      alert('Conta criada! Verifique seu e-mail para confirmar.');
      mostrarModal('modalLogin');
    }
  } catch (err) {
    showError('cadastroErro', 'Erro de conexão. Tente novamente.');
  } finally {
    setFormLoading(this, false);
  }
});

document.getElementById('formEsqueciSenha').addEventListener('submit', async function(e) {
  e.preventDefault();
  hideError('esqueciErro');
  document.getElementById('esqueciSucesso').style.display = 'none';
  
  const email = this.esqueciEmail.value.trim();
  
  // Validation
  if (!validateEmail(email)) {
    showError('esqueciErro', 'Por favor, insira um e-mail válido.');
    this.esqueciEmail.classList.add('error');
    this.esqueciEmail.focus();
    return;
  }
  
  // Remove error state
  this.esqueciEmail.classList.remove('error');
  
  setFormLoading(this, true);
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      showError('esqueciErro', 'Erro ao enviar e-mail: ' + error.message);
    } else {
      const successElement = document.getElementById('esqueciSucesso');
      successElement.textContent = 'E-mail de recuperação enviado! Verifique sua caixa de entrada.';
      successElement.style.display = 'block';
      setTimeout(() => {
        mostrarModal('modalLogin');
      }, 3000);
    }
  } catch (err) {
    showError('esqueciErro', 'Erro de conexão. Tente novamente.');
  } finally {
    setFormLoading(this, false);
  }
});

// Continue without login handler
function continueWithoutLogin() {
  setAnonymousUser(true);
  checarSessao();
}

// Add continue without login button to login modal
function addContinueWithoutLoginButton() {
  const loginForm = document.getElementById('formLogin');
  if (loginForm && !document.getElementById('btnContinuarSemLogin')) {
    const continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.id = 'btnContinuarSemLogin';
    continueBtn.className = 'continue-without-login-btn';
    continueBtn.innerHTML = '🚀 Continuar sem login';
    continueBtn.onclick = continueWithoutLogin;
    
    // Insert before the error div
    const errorDiv = document.getElementById('loginErro');
    loginForm.insertBefore(continueBtn, errorDiv);
  }
}

// Logout handler (adicione um botão de logout se quiser)
window.logoutSupabase = async function() {
  await supabase.auth.signOut();
  checarSessao();
};
// --- Jogo da velha (tags) ---
let iconeJogoDaVelha = document.getElementById('iconeJogoDaVelha');
if (!window._tagsBtnHandlerAdded) {
  window._tagsBtnHandlerAdded = true;
  let btnTags = document.getElementById('btnTags');
  let tagsModal = document.getElementById('tagsModal');
  let fecharTags = document.getElementById('fecharTags');
  btnTags.addEventListener('click', function() {
    iconeJogoDaVelha.style.color = '#444';
    tagsModal.style.display = 'flex';
  });
  fecharTags.addEventListener('click', function() {
    tagsModal.style.display = 'none';
    iconeJogoDaVelha.style.color = '#222';
  });
}
// --- TAGS SUGERIDAS POR TEMA ---
// --- TAGS SUGERIDAS POR TEMA ---
const tagsPorTema = {
    motivacional: [
        ['#Motivação', '#Inspiração', '#Foco', '#Sucesso', '#Determinação', '#Acredite', '#Persistência', '#Atitude', '#Força', '#Vencer'],
        ['#Motivation', '#Mindset', '#NeverGiveUp', '#DreamBig', '#Goal', '#Power', '#Believe', '#Growth', '#Discipline', '#Action'],
        ['#Motivacional', '#FrasesMotivacionais', '#Autoestima', '#Superação', '#Desenvolvimento', '#Confiança', '#Coragem', '#Meta', '#Progresso', '#Realização']
    ],
    amor: [
        ['#Amor', '#Love', '#Romance', '#Coração', '#Paixão', '#Sentimento', '#Juntos', '#Casal', '#Carinho', '#TeAmo'],
        ['#Relacionamento', '#Namorados', '#AmorEterno', '#AmorPróprio', '#Felicidade', '#Companheirismo', '#Beijo', '#AmorVerdadeiro', '#AmorDaMinhaVida', '#AmorSemFim'],
        ['#FrasesDeAmor', '#AmorInfinito', '#AmorÉTudo', '#AmorReal', '#AmorPraVidaToda', '#AmorQueInspira', '#AmorQueTransborda', '#AmorSimples', '#AmorPuro', '#AmorSincero']
    ],
    amizade: [
        ['#Amizade', '#Amigos', '#Friendship', '#Parceiros', '#Companheirismo', '#Confiança', '#Diversão', '#Risos', '#Lealdade', '#Gratidão'],
        ['#BestFriends', '#BFF', '#AmizadeVerdadeira', '#AmigosParaSempre', '#AmizadeÉTudo', '#AmizadeSincera', '#AmizadeReal', '#AmigosDeVerdade', '#AmizadeColorida', '#AmizadeLinda'],
        ['#FrasesDeAmizade', '#AmizadeForte', '#AmizadeÉAmor', '#AmizadeInfinita', '#AmizadeTop', '#AmizadeÉVida', '#AmizadeÉAlegria', '#AmizadeÉCompanhia', '#AmizadeÉConfiança', '#AmizadeÉLealdade']
    ],
    felicidade: [
        ['#Felicidade', '#Sorriso', '#Alegria', '#ViverBem', '#Gratidão', '#Feliz', '#GoodVibes', '#Paz', '#Leveza', '#BemEstar'],
        ['#Happy', '#Smile', '#Happiness', '#Joy', '#PositiveVibes', '#FelicidadePlena', '#FelicidadeÉTudo', '#FelicidadeReal', '#FelicidadeSempre', '#FelicidadeSimples'],
        ['#FrasesDeFelicidade', '#FelicidadeÉ', '#FelicidadeÉAmor', '#FelicidadeÉVida', '#FelicidadeÉAlegria', '#FelicidadeÉPaz', '#FelicidadeÉGratidão', '#FelicidadeÉSorrir', '#FelicidadeÉSer', '#FelicidadeÉEstar']
    ],
    superacao: [
        ['#Superação', '#Força', '#Coragem', '#Vencer', '#Desafio', '#Resiliência', '#Determinação', '#Motivação', '#Persistência', '#Superar'],
        ['#Superar', '#Superacao', '#Desafios', '#Vitoria', '#Luta', '#NuncaDesista', '#Acredite', '#Foco', '#Meta', '#Objetivo'],
        ['#FrasesDeSuperação', '#SuperaçãoÉTudo', '#SuperaçãoÉVida', '#SuperaçãoÉForça', '#SuperaçãoÉCoragem', '#SuperaçãoÉFé', '#SuperaçãoÉEsperança', '#SuperaçãoÉDeterminação', '#SuperaçãoÉMotivação', '#SuperaçãoÉConquista']
    ],
    gratidao: [
        ['#Gratidão', '#Agradecer', '#Blessed', '#Thankful', '#Grateful', '#Vida', '#Felicidade', '#Paz', '#Amor', '#Alegria'],
        ['#GratidãoSempre', '#GratidãoÉTudo', '#GratidãoÉVida', '#GratidãoÉAmor', '#GratidãoÉFelicidade', '#GratidãoÉPaz', '#GratidãoÉAlegria', '#GratidãoÉSer', '#GratidãoÉEstar', '#GratidãoÉSorrir'],
        ['#FrasesDeGratidão', '#GratidãoNoCoração', '#GratidãoPelaVida', '#GratidãoPeloAmor', '#GratidãoPelaFamília', '#GratidãoPelosAmigos', '#GratidãoPelasBênçãos', '#GratidãoPelosMomentos', '#GratidãoPelasConquistas', '#GratidãoPelosDesafios']
    ],
    reflexao: [
        ['#Reflexão', '#Pensar', '#Sabedoria', '#Aprendizado', '#Crescimento', '#Autoconhecimento', '#Mente', '#Vida', '#Paz', '#Inspiração'],
        ['#Refletir', '#Reflexao', '#Pensamentos', '#FrasesDeReflexão', '#ReflexãoDoDia', '#ReflexãoDaVida', '#ReflexãoÉTudo', '#ReflexãoÉVida', '#ReflexãoÉAmor', '#ReflexãoÉFelicidade'],
        ['#ReflexãoÉPaz', '#ReflexãoÉSabedoria', '#ReflexãoÉAprendizado', '#ReflexãoÉCrescimento', '#ReflexãoÉAutoconhecimento', '#ReflexãoÉMente', '#ReflexãoÉInspiração', '#ReflexãoÉPensar', '#ReflexãoÉSer', '#ReflexãoÉEstar']
    ],
    sucesso: [
        ['#Sucesso', '#Vencer', '#Conquista', '#Meta', '#Objetivo', '#Foco', '#Determinação', '#Motivação', '#Trabalho', '#Realização'],
        ['#SucessoProfissional', '#SucessoPessoal', '#SucessoNaVida', '#SucessoÉTudo', '#SucessoÉVida', '#SucessoÉAmor', '#SucessoÉFelicidade', '#SucessoÉPaz', '#SucessoÉAlegria', '#SucessoÉSer'],
        ['#FrasesDeSucesso', '#SucessoNoTrabalho', '#SucessoNosNegócios', '#SucessoNaCarreira', '#SucessoNosEstudos', '#SucessoNosProjetos', '#SucessoNosSonhos', '#SucessoNasMetas', '#SucessoNasConquistas', '#SucessoNasVitórias']
    ],
    familia: [
        ['#Família', '#Amor', '#União', '#Lar', '#Proteção', '#Cuidado', '#Gratidão', '#Felicidade', '#Apoio', '#Companheirismo'],
        ['#FamíliaÉTudo', '#FamíliaÉAmor', '#FamíliaÉUnião', '#FamíliaÉLar', '#FamíliaÉProteção', '#FamíliaÉCuidado', '#FamíliaÉGratidão', '#FamíliaÉFelicidade', '#FamíliaÉApoio', '#FamíliaÉCompanheirismo'],
        ['#FrasesDeFamília', '#FamíliaLinda', '#FamíliaFeliz', '#FamíliaUnida', '#FamíliaAbençoada', '#FamíliaMaravilhosa', '#FamíliaQuerida', '#FamíliaEspecial', '#FamíliaTop', '#FamíliaNota10']
    ],
    inspiração: [
        ['#Inspiração', '#Motivação', '#Criatividade', '#Ideias', '#Sonhos', '#Objetivos', '#Foco', '#Determinação', '#Sucesso', '#Realização'],
        ['#Inspirar', '#Inspiracao', '#Inspire', '#InspireSe', '#InspiraçãoDoDia', '#InspiraçãoDaVida', '#InspiraçãoÉTudo', '#InspiraçãoÉVida', '#InspiraçãoÉAmor', '#InspiraçãoÉFelicidade'],
        ['#FrasesDeInspiração', '#InspiraçãoNoTrabalho', '#InspiraçãoNosEstudos', '#InspiraçãoNaVida', '#InspiraçãoNosSonhos', '#InspiraçãoNosProjetos', '#InspiraçãoNosDesafios', '#InspiraçãoNosMomentos', '#InspiraçãoNasConquistas', '#InspiraçãoNasVitórias']
    ]
};

// --- Elementos principais ---
const btnTags = document.getElementById('btnTags');
const tagsModal = document.getElementById('tagsModal');
const tagsLacunas = document.getElementById('tagsLacunas');
const fecharTags = document.getElementById('fecharTags');
const temaSelect = document.getElementById('temaSelect');
const fraseDiv = document.getElementById('fraseApp');
const fonteSelect = document.getElementById('fonteSelect');
const novaFraseBtn = document.getElementById('novaFrase');
const voltarFraseBtn = document.getElementById('voltarFrase');
const btnFavoritar = document.getElementById('btnFavoritar');
const coracaoIcon = document.getElementById('coracaoIcon');
const btnFavoritos = document.getElementById('btnFavoritos');
const favoritosModal = document.getElementById('favoritosModal');
const favoritosLista = document.getElementById('favoritosLista');
const fecharFavoritos = document.getElementById('fecharFavoritos');

// --- Função para exibir hashtags ---
if (btnTags) {
    btnTags.addEventListener('click', () => {
        const tema = temaSelect.value;
        tagsLacunas.innerHTML = '';
        let tagsTema = tagsPorTema[tema] || tagsPorTema['motivacional'];
        tagsTema.forEach((tags) => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'space-between';
            div.style.gap = '0.5rem';
            div.style.background = '#f7f7f7';
            div.style.borderRadius = '0.7rem';
            div.style.padding = '0.7rem 0.7rem 0.7rem 1rem';
            div.style.fontSize = '0.98rem';
            div.style.marginBottom = '0.2rem';
            const tagsStr = tags.join(' ');
            const span = document.createElement('span');
            span.textContent = tagsStr;
            span.style.flex = '1';
            const btnCopiar = document.createElement('button');
            btnCopiar.className = 'copiar-fav-btn';
            btnCopiar.title = 'Copiar tags';
            btnCopiar.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
            btnCopiar.addEventListener('click', () => {
                copiarTextoComFonte(tagsStr, '');
            });
            div.appendChild(span);
            div.appendChild(btnCopiar);
            tagsLacunas.appendChild(div);
        });
        tagsModal.style.display = 'flex';
        if (typeof iconeJogoDaVelha !== 'undefined' && iconeJogoDaVelha) {
          iconeJogoDaVelha.style.color = '#444';
        }
    });
}
if (fecharTags) {
    fecharTags.addEventListener('click', () => {
        tagsModal.style.display = 'none';
        if (typeof iconeJogoDaVelha !== 'undefined' && iconeJogoDaVelha) {
          iconeJogoDaVelha.style.color = '#222';
        }
    });
}

function copiarTextoComFonte(texto, fonte) {
    if (!texto) return;
    const el = document.createElement('textarea');
    el.value = texto;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Copiado para a área de transferência!' + (fonte ? `\nFonte: ${fonte}` : ''));
}

// --- Frases por tema ---
const frases = {
    versiculo: [
        "O temor do Senhor é o princípio do conhecimento, mas os insensatos desprezam a sabedoria e a disciplina. (Provérbios 1:7)",
        "Filho meu, ouve a instrução de teu pai e não deixes o ensino de tua mãe. (Provérbios 1:8)",
        "Se te convidarem os pecadores, não consintas. (Provérbios 1:10)",
        "O Senhor dá a sabedoria; da sua boca procedem o conhecimento e o entendimento. (Provérbios 2:6)",
        "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. (Provérbios 3:5)",
        "Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas. (Provérbios 3:6)",
        "Não sejas sábio a teus próprios olhos; teme ao Senhor e aparta-te do mal. (Provérbios 3:7)",
        "Honra ao Senhor com os teus bens e com as primícias de toda a tua renda. (Provérbios 3:9)",
        "Filho meu, não rejeites a disciplina do Senhor, nem te enfades da sua repreensão. (Provérbios 3:11)",
        "O Senhor repreende a quem ama, assim como o pai ao filho a quem quer bem. (Provérbios 3:12)",
        "Feliz o homem que acha sabedoria, e o homem que adquire conhecimento. (Provérbios 3:13)",
        "O seu lucro é melhor do que o lucro da prata, e a sua renda melhor do que o ouro mais fino. (Provérbios 3:14)",
        "Ela é mais preciosa do que rubis; tudo o que podes desejar não se compara a ela. (Provérbios 3:15)",
        "O Senhor, com sabedoria, fundou a terra; com entendimento estabeleceu os céus. (Provérbios 3:19)",
        "Não te furtes a fazer o bem a quem de direito, estando na tua mão o poder de fazê-lo. (Provérbios 3:27)",
        "Não digas ao teu próximo: Vai e volta amanhã, então to darei, se o tens agora contigo. (Provérbios 3:28)",
        "Não tenhas inveja do homem violento, nem escolhas nenhum dos seus caminhos. (Provérbios 3:31)",
        "O Senhor abençoa a habitação dos justos. (Provérbios 3:33)",
        "Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as fontes da vida. (Provérbios 4:23)",
        "O caminho dos justos é como a luz da aurora, que brilha mais e mais até ser dia perfeito. (Provérbios 4:18)",
        "Não entres na vereda dos ímpios, nem andes pelo caminho dos maus. (Provérbios 4:14)",
        "Atenta para as minhas palavras, inclina o teu ouvido às minhas instruções. (Provérbios 4:20)",
        "Afasta de ti a falsidade da boca e afasta de ti a perversidade dos lábios. (Provérbios 4:24)",
        "Olhem os teus olhos direitos, e as tuas pálpebras diretamente diante de ti. (Provérbios 4:25)",
        "Pondera a vereda de teus pés, e todos os teus caminhos sejam retos. (Provérbios 4:26)",
        "Não declines nem para a direita nem para a esquerda; retira o teu pé do mal. (Provérbios 4:27)",
        "Filho meu, atende à minha sabedoria, à minha inteligência inclina o teu ouvido. (Provérbios 5:1)",
        "Os caminhos do homem estão perante os olhos do Senhor, e ele considera todas as suas veredas. (Provérbios 5:21)",
        "Vai ter com a formiga, ó preguiçoso, olha para os seus caminhos e sê sábio. (Provérbios 6:6)",
        "A soberba precede a ruína, e a altivez do espírito precede a queda. (Provérbios 16:18)",
        "O coração do homem pode fazer planos, mas a resposta certa dos lábios vem do Senhor. (Provérbios 16:1)",
        "O coração alegre aformoseia o rosto, mas pela dor do coração o espírito se abate. (Provérbios 15:13)",
        "A resposta branda desvia o furor, mas a palavra dura suscita a ira. (Provérbios 15:1)",
        "O temor do Senhor é fonte de vida, para evitar os laços da morte. (Provérbios 14:27)",
        "A mulher sábia edifica a sua casa, mas a insensata, com as próprias mãos, a derruba. (Provérbios 14:1)",
        "O que anda em sinceridade teme ao Senhor, mas o que se desvia de seus caminhos o despreza. (Provérbios 14:2)",
        "A resposta suave acalma o furor, mas a palavra dura aumenta a raiva. (Provérbios 15:1)",
        "O que guarda a sua boca conserva a sua alma, mas o que muito abre os lábios a si mesmo se arruína. (Provérbios 13:3)",
        "O que anda com os sábios será sábio, mas o companheiro dos tolos sofrerá aflição. (Provérbios 13:20)",
        "A esperança adiada faz adoecer o coração, mas o desejo cumprido é árvore de vida. (Provérbios 13:12)",
        "O justo aborrece a palavra de mentira, mas o ímpio faz vergonha e se desonra. (Provérbios 13:5)",
        "O que despreza o próximo é falto de senso, mas o homem prudente se cala. (Provérbios 11:12)",
        "O que semeia a justiça terá recompensa fiel. (Provérbios 11:18)",
        "O que confia nas suas riquezas cairá, mas os justos reverdecerão como a folhagem. (Provérbios 11:28)",
        "O que ganha almas é sábio. (Provérbios 11:30)",
        "A bênção do Senhor é que enriquece, e ele não acrescenta dores. (Provérbios 10:22)",
        "O justo nunca será abalado, mas os ímpios não habitarão a terra. (Provérbios 10:30)",
        "O ódio excita contendas, mas o amor cobre todas as transgressões. (Provérbios 10:12)",
        "O caminho do Senhor é fortaleza para os íntegros, mas ruína para os que praticam a iniquidade. (Provérbios 10:29)",
        "O que anda em integridade anda seguro, mas o que perverte os seus caminhos será conhecido. (Provérbios 10:9)",
        "O preguiçoso deseja e nada tem, mas a alma dos diligentes se farta. (Provérbios 13:4)",
        "O que encobre as suas transgressões nunca prosperará, mas o que as confessa e deixa alcançará misericórdia. (Provérbios 28:13)",
        "O que confia no seu próprio coração é insensato, mas o que anda em sabedoria será salvo. (Provérbios 28:26)",
        "O que repreende o homem achará depois mais favor do que aquele que lisonjeia com a língua. (Provérbios 28:23)",
        "O que anda em sinceridade será salvo, mas o perverso em seus caminhos cairá logo. (Provérbios 28:18)",
        "O que tapa o ouvido ao clamor do pobre também clamará e não será ouvido. (Provérbios 21:13)",
        "O que segue a justiça e a bondade achará a vida, a justiça e a honra. (Provérbios 21:21)",
        "Melhor é o pouco com justiça do que grandes rendimentos com injustiça. (Provérbios 16:8)",
        "O que guarda a sua boca e a sua língua guarda a sua alma das angústias. (Provérbios 21:23)",
        "O que ama a pureza de coração e é amável de lábios terá por amigo o rei. (Provérbios 22:11)",
        "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele. (Provérbios 22:6)",
        "Não te associes com o iracundo, nem andes com o homem colérico. (Provérbios 22:24)",
        "Não removas os antigos limites que teus pais fizeram. (Provérbios 22:28)",
        "Não te glories do dia de amanhã, porque não sabes o que produzirá o dia. (Provérbios 27:1)",
        "Como o ferro com ferro se afia, assim o homem afia o rosto do seu amigo. (Provérbios 27:17)",
        "O homem que tem muitos amigos pode congratular-se, mas há amigo mais chegado do que um irmão. (Provérbios 18:24)",
        "A resposta branda desvia o furor, mas a palavra dura suscita a ira. (Provérbios 15:1)",
        "O coração alegre aformoseia o rosto, mas pela dor do coração o espírito se abate. (Provérbios 15:13)",
        "O que atenta prudentemente para o ensino achará o bem, e o que confia no Senhor, esse é feliz. (Provérbios 16:20)",
        "O que guarda a sua boca conserva a sua alma, mas o que muito abre os lábios a si mesmo se arruína. (Provérbios 13:3)",
        "O que anda com os sábios será sábio, mas o companheiro dos tolos sofrerá aflição. (Provérbios 13:20)",
        "A esperança adiada faz adoecer o coração, mas o desejo cumprido é árvore de vida. (Provérbios 13:12)",
        "O justo aborrece a palavra de mentira, mas o ímpio faz vergonha e se desonra. (Provérbios 13:5)",
        "O que despreza o próximo é falto de senso, mas o homem prudente se cala. (Provérbios 11:12)",
        "O que semeia a justiça terá recompensa fiel. (Provérbios 11:18)",
        "O que confia nas suas riquezas cairá, mas os justos reverdecerão como a folhagem. (Provérbios 11:28)",
        "O que ganha almas é sábio. (Provérbios 11:30)",
        "A bênção do Senhor é que enriquece, e ele não acrescenta dores. (Provérbios 10:22)",
        "O justo nunca será abalado, mas os ímpios não habitarão a terra. (Provérbios 10:30)",
        "O ódio excita contendas, mas o amor cobre todas as transgressões. (Provérbios 10:12)",
        "O caminho do Senhor é fortaleza para os íntegros, mas ruína para os que praticam a iniquidade. (Provérbios 10:29)",
        "O que anda em integridade anda seguro, mas o que perverte os seus caminhos será conhecido. (Provérbios 10:9)",
        "O preguiçoso deseja e nada tem, mas a alma dos diligentes se farta. (Provérbios 13:4)",
        "O que encobre as suas transgressões nunca prosperará, mas o que as confessa e deixa alcançará misericórdia. (Provérbios 28:13)",
        "O que confia no seu próprio coração é insensato, mas o que anda em sabedoria será salvo. (Provérbios 28:26)",
        "O que repreende o homem achará depois mais favor do que aquele que lisonjeia com a língua. (Provérbios 28:23)",
        "O que anda em sinceridade será salvo, mas o perverso em seus caminhos cairá logo. (Provérbios 28:18)",
        "O que tapa o ouvido ao clamor do pobre também clamará e não será ouvido. (Provérbios 21:13)",
        "O que segue a justiça e a bondade achará a vida, a justiça e a honra. (Provérbios 21:21)",
        "Melhor é o pouco com justiça do que grandes rendimentos com injustiça. (Provérbios 16:8)",
        "O que guarda a sua boca e a sua língua guarda a sua alma das angústias. (Provérbios 21:23)",
        "O que ama a pureza de coração e é amável de lábios terá por amigo o rei. (Provérbios 22:11)",
        "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele. (Provérbios 22:6)",
        "Não te associes com o iracundo, nem andes com o homem colérico. (Provérbios 22:24)",
        "Não removas os antigos limites que teus pais fizeram. (Provérbios 22:28)",
        "Não te glories do dia de amanhã, porque não sabes o que produzirá o dia. (Provérbios 27:1)",
        "Como o ferro com ferro se afia, assim o homem afia o rosto do seu amigo. (Provérbios 27:17)",
        "O homem que tem muitos amigos pode congratular-se, mas há amigo mais chegado do que um irmão. (Provérbios 18:24)",
        // ...adicione mais versículos de Provérbios até completar 150...
    ],
    motivacional: [
       "Acredite em você e tudo será possível.",
    "O sucesso é a soma de pequenos esforços repetidos diariamente.",
    "Não desista, grandes coisas levam tempo.",
    "A persistência realiza o impossível.",
    "Você é mais forte do que imagina.",
    "Transforme sonhos em metas e metas em conquistas.",
    "A coragem é a chave para grandes realizações.",
    "Cada dia é uma nova chance de recomeçar.",
    "O impossível é apenas uma opinião.",
    "Acredite no seu potencial e vá além.",
    // +50 frases extras:
    "A disciplina é a ponte entre metas e conquistas.",
    "Seja a energia que você quer atrair.",
    "Sucesso é a soma de preparação com oportunidade.",
    "O esforço de hoje é a vitória de amanhã.",
    "O medo é temporário, o arrependimento é para sempre.",
    "Faça acontecer, não espere acontecer.",
    "Você pode muito mais do que pensa.",
    "Toda jornada começa com o primeiro passo.",
    "O limite é você quem coloca.",
    "Acredite no processo, confie no resultado.",
    "A única barreira real é aquela que você aceita.",
    "Levante mais forte a cada queda.",
    "Foque no progresso, não na perfeição.",
    "O sucesso é para quem nunca desiste.",
    "Não tenha medo de recomeçar.",
    "A vitória é para quem persiste.",
    "Cada desafio é uma lição disfarçada.",
    "Seu esforço vai valer a pena.",
    "Motivação nasce da ação.",
    "A mente é seu maior aliado ou inimigo.",
    "Você é capaz de tudo que imaginar.",
    "Ação e foco são armas poderosas.",
    "Sua força está dentro de você.",
    "Fracasso é só um degrau para o sucesso.",
    "O trabalho duro supera o talento quando o talento não trabalha duro.",
    "Sonhe grande, trabalhe duro, realize mais.",
    "Seja protagonista da sua história.",
    "A mudança começa em você.",
    "A persistência vence a resistência.",
    "Nunca subestime seu potencial.",
    "A melhor preparação é a prática constante.",
    "Transforme obstáculos em oportunidades.",
    "O maior investimento é em você mesmo.",
    "Faça o que precisa ser feito, mesmo quando não quer.",
    "Grandes conquistas exigem grandes esforços.",
    "A motivação é a faísca, a disciplina é o fogo.",
    "Não pare até se orgulhar.",
    "Atitude determina a sua altitude.",
    "A determinação é a chave do sucesso.",
    "Acredite no impossível e faça acontecer.",
    "Seu maior rival é você mesmo.",
    "Mude seus pensamentos para mudar sua vida.",
    "O sucesso começa na mente.",
    "Cada dia é uma nova oportunidade.",
    "O esforço contínuo traz resultados duradouros.",
    "Tenha foco, força e fé.",
    "A vida recompensa os corajosos.",
    "Faça mais do que o esperado.",
    "Não desista até se sentir orgulhoso.",
    "Transforme seus sonhos em realidade.",
    "Seja a melhor versão de si mesmo.",
    "O futuro é construído hoje.",
    "Você tem tudo para vencer."
    ],
    amor: [
         "O amor é a resposta para tudo.",
    "Amar é enxergar o outro com o coração.",
    "O amor verdadeiro não se desgasta.",
    "Onde há amor, há vida.",
    "O amor transforma o mundo.",
    // +50 frases extras:
    "Amar é encontrar no outro a extensão da sua alma.",
    "O amor não se mede, se sente.",
    "Amor é o alimento da alma.",
    "O amor cura feridas invisíveis.",
    "Amar é aceitar as imperfeições.",
    "O amor verdadeiro é liberdade e respeito.",
    "No amor, pequenos gestos fazem grandes diferenças.",
    "Amor é a base da felicidade.",
    "Amar é dar sem esperar nada em troca.",
    "O amor fortalece os corações.",
    "O amor é o maior presente que podemos dar.",
    "Amar é aprender e crescer juntos.",
    "O amor é paciente, o amor é gentil.",
    "Amor é luz nos dias escuros.",
    "Quem ama de verdade nunca está sozinho.",
    "Amor é compreender sem julgar.",
    "O amor é poesia em movimento.",
    "Amor é o elo que une vidas.",
    "Amar é estar presente, mesmo na distância.",
    "O amor transforma o ordinário em extraordinário.",
    "Amor é cuidar sem sufocar.",
    "O verdadeiro amor inspira liberdade.",
    "Amar é confiar e ser confiável.",
    "O amor supera qualquer obstáculo.",
    "Amor é compartilhar sonhos e esperanças.",
    "O amor é um refúgio seguro.",
    "Amar é sorrir com o coração.",
    "Amor é a linguagem universal.",
    "O amor não se explica, se vive.",
    "Amar é ter coragem para ser vulnerável.",
    "O amor é fonte de paz interior.",
    "Amor é sentir o outro mesmo quando distante.",
    "O amor floresce na sinceridade.",
    "Amar é um ato de coragem diária.",
    "O amor é o sol que aquece a alma.",
    "Amar é o mais belo gesto de generosidade.",
    "O amor verdadeiro respeita o tempo e o espaço.",
    "Amor é mais que palavras, é atitude.",
    "Amar é encontrar um lar no coração do outro.",
    "O amor é uma viagem sem destino final.",
    "Amar é querer o melhor para o outro.",
    "O amor constrói pontes e derruba muros.",
    "Amar é uma escolha que se renova a cada dia.",
    "O amor não tem limites nem fronteiras.",
    "Amar é sentir-se completo no outro.",
    "O amor é um presente que recebemos e damos.",
    "Amor é a essência da vida.",
    "Amar é abraçar a alma do outro.",
    "O amor é a maior força do universo."
    ],
    amizade: [
        "Amigos tornam os momentos especiais.",
    "A amizade é o conforto de saber que existe alguém por você.",
    "Amizade verdadeira é para sempre.",
    "Rir com amigos é o melhor remédio.",
    "Amigos são a família que escolhemos.",
    // +50 frases extras:
    "A verdadeira amizade é um tesouro eterno.",
    "Amigos são luz nos dias mais sombrios.",
    "Na amizade, a sinceridade é o maior presente.",
    "Amizade é um porto seguro para a alma.",
    "Os amigos são a família da alma.",
    "Amizade é dar sem esperar nada em troca.",
    "Amigos tornam a jornada da vida mais leve.",
    "A amizade é a base da confiança.",
    "Amigos verdadeiros são raros e preciosos.",
    "Amizade é cultivar carinho e respeito.",
    "A amizade ultrapassa tempo e distância.",
    "Com amigos, os momentos simples viram especiais.",
    "A amizade é um laço que o tempo não desfaz.",
    "Amigos são os irmãos que a vida nos dá.",
    "A amizade verdadeira é feita de apoio e cumplicidade.",
    "Amigos são reflexos da nossa própria alma.",
    "A amizade é um presente que devemos cuidar.",
    "Amigos escutam o que o coração diz sem palavras.",
    "Amizade é saber que você nunca está sozinho.",
    "Os melhores amigos são aqueles que nos fazem crescer.",
    "Amizade é uma fonte inesgotável de alegria.",
    "Com amigos, a vida ganha cores mais vibrantes.",
    "A amizade verdadeira é baseada na honestidade.",
    "Amigos aceitam você como você é.",
    "Na amizade, a felicidade é multiplicada.",
    "Amizade é uma ponte que une corações.",
    "Amigos nos ajudam a encontrar nosso melhor.",
    "A amizade é um elo que nunca se rompe.",
    "Amigos são o suporte em tempos difíceis.",
    "A amizade é luz que nunca se apaga.",
    "Amigos são a alegria que o coração deseja.",
    "Na amizade, cada momento vale ouro.",
    "Amigos são o sorriso que o dia precisa.",
    "Amizade é entender sem precisar explicar.",
    "Amigos verdadeiros permanecem na memória e no coração.",
    "Amizade é um tesouro que o tempo não desgasta.",
    "Amigos são os guardiões da nossa história.",
    "A amizade é um jardim que precisa ser cultivado.",
    "Amigos nos inspiram a sermos melhores.",
    "Na amizade, encontramos força e coragem.",
    "Amizade é o presente mais valioso da vida.",
    "Amigos verdadeiros compartilham sonhos e dores.",
    "A amizade é um elo de amor e respeito.",
    "Amigos fazem a vida mais leve e feliz.",
    "Na amizade, o coração encontra paz.",
    "Amizade é uma luz que guia nossos passos.",
    "Amigos são a família escolhida do coração.",
    "A amizade é um abrigo seguro contra as tempestades.",
    "Amigos são o apoio que precisamos para crescer.",
    "A amizade verdadeira é um compromisso do coração."
    ],
    felicidade: [
        "A felicidade está nas pequenas coisas.",
    "Sorria, a vida retribui.",
    "Ser feliz é uma escolha diária.",
    "A felicidade contagia quem está por perto.",
    "A gratidão é o caminho para a felicidade.",
    // +50 frases extras:
    "A felicidade é feita de momentos simples.",
    "Ser feliz é valorizar o que se tem.",
    "A felicidade começa dentro de você.",
    "Cultive alegria e colha felicidade.",
    "A felicidade é um estado de espírito.",
    "Felicidade verdadeira é paz interior.",
    "A felicidade não é destino, é jornada.",
    "Rir é a melhor expressão da felicidade.",
    "A felicidade é a soma de bons pensamentos.",
    "Sorrir transforma o dia mais difícil.",
    "A felicidade está na aceitação do presente.",
    "Ser feliz é estar em harmonia consigo mesmo.",
    "A felicidade é o reflexo do amor-próprio.",
    "Felicidade é agradecer por cada amanhecer.",
    "Pequenos gestos podem trazer grande felicidade.",
    "A felicidade é feita de escolhas conscientes.",
    "A felicidade cresce quando compartilhada.",
    "O segredo da felicidade é a gratidão.",
    "Felicidade é saber encontrar beleza no cotidiano.",
    "A felicidade é a luz que ilumina o coração.",
    "Ser feliz é estar em paz com suas decisões.",
    "Felicidade é a liberdade de ser você mesmo.",
    "A felicidade verdadeira vem de dentro.",
    "Ser feliz é viver com propósito e paixão.",
    "Felicidade é a simplicidade valorizada.",
    "A felicidade está em amar e ser amado.",
    "A felicidade se multiplica quando dividida.",
    "Ser feliz é cultivar bons relacionamentos.",
    "Felicidade é encontrar motivos para sorrir todos os dias.",
    "A felicidade é o combustível da alma.",
    "Ser feliz é viver o presente com plenitude.",
    "A felicidade é a melhor maquiagem da vida.",
    "Felicidade é aceitar a imperfeição e amar o processo.",
    "A felicidade se constrói com atitudes positivas.",
    "Ser feliz é deixar ir o que não pode ser controlado.",
    "A felicidade é um convite diário para o amor.",
    "Felicidade é coragem para ser vulnerável.",
    "Ser feliz é abraçar a vida com entusiasmo.",
    "A felicidade é a recompensa da mente tranquila.",
    "Felicidade é um estado que se cultiva com cuidado.",
    "Ser feliz é reconhecer a beleza das pequenas coisas.",
    "A felicidade é a soma das escolhas certas.",
    "Felicidade é agradecer pelas lições da vida.",
    "Ser feliz é viver com esperança no coração.",
    "A felicidade é a arte de viver em equilíbrio.",
    "Felicidade é ser grato pelo presente.",
    "Ser feliz é contagiar o mundo com sua luz.",
    "A felicidade é o resultado do amor-próprio.",
    "Felicidade é encontrar paz mesmo nos desafios.",
    "Ser feliz é celebrar a vida em cada instante."
    ],
    superação: [
        "A superação começa com a decisão de tentar.",
    "Desafios existem para serem vencidos.",
    "Cada obstáculo é uma oportunidade de crescer.",
    "A força está dentro de você.",
    "Acredite: você é capaz de superar tudo.",
    // +50 frases extras:
    "Superar é transformar dor em aprendizado.",
    "A vitória é fruto da persistência.",
    "Quando tudo parece difícil, a superação aparece.",
    "Os maiores guerreiros são os que nunca desistem.",
    "Cada queda é um convite para levantar mais forte.",
    "A superação é a chave para a liberdade.",
    "O desafio fortalece o caráter.",
    "A força verdadeira nasce na adversidade.",
    "Superar é mais do que vencer, é aprender.",
    "Você é maior do que qualquer obstáculo.",
    "O caminho da superação é feito de coragem.",
    "O sucesso pertence aos que resistem.",
    "Superar é acreditar mesmo quando não vê.",
    "A dor é passageira, a superação é eterna.",
    "Toda tempestade traz um novo amanhecer.",
    "Não tema o fracasso, tema não tentar.",
    "Superar é um ato diário de fé.",
    "Você tem o poder de mudar sua história.",
    "A superação é o combustível do crescimento.",
    "O impossível é só uma barreira a ser quebrada.",
    "Desafios nos moldam para o sucesso.",
    "A superação é uma conquista interna.",
    "Seja mais forte que suas desculpas.",
    "Superar é persistir mesmo sem ver o fim.",
    "O verdadeiro guerreiro não se rende.",
    "Na luta, descobrimos nossa verdadeira força.",
    "Superar é transformar medo em ação.",
    "Cada passo é uma vitória contra o impossível.",
    "Sua força está em continuar tentando.",
    "A superação é o prêmio para quem não desiste.",
    "Você é capaz de ir além dos seus limites.",
    "Superar é desafiar a si mesmo todos os dias.",
    "O sucesso nasce da superação dos obstáculos.",
    "A superação é o triunfo do espírito.",
    "Enfrente seus medos e cresça.",
    "A superação é o caminho para a liberdade.",
    "O guerreiro que supera não tem limites.",
    "Cada desafio é uma chance para renascer.",
    "Superar é acreditar no seu potencial.",
    "Não há vitória sem luta.",
    "Superar é dar um passo a mais quando o corpo quer parar.",
    "O esforço na superação vale cada lágrima.",
    "A superação é um ato de amor-próprio.",
    "Você é maior do que qualquer dificuldade.",
    "Superar é vencer a si mesmo.",
    "A força da superação transforma vidas.",
    "Cada dificuldade superada é uma conquista eterna.",
    "Superar é a prova da sua coragem."
    ],
    gratidao: [
       "A gratidão transforma o que temos em suficiente.",
    "Ser grato é reconhecer o valor de cada momento.",
    "Agradeça mais, reclame menos.",
    "A gratidão abre portas para a felicidade.",
    "Gratidão é a memória do coração.",
    // +50 frases extras:
    "Gratidão é a chave da prosperidade.",
    "Ser grato é enxergar beleza no simples.",
    "A gratidão multiplica as bênçãos.",
    "Agradecer é um ato de humildade e sabedoria.",
    "Gratidão é reconhecer o presente da vida.",
    "Quando agradecemos, atraímos mais motivos para agradecer.",
    "Gratidão é um caminho para a paz interior.",
    "Ser grato é valorizar o que realmente importa.",
    "A gratidão é a essência do contentamento.",
    "Praticar gratidão transforma o olhar para a vida.",
    "Gratidão é o reconhecimento da abundância.",
    "A gratidão fortalece o espírito.",
    "Ser grato traz leveza para o coração.",
    "A gratidão é a base do amor.",
    "Agradeça mesmo pelas dificuldades, elas ensinam.",
    "Gratidão é uma ponte para a felicidade.",
    "A gratidão renova a esperança.",
    "Ser grato é um exercício diário de alegria.",
    "A gratidão é fonte de energia positiva.",
    "Agradecer é abrir espaço para o novo.",
    "Gratidão é o caminho para o equilíbrio emocional.",
    "Ser grato atrai coisas boas para a vida.",
    "Gratidão é reconhecer a mão de Deus nas pequenas coisas.",
    "A gratidão nos conecta ao presente.",
    "Agradecer é cultivar bons sentimentos.",
    "Gratidão é um ato de amor e respeito.",
    "Ser grato é ser feliz pelo que se tem.",
    "A gratidão traz serenidade para o coração.",
    "Agradeça pelas pessoas que caminham ao seu lado.",
    "Gratidão é aceitar a vida com amor.",
    "Ser grato é reconhecer a beleza da existência.",
    "A gratidão é um gesto de bondade.",
    "Pratique gratidão e sinta a diferença.",
    "A gratidão é a semente da felicidade.",
    "Ser grato faz o coração se expandir.",
    "Gratidão é agradecer sem esperar nada em troca.",
    "Agradecer é valorizar o presente momento.",
    "Gratidão transforma corações e relações.",
    "Ser grato é a melhor forma de ser feliz.",
    "A gratidão é um presente para quem a sente.",
    "Agradecer torna a vida mais leve.",
    "Gratidão é reconhecer o valor da simplicidade.",
    "Ser grato abre portas para a prosperidade.",
    "Gratidão é a luz que ilumina o caminho.",
    "Agradeça pelos desafios, eles fazem crescer.",
    "Gratidão é celebrar a vida todos os dias.",
    "Ser grato é cultivar paz interior.",
    "A gratidão é a melodia da alma feliz.",
    "Agradecer é reconhecer que a vida é um presente."
    ],
    reflexao: [
         "Refletir é crescer por dentro.",
    "A reflexão traz clareza para a vida.",
    "Pensar antes de agir é sabedoria.",
    "O autoconhecimento é o caminho para a paz.",
    "Reflita para encontrar o verdadeiro sentido.",
    // +50 frases extras:
    "A reflexão é o silêncio que fala com a alma.",
    "Pensar é o primeiro passo para a mudança.",
    "Refletir é entender a si mesmo e ao mundo.",
    "A reflexão nos leva a escolhas melhores.",
    "Reflita e aprenda com suas experiências.",
    "O tempo da reflexão é tempo de crescimento.",
    "Quem reflete vive com mais consciência.",
    "A reflexão é a ponte entre o passado e o futuro.",
    "Reflita antes de julgar.",
    "O pensamento crítico nasce da reflexão.",
    "A reflexão é o espaço para a sabedoria florescer.",
    "Reflita sobre suas atitudes e colha resultados.",
    "O silêncio da reflexão é cheio de respostas.",
    "Reflita e encontre a paz interior.",
    "A reflexão nos conecta ao presente.",
    "Reflita e transforme sua realidade.",
    "Pensar é construir o próprio destino.",
    "A reflexão é um ato de amor-próprio.",
    "Reflita e descubra novos caminhos.",
    "A reflexão torna a mente mais forte.",
    "Reflita sobre seus valores e princípios.",
    "O poder da reflexão muda vidas.",
    "Reflita e seja dono da sua história.",
    "O crescimento começa com a reflexão.",
    "Reflita para agir com sabedoria.",
    "A reflexão é o remédio para a impulsividade.",
    "Reflita sobre o que realmente importa.",
    "A reflexão é o exercício da mente consciente.",
    "Reflita e aprenda a perdoar.",
    "O equilíbrio nasce da reflexão profunda.",
    "Reflita para encontrar o seu propósito.",
    "A reflexão é a luz que guia as decisões.",
    "Reflita e fortaleça seu espírito.",
    "Pensar e refletir são dons preciosos.",
    "A reflexão é o segredo da evolução pessoal.",
    "Reflita para viver com mais intensidade.",
    "O autoconhecimento vem da reflexão sincera.",
    "Reflita e encontre a verdadeira liberdade.",
    "A reflexão é o caminho para a maturidade.",
    "Reflita e escolha o melhor para você.",
    "A mente clara é fruto da reflexão.",
    "Reflita e seja grato pelas lições da vida.",
    "A reflexão é o início da transformação.",
    "Reflita e conecte-se com sua essência.",
    "A reflexão traz luz às sombras internas.",
    "Reflita para ser protagonista da sua vida.",
    "A reflexão abre portas para a sabedoria.",
    "Reflita e seja a mudança que deseja.",
    "A reflexão é o caminho para o equilíbrio."
    ],
    sucesso: [
        "O sucesso é a soma de pequenos esforços.",
    "Sucesso é a realização dos seus sonhos.",
    "Para alcançar o sucesso, é preciso persistência.",
    "Sucesso é resultado de dedicação diária.",
    "O sucesso começa com uma decisão.",
    // +50 frases extras:
    "Sucesso é a recompensa para quem não desiste.",
    "O segredo do sucesso está no foco.",
    "Sucesso é acreditar em si mesmo.",
    "Para ter sucesso, trabalhe com paixão.",
    "Sucesso é superar seus próprios limites.",
    "Sucesso é transformar sonhos em metas.",
    "O sucesso exige coragem para começar.",
    "Sucesso é consequência de atitude positiva.",
    "O sucesso nasce do esforço constante.",
    "Sucesso é a soma da preparação com oportunidade.",
    "Quem busca sucesso encontra caminhos.",
    "Sucesso é aprender com os erros.",
    "O sucesso é uma jornada, não um destino.",
    "Sucesso é construir com propósito.",
    "A persistência é o caminho do sucesso.",
    "O sucesso é para os que se levantam após a queda.",
    "Sucesso é fazer o que ama todos os dias.",
    "Sucesso é manter o foco nos objetivos.",
    "O sucesso é o resultado da disciplina.",
    "Sucesso é a soma das pequenas vitórias.",
    "Para ter sucesso, confie no seu potencial.",
    "Sucesso é vencer o medo de tentar.",
    "O sucesso acontece para quem age.",
    "Sucesso é a soma de escolhas inteligentes.",
    "Sucesso é manter a motivação viva.",
    "O sucesso é construído com paixão e esforço.",
    "Sucesso é aproveitar cada oportunidade.",
    "Para alcançar o sucesso, seja resiliente.",
    "Sucesso é acreditar que é possível.",
    "O sucesso é fruto da dedicação diária.",
    "Sucesso é superar desafios com determinação.",
    "O sucesso está na persistência diária.",
    "Sucesso é a realização do esforço contínuo.",
    "Para ter sucesso, mantenha a mente positiva.",
    "Sucesso é aprender e se adaptar.",
    "O sucesso é a soma da fé com trabalho.",
    "Sucesso é inspirar e ser inspirado.",
    "Sucesso é um estado de espírito.",
    "Sucesso é fazer a diferença com seu trabalho.",
    "Para alcançar o sucesso, tenha disciplina.",
    "Sucesso é a recompensa do comprometimento.",
    "Sucesso é planejar e executar.",
    "O sucesso está em nunca desistir.",
    "Sucesso é valorizar cada conquista.",
    "Para ter sucesso, cultive bons hábitos.",
    "Sucesso é trabalhar duro em silêncio.",
    "O sucesso é a soma das suas escolhas.",
    "Sucesso é ser melhor a cada dia.",
    "Sucesso é celebrar cada pequeno avanço.",
    "Sucesso é manter a fé em si mesmo.",
    "Para alcançar o sucesso, mantenha a esperança."
    ],
    familia: [
        "Família é o nosso maior tesouro.",
    "O amor de família é a base da vida.",
    "Família é onde o coração encontra paz.",
    "Família é laço eterno de amor e apoio.",
    "O abraço da família cura qualquer dor.",
    // +50 frases extras:
    "Família é o porto seguro da vida.",
    "Na família, encontramos força e aconchego.",
    "Família é amor que não se mede.",
    "A família é a raiz da felicidade.",
    "Família é onde crescemos e aprendemos.",
    "O amor familiar é incondicional.",
    "Família é a base de tudo que somos.",
    "O sorriso da família é a maior alegria.",
    "Família é união que supera dificuldades.",
    "Família é o primeiro lar do coração.",
    "Na família, encontramos apoio e compreensão.",
    "Família é fonte de amor e proteção.",
    "A família é o elo que nos mantém unidos.",
    "Família é amor que ultrapassa gerações.",
    "O calor da família aquece a alma.",
    "Família é onde o amor floresce.",
    "Família é a nossa verdadeira fortaleza.",
    "Na família, construímos memórias eternas.",
    "Família é o maior presente da vida.",
    "Família é o lugar onde somos aceitos.",
    "Família é amor que nunca se acaba.",
    "Família é abraço que conforta.",
    "Família é a nossa base de apoio.",
    "Na família, encontramos força para seguir.",
    "Família é amor e compreensão constantes.",
    "Família é o coração que bate junto.",
    "Família é o lar da felicidade verdadeira.",
    "O amor da família é infinito e sincero.",
    "Família é um elo que o tempo não rompe.",
    "Família é paz, amor e segurança.",
    "Família é onde aprendemos a amar.",
    "Família é o alicerce do nosso ser.",
    "Na família, encontramos nossa identidade.",
    "Família é fonte de apoio nos momentos difíceis.",
    "Família é amor em cada gesto e palavra.",
    "Família é nosso maior patrimônio.",
    "O amor familiar fortalece a alma.",
    "Família é o coração da vida.",
    "Na família, o amor nunca falta.",
    "Família é base sólida para a felicidade.",
    "Família é amor que nos faz crescer.",
    "Família é o bem mais precioso.",
    "Família é nossa eterna companhia.",
    "Família é a razão do nosso sorriso.",
    "Família é onde encontramos o verdadeiro amor.",
    "Família é luz que ilumina o caminho.",
    "Família é o nosso verdadeiro lar.",
    "Família é amor que nos guia.",
    "Família é a maior benção da vida."
    ],
    inspiração: [
        "Inspire-se a cada novo amanhecer.",
    "A inspiração move montanhas.",
    "Inspire-se no que te faz feliz.",
    "A vida é fonte inesgotável de inspiração.",
    "A inspiração transforma sonhos em realidade.",
    // +50 frases extras:
    "Inspiração é o combustível da criatividade.",
    "Encontre inspiração nas pequenas coisas.",
    "A inspiração nasce do coração aberto.",
    "Inspire e deixe-se inspirar.",
    "A inspiração nos leva além dos limites.",
    "A inspiração é a centelha da mudança.",
    "Inspire coragem para novos desafios.",
    "A inspiração abre portas para o sucesso.",
    "Inspiração é ver o mundo com outros olhos.",
    "A inspiração transforma o comum em extraordinário.",
    "Busque inspiração em cada experiência.",
    "A inspiração nasce do desejo de melhorar.",
    "Inspiração é o sopro que impulsiona a vida.",
    "A inspiração é o despertar da alma.",
    "Inspire-se na beleza do mundo.",
    "A inspiração cria possibilidades infinitas.",
    "Inspire esperança em dias difíceis.",
    "A inspiração é o fogo que aquece o coração.",
    "Inspire ação para conquistar seus sonhos.",
    "A inspiração transforma ideias em realidade.",
    "Busque inspiração em sua essência.",
    "A inspiração é o caminho para a inovação.",
    "Inspire alegria e leveza em sua jornada.",
    "A inspiração renova o espírito e a mente.",
    "Inspire paixão em tudo que faz.",
    "A inspiração é uma luz na escuridão.",
    "Inspire mudança para um mundo melhor.",
    "A inspiração é fonte de energia positiva.",
    "Inspire amor e compaixão ao seu redor.",
    "A inspiração nasce do silêncio interior.",
    "Inspire-se em pessoas que te motivam.",
    "A inspiração é o motor da criação.",
    "Inspire confiança em suas decisões.",
    "A inspiração é a chave para a criatividade.",
    "Inspire-se no potencial que existe em você.",
    "A inspiração transforma vidas e histórias.",
    "Inspire-se a ser a melhor versão de si mesmo.",
    "A inspiração é um convite para o novo.",
    "Inspire-se no presente para construir o futuro.",
    "A inspiração é a alma do progresso.",
    "Inspire-se nas possibilidades que a vida oferece.",
    "A inspiração é o poder de sonhar e realizar.",
    "Inspire coragem para superar desafios.",
    "A inspiração é o brilho da alma criativa.",
    "Inspire gratidão pelo que você tem.",
    "A inspiração transforma pensamentos em ação.",
    "Inspire esperança para dias melhores.",
    "A inspiração é a essência da vida plena.",
    "Inspire-se e contagie o mundo com sua luz."
    ]
};

const fontes = {
    'Roboto': 'Roboto, sans-serif',
    'Montserrat': 'Montserrat, sans-serif',
    'Lato': 'Lato, sans-serif',
    'Inter': 'Inter, sans-serif',
    'Open Sans': 'Open Sans, sans-serif',
    'Space Mono': 'Space Mono, monospace'
};

let favoritos = JSON.parse(localStorage.getItem('favoritosAppFrases') || '[]');
if (favoritos.length && typeof favoritos[0] === 'string') {
    favoritos = favoritos.map(f => ({ frase: f, fonte: 'Roboto' }));
    localStorage.setItem('favoritosAppFrases', JSON.stringify(favoritos));
}
let historico = [];
let indiceHistorico = -1;

function mostrarFrase(nova = true) {
    const tema = temaSelect.value;
    const frasesTema = frases[tema];
    if (nova) {
        if (historico.length === frasesTema.length && indiceHistorico === historico.length - 1) {
            historico = [];
            indiceHistorico = -1;
        }
        let frase;
        let tentativas = 0;
        do {
            frase = frasesTema[Math.floor(Math.random() * frasesTema.length)];
            tentativas++;
        } while (historico.includes(frase) && tentativas < 20);
        historico = historico.slice(0, indiceHistorico + 1);
        historico.push(frase);
        indiceHistorico++;
    }
    fraseDiv.textContent = historico[indiceHistorico];
    setTimeout(() => {
        atualizarCoracao();
        atualizarBotoes();
    }, 0);
}
function atualizarCoracao() {
    if (!btnFavoritar) return;
    const fraseAtual = fraseDiv.textContent;
    const fonteAtual = fonteSelect.value;
    if (favoritos.some(fav => fav.frase === fraseAtual && fav.fonte === fonteAtual)) {
        btnFavoritar.classList.add('favorito');
    } else {
        btnFavoritar.classList.remove('favorito');
    }
}

if (btnFavoritar) {
    btnFavoritar.addEventListener('click', () => {
        const fraseAtual = fraseDiv.textContent;
        const fonteAtual = fonteSelect.value;
        const jaFavoritado = favoritos.some(fav => fav.frase === fraseAtual && fav.fonte === fonteAtual);
        if (jaFavoritado) {
            favoritos = favoritos.filter(fav => !(fav.frase === fraseAtual && fav.fonte === fonteAtual));
        } else {
            favoritos.push({ frase: fraseAtual, fonte: fonteAtual });
        }
        localStorage.setItem('favoritosAppFrases', JSON.stringify(favoritos));
        atualizarCoracao();
        if (favoritosModal && favoritosModal.classList.contains('ativo')) {
            renderizarFavoritos();
        }
    });
}

if (btnFavoritos) {
    btnFavoritos.addEventListener('click', () => {
        btnFavoritos.classList.add('ativo');
        abrirFavoritosModal();
    });
}

function abrirFavoritosModal() {
    if (!favoritosModal) return;
    favoritosModal.classList.add('ativo');
    renderizarFavoritos();
}

function fecharFavoritosModal() {
    if (!favoritosModal) return;
    favoritosModal.classList.remove('ativo');
    btnFavoritos.classList.remove('ativo');
}

if (fecharFavoritos) {
    fecharFavoritos.addEventListener('click', fecharFavoritosModal);
}

function renderizarFavoritos() {
    if (!favoritosLista) return;
    favoritosLista.innerHTML = '';
    const btnRemoverTodosFavs = document.getElementById('btnRemoverTodosFavs');
    if (!favoritos.length) {
        favoritosLista.innerHTML = '<li>Nenhuma frase favoritada ainda.</li>';
        if (btnRemoverTodosFavs) btnRemoverTodosFavs.style.visibility = 'hidden';
        return;
    } else {
        if (btnRemoverTodosFavs) btnRemoverTodosFavs.style.visibility = 'visible';
    }
    favoritos.forEach((fav, idx) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        const span = document.createElement('span');
        span.textContent = fav.frase;
        span.style.fontFamily = fontes[fav.fonte] || 'Roboto, sans-serif';
        li.appendChild(span);
        const btnCopiar = document.createElement('button');
        btnCopiar.className = 'copiar-fav-btn';
        btnCopiar.title = 'Copiar frase';
        btnCopiar.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        btnCopiar.addEventListener('click', () => {
            copiarTextoComFonte(fav.frase, fav.fonte);
        });
        li.appendChild(btnCopiar);
        const btnEditar = document.createElement('button');
        btnEditar.className = 'copiar-fav-btn';
        btnEditar.title = 'Editar frase';
        btnEditar.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>`;
        btnEditar.addEventListener('click', () => {
            fecharFavoritosModal();
            fraseDiv.textContent = fav.frase;
            fonteSelect.value = fav.fonte;
            mudarFonte();
            atualizarCoracao();
        });
        li.appendChild(btnEditar);
        const btnRemover = document.createElement('button');
        btnRemover.className = 'remover-fav-btn';
        btnRemover.title = 'Remover dos favoritos';
        btnRemover.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="#e53935" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 56s-20-13.6-20-28A12 12 0 0 1 32 16a12 12 0 0 1 20 12c0 14.4-20 28-20 28z"/>
</svg>`;
        btnRemover.addEventListener('click', () => {
            if (confirm('Remover esta frase dos favoritos?')) {
                const realIdx = favoritos.findIndex(f => f.frase === fav.frase && f.fonte === fav.fonte);
                if (realIdx !== -1) {
                    favoritos.splice(realIdx, 1);
                    localStorage.setItem('favoritosAppFrases', JSON.stringify(favoritos));
                    renderizarFavoritos();
                    atualizarCoracao();
                }
            }
        });
        li.appendChild(btnRemover);
        favoritosLista.appendChild(li);
    });
}
// Remover todos os favoritos (confirmação só uma vez)
const btnRemoverTodosFavs = document.getElementById('btnRemoverTodosFavs');
if (btnRemoverTodosFavs) {
    btnRemoverTodosFavs.replaceWith(btnRemoverTodosFavs.cloneNode(true));
    const novoBtnRemoverTodosFavs = document.getElementById('btnRemoverTodosFavs');
    novoBtnRemoverTodosFavs.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover todos os favoritos?')) {
            favoritos = [];
            localStorage.setItem('favoritosAppFrases', JSON.stringify(favoritos));
            renderizarFavoritos();
            atualizarCoracao();
        }
    });
}

function voltarFrase() {
    if (indiceHistorico > 0) {
        indiceHistorico--;
        fraseDiv.textContent = historico[indiceHistorico];
        atualizarBotoes();
    }
}

function atualizarBotoes() {
    voltarFraseBtn.disabled = indiceHistorico <= 0;
}

function mudarFonte() {
    const fonte = fonteSelect.value;
    fraseDiv.style.fontFamily = fontes[fonte];
}

temaSelect.addEventListener('change', () => {
    historico = [];
    indiceHistorico = -1;
    mostrarFrase();
});
fonteSelect.addEventListener('change', mudarFonte);
novaFraseBtn.addEventListener('click', () => mostrarFrase(true));
voltarFraseBtn.addEventListener('click', voltarFrase);

// --- Marca d'água temática ---
const bgWatermark = document.querySelector('.bg-watermark');
var temaSelectWatermark = window.temaSelect || document.getElementById('temaSelect');

const watermarks = {
  motivacional: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">💪</text></svg>')`,
  amor: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">❤️</text></svg>')`,
  amizade: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">🤝</text></svg>')`,
  felicidade: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">😃</text></svg>')`,
  superacao: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">🏆</text></svg>')`,
  gratidao: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">🙏</text></svg>')`,
  reflexao: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">💭</text></svg>')`,
  sucesso: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">📈</text></svg>')`,
  familia: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">👨‍👩‍👧‍👦</text></svg>')`,
  inspiracao: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">💡</text></svg>')`,
  default: `url('data:image/svg+xml;utf8,<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="55%" text-anchor="middle" font-size="110" font-family="Montserrat" dy=".3em">✨</text></svg>')`,
};
function atualizarMarcaDagua() {
  if (!bgWatermark || !temaSelectWatermark) return;
  const tema = temaSelectWatermark.value;
  bgWatermark.style.backgroundImage = watermarks[tema] || watermarks['default'];
}
if (temaSelectWatermark) {
  temaSelectWatermark.addEventListener('change', atualizarMarcaDagua);
  window.addEventListener('DOMContentLoaded', atualizarMarcaDagua);
  atualizarMarcaDagua();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    mostrarFrase();
    mudarFonte();
    atualizarCoracao();
    addContinueWithoutLoginButton();
    checarSessao();
});

// Ativar modo escuro
const btnDarkMode = document.getElementById('btnDarkMode');
btnDarkMode?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Print da área principal
const btnPrint = document.getElementById('btnPrint');
btnPrint?.addEventListener('click', () => {
    const fraseBox = document.querySelector('.frase-box');
    if (!fraseBox) return;

    const seletorOcultos = [
        '#btnPrint',
        '#btnTags',
        '#btnFavoritos',
        '#btnCopiarFrase',
        '#btnFavoritar',
        '#btnDarkMode',
        '#voltarFrase',
        '#novaFrase',
        '#temaSelect',
        '#fonteSelect',
        '.frase-actions'
    ];

    const elementosOcultados = [];
    seletorOcultos.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
            elementosOcultados.push({ el, display: el.style.display });
            el.style.display = 'none';
        }
    });

    setTimeout(() => {
        html2canvas(fraseBox, {
            backgroundColor: null,
            useCORS: true,
            scale: 2
        }).then(canvas => {
            const tema = document.getElementById('temaSelect')?.value || 'frase';
            const data = new Date();
            const nomeArquivo = `frase-${tema}-${data.toISOString().slice(0,10)}.png`;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                // Exibe a imagem em tela cheia e instrução para salvar
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.background = 'rgba(0,0,0,0.85)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.zIndex = 9999;
                overlay.style.padding = '2rem 1rem 1rem 1rem';

                const img = document.createElement('img');
                img.src = canvas.toDataURL();
                img.style.maxWidth = '90vw';
                img.style.maxHeight = '60vh';
                img.style.borderRadius = '1.2rem';
                img.style.boxShadow = '0 0 24px #0008';

                const msg = document.createElement('div');
                msg.innerHTML = '<span style="color:#fff;font-size:1.2rem;line-height:1.5;display:block;text-align:center;margin-bottom:1rem;">Para salvar a imagem na sua galeria, toque e segure a imagem e escolha <b>"Adicionar a Fotos"</b>.<br><br><small style="color:#ccc;font-size:0.95rem;">Toque fora da imagem para fechar.</small></span>';

                overlay.appendChild(img);
                overlay.appendChild(msg);
                document.body.appendChild(overlay);
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) overlay.remove();
                });
            } else {
                const link = document.createElement('a');
                link.download = nomeArquivo;
                link.href = canvas.toDataURL();
                link.click();
            }
            elementosOcultados.forEach(({ el, display }) => {
                el.style.display = display;
            });
        });
    }, 300);
});

// Copiar frase principal
const btnCopiarFrase = document.getElementById('btnCopiarFrase');
if (btnCopiarFrase) {
    btnCopiarFrase.addEventListener('click', () => {
        const frase = fraseDiv.textContent;
        if (!frase) return;
        const el = document.createElement('textarea');
        el.value = frase;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Frase copiada para a área de transferência!');
    });
}

;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('[FraseGo] SW registrado:', reg.scope))
      .catch(err => console.error('[FraseGo] Erro ao registrar SW:', err));
  });
}

// --- RESTRIÇÕES PARA NÃO PREMIUM ---
function aplicarRestricoesPremiumScript() {
    // Bloqueia temas premium
    const temasPremium = ['inspiração', 'sucesso', 'gratidao'];
    if (temaSelect) {
        [...temaSelect.options].forEach(opt => {
            if (temasPremium.includes(opt.value)) {
                if (!isPremium()) {
                    opt.disabled = true;
                    opt.classList.add('premium');
                    if (!opt.textContent.includes('(Premium)')) opt.textContent += ' (Premium)';
                } else {
                    opt.disabled = false;
                    opt.classList.remove('premium');
                    opt.textContent = opt.textContent.replace(' (Premium)', '');
                }
            } else {
                opt.disabled = false;
                opt.classList.remove('premium');
                opt.textContent = opt.textContent.replace(' (Premium)', '');
            }
        });
        // Impede seleção via JS
        if (!isPremium() && temasPremium.includes(temaSelect.value)) {
            temaSelect.value = 'motivacional';
        }
        // Impede seleção via teclado
        temaSelect.onkeydown = function(e) {
            if (!isPremium()) {
                const idx = temaSelect.selectedIndex;
                if (temasPremium.includes(temaSelect.options[idx].value)) {
                    e.preventDefault();
                }
            }
        };
        // Impede seleção via mouse
        temaSelect.onmousedown = function(e) {
            if (!isPremium()) {
                const idx = temaSelect.selectedIndex;
                if (temasPremium.includes(temaSelect.options[idx].value)) {
                    e.preventDefault();
                }
            }
        };
    }
    // Bloqueia fontes premium
    const fontesPremium = ['Space Mono', 'Inter'];
    if (fonteSelect) {
        [...fonteSelect.options].forEach(opt => {
            if (fontesPremium.includes(opt.value)) {
                if (!isPremium()) {
                    opt.disabled = true;
                    opt.classList.add('premium');
                    if (!opt.textContent.includes('(Premium)')) opt.textContent += ' (Premium)';
                } else {
                    opt.disabled = false;
                    opt.classList.remove('premium');
                    opt.textContent = opt.textContent.replace(' (Premium)', '');
                }
            } else {
                opt.disabled = false;
                opt.classList.remove('premium');
                opt.textContent = opt.textContent.replace(' (Premium)', '');
            }
        });
        // Impede seleção via JS
        if (!isPremium() && fontesPremium.includes(fonteSelect.value)) {
            fonteSelect.value = 'Roboto';
        }
        // Impede seleção via teclado
        fonteSelect.onkeydown = function(e) {
            if (!isPremium()) {
                const idx = fonteSelect.selectedIndex;
                if (fontesPremium.includes(fonteSelect.options[idx].value)) {
                    e.preventDefault();
                }
            }
        };
        // Impede seleção via mouse
        fonteSelect.onmousedown = function(e) {
            if (!isPremium()) {
                const idx = fonteSelect.selectedIndex;
                if (fontesPremium.includes(fonteSelect.options[idx].value)) {
                    e.preventDefault();
                }
            }
        };
    }
    // Limite de frases diárias
    if (!isPremium()) {
        let usadas = Number(localStorage.getItem('frases_hoje')) || 0;
        if (usadas >= 5 && novaFraseBtn) {
            novaFraseBtn.disabled = true;
            novaFraseBtn.classList.add('premium');
        }
        // Impede click via JS
        if (novaFraseBtn) {
            novaFraseBtn.onclick = function(e) {
                if (novaFraseBtn.disabled) {
                    e.preventDefault();
                    return false;
                }
            };
        }
    } else {
        if (novaFraseBtn) {
            novaFraseBtn.disabled = false;
            novaFraseBtn.classList.remove('premium');
            novaFraseBtn.onclick = null;
        }
    }
    // Bloqueia selects visualmente para não premium
    if (!isPremium()) {
        if (fonteSelect) fonteSelect.classList.add('premium');
        if (temaSelect) temaSelect.classList.add('premium');
    } else {
        if (fonteSelect) fonteSelect.classList.remove('premium');
        if (temaSelect) temaSelect.classList.remove('premium');
    }
}

function isPremium() {
    return localStorage.getItem('frasego_premium') === 'true' || localStorage.getItem('isPremium') === 'true';
}

// Aplica restrições ao carregar
document.addEventListener('DOMContentLoaded', aplicarRestricoesPremiumScript);
temaSelect?.addEventListener('change', aplicarRestricoesPremiumScript);
fonteSelect?.addEventListener('change', aplicarRestricoesPremiumScript);

// Garante que ao clicar em Nova Frase, respeite o limite
if (novaFraseBtn) {
    novaFraseBtn.addEventListener('click', function(e) {
        if (!isPremium()) {
            let usadas = Number(localStorage.getItem('frases_hoje')) || 0;
            if (usadas >= 5) {
                e.preventDefault();
                alert('🚫 Você atingiu o limite de frases diárias grátis. Torne-se Premium para acesso ilimitado!');
                return;
            }
            usadas++;
            localStorage.setItem('frases_hoje', usadas);
            aplicarRestricoesPremiumScript();
        }
    });
}

// ...existing code...