// --- BLOQUEIO GLOBAL USANDO SUPABASE AUTH ---
const SUPABASE_URL = 'https://lfvfvrpfrphpbsxktazn.supabase.co'; // Substitua pela sua URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdmZ2cnBmcnBocGJzeGt0YXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NzgyMzgsImV4cCI6MjA2ODQ1NDIzOH0.aXIRLdSYBt5_ifMAtpKeOV1mnZooqtkWQ7OTqxcg7s4'; // Substitua pela sua anon key
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function bloquearApp() {
  // Desabilita elementos exceto os que estão nos modais de autenticação
  document.querySelectorAll('button,select,input,textarea').forEach(el => {
    // Não desabilita elementos dentro dos modais de autenticação
    const isInAuthModal = el.closest('#modalLogin, #modalCadastro, #modalEsqueciSenha');
    if (!isInAuthModal) {
      el.disabled = true;
    }
  });
}

function desbloquearApp() {
  document.querySelectorAll('button,select,input,textarea').forEach(el => {
    el.disabled = false;
  });
}

function mostrarModal(id) {
  // Oculta todos os modais
  document.querySelectorAll('#modalLogin,#modalCadastro,#modalEsqueciSenha').forEach(m => m.style.display = 'none');
  
  // Limpa mensagens de erro e sucesso
  document.querySelectorAll('.modal-error, .modal-success').forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
  
  // Limpa os campos do formulário
  const modal = document.getElementById(id);
  if (modal) {
    modal.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
      input.value = '';
    });
    modal.style.display = 'flex';
  }
}

async function checarSessao() {
  try {
    console.log('Verificando sessão...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Sessão:', session ? 'encontrada' : 'não encontrada');
    
    if (!session) {
      // Só mostra o modal de login se não estiver logado E não for convidado
      if (!localStorage.getItem('usuario_convidado')) {
        console.log('Usuário não logado, bloqueando app e mostrando modal de login');
        bloquearApp();
        mostrarModal('modalLogin');
      } else {
        desbloquearApp();
        const modalLogin = document.getElementById('modalLogin');
        if (modalLogin) modalLogin.style.display = 'none';
      }
    } else {
      console.log('Usuário logado, desbloqueando app');
      desbloquearApp();
      const modalLogin = document.getElementById('modalLogin');
      const modalCadastro = document.getElementById('modalCadastro');
      const modalEsqueciSenha = document.getElementById('modalEsqueciSenha');
      if (modalLogin) modalLogin.style.display = 'none';
      if (modalCadastro) modalCadastro.style.display = 'none';
      if (modalEsqueciSenha) modalEsqueciSenha.style.display = 'none';
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    // Em caso de erro, permite acesso como convidado
    desbloquearApp();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado, inicializando autenticação...');
  
  // Inicializa os elementos de erro como ocultos
  document.querySelectorAll('.modal-error, .modal-success').forEach(el => {
    el.style.display = 'none';
  });
  
  // Verifica se o Supabase foi carregado
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase não foi carregado. Verifique se o script do Supabase está incluído.');
    // Em caso de erro, permite acesso como convidado
    desbloquearApp();
    return;
  }
  
  console.log('Supabase carregado com sucesso');
  
  // Configura listener para mudanças de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
      console.log('Usuário logado com sucesso');
      desbloquearApp();
      // Oculta todos os modais
      const modalLogin = document.getElementById('modalLogin');
      const modalCadastro = document.getElementById('modalCadastro');
      const modalEsqueciSenha = document.getElementById('modalEsqueciSenha');
      
      if (modalLogin) modalLogin.style.display = 'none';
      if (modalCadastro) modalCadastro.style.display = 'none';
      if (modalEsqueciSenha) modalEsqueciSenha.style.display = 'none';
    } else if (event === 'SIGNED_OUT') {
      console.log('Usuário deslogado');
      // Remove flag de convidado se existir
      localStorage.removeItem('usuario_convidado');
      checarSessao();
    }
  });
  
  // Verifica se os elementos dos modais existem
  const modalLogin = document.getElementById('modalLogin');
  const formLogin = document.getElementById('formLogin');
  const btnConvidado = document.getElementById('btnConvidado');
  
  console.log('Elementos encontrados:', {
    modalLogin: !!modalLogin,
    formLogin: !!formLogin,
    btnConvidado: !!btnConvidado
  });
  
  // Adiciona todos os event listeners aqui
  inicializarEventListeners();
  
  // Verifica a sessão do usuário
  checarSessao();
});

function inicializarEventListeners() {
  // --- HANDLERS DE AUTENTICAÇÃO ---
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    console.log('Adicionando event listener ao formulário de login');
    formLogin.addEventListener('submit', async function(e) {
      console.log('Submit do formulário de login chamado');
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const senha = document.getElementById('loginSenha').value;
      const erroDiv = document.getElementById('loginErro');
      
      console.log('Tentando fazer login com:', email);
      
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) {
          console.error('Erro de login:', error.message);
          if (erroDiv) {
            erroDiv.textContent = 'Erro ao logar: ' + error.message;
            erroDiv.style.display = 'block';
          }
        } else {
          console.log('Login realizado com sucesso');
          if (erroDiv) erroDiv.style.display = 'none';
          checarSessao();
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        if (erroDiv) {
          erroDiv.textContent = 'Erro inesperado: ' + err.message;
          erroDiv.style.display = 'block';
        }
      }
    });
  } else {
    console.error('Elemento formLogin não encontrado!');
  }

  const btnGoogle = document.getElementById('btnGoogle');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', async function() {
      const erroDiv = document.getElementById('loginErro');
      try {
        console.log('Iniciando login com Google...');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        
        if (error) {
          console.error('Erro no login Google:', error);
          if (erroDiv) {
            erroDiv.textContent = 'Erro ao logar com Google: ' + error.message;
            erroDiv.style.display = 'block';
          }
        } else {
          console.log('Login Google iniciado com sucesso');
          // O redirecionamento será automático
        }
      } catch (err) {
        console.error('Erro inesperado no login Google:', err);
        if (erroDiv) {
          erroDiv.textContent = 'Erro inesperado: ' + err.message;
          erroDiv.style.display = 'block';
        }
      }
    });
  }

  const btnConvidado = document.getElementById('btnConvidado');
  if (btnConvidado) {
    console.log('Adicionando event listener ao botão convidado');
    btnConvidado.addEventListener('click', function() {
      console.log('Botão convidado clicado');
      // Marca usuário como convidado
      localStorage.setItem('usuario_convidado', 'true');
      // Fecha todos os modais e desbloqueia o app para uso como convidado
      const modalLogin = document.getElementById('modalLogin');
      const modalCadastro = document.getElementById('modalCadastro');
      const modalEsqueciSenha = document.getElementById('modalEsqueciSenha');
      if (modalLogin) modalLogin.style.display = 'none';
      if (modalCadastro) modalCadastro.style.display = 'none';
      if (modalEsqueciSenha) modalEsqueciSenha.style.display = 'none';
      desbloquearApp();
    });
  } else {
    console.error('Elemento btnConvidado não encontrado!');
  }

  const btnCriarConta = document.getElementById('btnCriarConta');
  if (btnCriarConta) {
    btnCriarConta.addEventListener('click', function() {
      mostrarModal('modalCadastro');
    });
  }

  const btnEsqueciSenha = document.getElementById('btnEsqueciSenha');
  if (btnEsqueciSenha) {
    btnEsqueciSenha.addEventListener('click', function() {
      mostrarModal('modalEsqueciSenha');
    });
  }

  const formCadastro = document.getElementById('formCadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('cadastroEmail').value;
      const senha = document.getElementById('cadastroSenha').value;
      const erroDiv = document.getElementById('cadastroErro');
      
      try {
        const { error } = await supabase.auth.signUp({ email, password: senha });
        if (error) {
          if (erroDiv) {
            erroDiv.textContent = 'Erro ao criar conta: ' + error.message;
            erroDiv.style.display = 'block';
          }
        } else {
          if (erroDiv) erroDiv.style.display = 'none';
          alert('Conta criada! Verifique seu e-mail para confirmar.');
          mostrarModal('modalLogin');
        }
      } catch (err) {
        if (erroDiv) {
          erroDiv.textContent = 'Erro inesperado: ' + err.message;
          erroDiv.style.display = 'block';
        }
      }
    });
  }

  const btnVoltarLogin = document.getElementById('btnVoltarLogin');
  if (btnVoltarLogin) {
    btnVoltarLogin.addEventListener('click', function() {
      mostrarModal('modalLogin');
    });
  }

  const formEsqueciSenha = document.getElementById('formEsqueciSenha');
  if (formEsqueciSenha) {
    formEsqueciSenha.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('esqueciEmail').value;
      const erroDiv = document.getElementById('esqueciErro');
      const sucessoDiv = document.getElementById('esqueciSucesso');
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          if (erroDiv) {
            erroDiv.textContent = 'Erro ao enviar e-mail de recuperação: ' + error.message;
            erroDiv.style.display = 'block';
          }
          if (sucessoDiv) sucessoDiv.style.display = 'none';
        } else {
          if (sucessoDiv) {
            sucessoDiv.textContent = 'E-mail de recuperação enviado!';
            sucessoDiv.style.display = 'block';
          }
          if (erroDiv) erroDiv.style.display = 'none';
          setTimeout(() => {
            mostrarModal('modalLogin');
          }, 2000);
        }
      } catch (err) {
        if (erroDiv) {
          erroDiv.textContent = 'Erro inesperado: ' + err.message;
          erroDiv.style.display = 'block';
        }
        if (sucessoDiv) sucessoDiv.style.display = 'none';
      }
    });
  }

  const btnVoltarLogin2 = document.getElementById('btnVoltarLogin2');
  if (btnVoltarLogin2) {
    btnVoltarLogin2.addEventListener('click', function() {
      mostrarModal('modalLogin');
    });
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

// === FUNCIONALIDADES DE IMAGEM DE FUNDO ===

// Banco de imagens por tema (URLs corrigidas e sem duplicatas)
const imagensPorTema = {
    motivacional: [
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3',
        'https://picsum.photos/400/300?random=4',
        'https://picsum.photos/400/300?random=5',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1519452634265-7b808fcb13d0?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1464822759844-d150ad6cbedb?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format'
    ],
    amor: [
        'https://picsum.photos/400/300?random=11',
        'https://picsum.photos/400/300?random=12',
        'https://picsum.photos/400/300?random=13',
        'https://picsum.photos/400/300?random=14',
        'https://picsum.photos/400/300?random=15',
        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=400&h=300&fit=crop&auto=format'
    ],
    amizade: [
        'https://picsum.photos/400/300?random=21',
        'https://picsum.photos/400/300?random=22',
        'https://picsum.photos/400/300?random=23',
        'https://picsum.photos/400/300?random=24',
        'https://picsum.photos/400/300?random=25',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1511895426328-dc8714efa8cd?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1554887681-47d40ffaeaac?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop&auto=format'
    ],
    felicidade: [
        'https://picsum.photos/400/300?random=31',
        'https://picsum.photos/400/300?random=32',
        'https://picsum.photos/400/300?random=33',
        'https://picsum.photos/400/300?random=34',
        'https://picsum.photos/400/300?random=35',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop&auto=format'
    ],
    superacao: [
        'https://picsum.photos/400/300?random=41',
        'https://picsum.photos/400/300?random=42',
        'https://picsum.photos/400/300?random=43',
        'https://picsum.photos/400/300?random=44',
        'https://picsum.photos/400/300?random=45',
        'https://images.unsplash.com/photo-1527266237111-a4989d028b4b?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1519452634265-7b808fcb13d0?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1464822759844-d150ad6cbedb?w=400&h=300&fit=crop&auto=format'
    ],
    gratidao: [
        'https://picsum.photos/400/300?random=51',
        'https://picsum.photos/400/300?random=52',
        'https://picsum.photos/400/300?random=53',
        'https://picsum.photos/400/300?random=54',
        'https://picsum.photos/400/300?random=55',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop&auto=format'
    ],
    reflexao: [
        'https://picsum.photos/400/300?random=61',
        'https://picsum.photos/400/300?random=62',
        'https://picsum.photos/400/300?random=63',
        'https://picsum.photos/400/300?random=64',
        'https://picsum.photos/400/300?random=65',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop&auto=format'
    ],
    sucesso: [
        'https://picsum.photos/400/300?random=71',
        'https://picsum.photos/400/300?random=72',
        'https://picsum.photos/400/300?random=73',
        'https://picsum.photos/400/300?random=74',
        'https://picsum.photos/400/300?random=75',
        'https://images.unsplash.com/photo-1527266237111-a4989d028b4b?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format'
    ],
    familia: [
        'https://picsum.photos/400/300?random=81',
        'https://picsum.photos/400/300?random=82',
        'https://picsum.photos/400/300?random=83',
        'https://picsum.photos/400/300?random=84',
        'https://picsum.photos/400/300?random=85',
        'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&auto=format'
    ],
    inspiracao: [
        'https://picsum.photos/400/300?random=91',
        'https://picsum.photos/400/300?random=92',
        'https://picsum.photos/400/300?random=93',
        'https://picsum.photos/400/300?random=94',
        'https://picsum.photos/400/300?random=95',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    ],
    familia: [
        'https://images.unsplash.com/photo-1511895426328-dc8714efa8cd?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1554887681-47d40ffaeaac?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511895426328-dc8714efa8cd?w=400&h=300&fit=crop'
    ],
    inspiracao: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1464822759844-d150ad6cbedb?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1519452634265-7b808fcb13d0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1527266237111-a4989d028b4b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format'
    ],
    versiculo: [
        'https://picsum.photos/400/300?random=101',
        'https://picsum.photos/400/300?random=102',
        'https://picsum.photos/400/300?random=103',
        'https://picsum.photos/400/300?random=104',
        'https://picsum.photos/400/300?random=105',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop&auto=format'
    ]
};

// Elementos de imagem de fundo
let galeriaTemas, uploadImagem, btnRemoverImagem, btnOpacidadeImagem, imagemFundo, imagemFundoContainer;

// Variáveis de controle
let opacidadeAtual = 0.3;
let imagemAtual = null;

// Função para inicializar elementos DOM
function inicializarElementosImagem() {
    try {
        galeriaTemas = document.getElementById('galeriaTemas');
        uploadImagem = document.getElementById('uploadImagem');
        btnRemoverImagem = document.getElementById('btnRemoverImagem');
        btnOpacidadeImagem = document.getElementById('btnOpacidadeImagem');
        imagemFundo = document.getElementById('imagemFundo');
        imagemFundoContainer = document.getElementById('imagemFundoContainer');
        
        console.log('Elementos de imagem inicializados:', {
            galeriaTemas: !!galeriaTemas,
            uploadImagem: !!uploadImagem,
            btnRemoverImagem: !!btnRemoverImagem,
            btnOpacidadeImagem: !!btnOpacidadeImagem,
            imagemFundo: !!imagemFundo,
            imagemFundoContainer: !!imagemFundoContainer
        });
        
        return true;
    } catch (error) {
        console.error('Erro ao inicializar elementos de imagem:', error);
        return false;
    }
}

// Inicializar funcionalidades de imagem
function inicializarImagensFundo() {
    console.log('Iniciando funcionalidades de imagem de fundo...');
    
    // Reinitializar elementos DOM
    if (!inicializarElementosImagem()) {
        console.warn('Alguns elementos de imagem não foram encontrados. Tentando novamente em 1s...');
        setTimeout(inicializarImagensFundo, 1000);
        return;
    }
    
    if (!galeriaTemas) {
        console.error('Galeria de temas não encontrada');
        return;
    }
    
    try {
        // Forçar visibilidade da galeria
        galeriaTemas.style.display = 'grid';
        galeriaTemas.style.visibility = 'visible';
        galeriaTemas.style.opacity = '1';
        galeriaTemas.style.gridTemplateColumns = 'repeat(auto-fit, minmax(70px, 1fr))';
        galeriaTemas.style.gap = '12px';
        
        console.log('Galeria de temas configurada');
        
        // Carregar imagens do tema inicial
        carregarImagensTema('motivacional');
        
        // Event listeners
        const temaSelectElement = document.getElementById('temaSelect');
        if (temaSelectElement) {
            temaSelectElement.addEventListener('change', function() {
                const tema = this.value;
                console.log('Tema alterado para:', tema);
                carregarImagensTema(tema);
            });
        }
        
        if (uploadImagem) {
            uploadImagem.addEventListener('change', function(e) {
                const arquivo = e.target.files[0];
                if (arquivo) {
                    console.log('Arquivo selecionado:', arquivo.name);
                    
                    // Verificar tipo de arquivo
                    if (!arquivo.type.startsWith('image/')) {
                        alert('❌ Por favor, selecione apenas arquivos de imagem!');
                        return;
                    }
                    
                    // Verificar tamanho (max 5MB)
                    if (arquivo.size > 5 * 1024 * 1024) {
                        alert('❌ Imagem muito grande! Máximo 5MB permitido.');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        console.log('Imagem carregada com sucesso');
                        aplicarImagemFundo(e.target.result);
                        imagemAtual = e.target.result;
                        
                        // Feedback visual
                        mostrarFeedback('📤 Imagem personalizada aplicada!', '#4caf50');
                    };
                    reader.onerror = function() {
                        console.error('Erro ao ler arquivo');
                        alert('❌ Erro ao carregar a imagem. Tente novamente.');
                    };
                    reader.readAsDataURL(arquivo);
                }
            });
        }
        
        if (btnRemoverImagem) {
            btnRemoverImagem.addEventListener('click', function() {
                console.log('Removendo imagem de fundo');
                removerImagemFundo();
            });
        }
        
        if (btnOpacidadeImagem) {
            btnOpacidadeImagem.addEventListener('click', function() {
                console.log('Alterando opacidade');
                alterarOpacidade();
            });
        }
        
        // Botão de teste para recarregar galeria
        const btnTestarGaleria = document.getElementById('btnTestarGaleria');
        if (btnTestarGaleria) {
            btnTestarGaleria.addEventListener('click', function() {
                console.log('Recarregando galeria...');
                const temaAtual = document.getElementById('temaSelect')?.value || 'motivacional';
                carregarImagensTema(temaAtual);
                
                // Feedback
                this.textContent = '✅ Recarregado!';
                setTimeout(() => {
                    this.textContent = '🔄 Recarregar Galeria';
                }, 1500);
            });
        }
        
        console.log('Funcionalidades de imagem inicializadas com sucesso');
        
    } catch (error) {
        console.error('Erro durante inicialização das imagens:', error);
    }
}

// Função para mostrar feedback visual
function mostrarFeedback(mensagem, cor = '#4caf50') {
    const feedback = document.createElement('div');
    feedback.textContent = mensagem;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${cor};
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideInFeedback 0.3s ease-out;
    `;
    
    // Adicionar animação CSS
    if (!document.getElementById('feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'feedback-styles';
        style.textContent = `
            @keyframes slideInFeedback {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideInFeedback 0.3s ease-out reverse';
        setTimeout(() => feedback.remove(), 300);
    }, 2500);
}

// Carregar imagens por tema com tratamento de erro melhorado
function carregarImagensTema(tema) {
    console.log('Carregando imagens para tema:', tema);
    
    if (!galeriaTemas) {
        console.error('Galeria não encontrada');
        return;
    }
    
    // Normalizar nome do tema
    let temaNormalizado = tema.toLowerCase();
    if (temaNormalizado === 'inspiração') temaNormalizado = 'inspiracao';
    if (temaNormalizado === 'superação') temaNormalizado = 'superacao';
    if (temaNormalizado === 'gratidão') temaNormalizado = 'gratidao';
    if (temaNormalizado === 'reflexão') temaNormalizado = 'reflexao';
    if (temaNormalizado === 'família') temaNormalizado = 'familia';
    if (temaNormalizado === 'versículo bíblico') temaNormalizado = 'versiculo';
    
    const imagens = imagensPorTema[temaNormalizado];
    if (!imagens) {
        console.warn('Tema não encontrado:', temaNormalizado, 'Usando motivacional');
        carregarImagensTema('motivacional');
        return;
    }
    
    // Mostrar loading
    galeriaTemas.innerHTML = `
        <div style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 30px 20px;
            color: #666;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        ">
            <div style="
                width: 40px;
                height: 40px;
                border: 3px solid #e0e0e0;
                border-top: 3px solid #1976d2;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span>Carregando imagens do tema "${tema}"...</span>
        </div>
    `;
    
    // Adicionar animação de loading se não existir
    if (!document.getElementById('loading-spin-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-spin-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Carregar imagens após um pequeno delay
    setTimeout(() => {
        galeriaTemas.innerHTML = '';
        let imagensCarregadas = 0;
        let imagensComErro = 0;
        
        imagens.forEach((urlImagem, index) => {
            const container = document.createElement('div');
            container.style.cssText = `
                position: relative;
                width: 100%;
                height: 70px;
                background: #f5f5f5;
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            
            const img = document.createElement('img');
            img.src = urlImagem;
            img.className = 'imagem-tema';
            img.alt = `Imagem ${index + 1} do tema ${tema}`;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            
            // Loading placeholder
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 28px;
                color: #bbb;
                transition: all 0.3s;
            `;
            placeholder.textContent = '🖼️';
            
            container.appendChild(placeholder);
            container.appendChild(img);
            
            // Timeout para imagens que demoram muito
            const timeout = setTimeout(() => {
                if (img.style.opacity === '0') {
                    console.warn('Timeout na imagem:', urlImagem);
                    placeholder.textContent = '⏱️';
                    placeholder.style.color = '#ff9800';
                    imagensComErro++;
                    verificarCarregamentoCompleto();
                }
            }, 10000); // 10 segundos timeout
            
            // Quando a imagem carregar
            img.onload = function() {
                clearTimeout(timeout);
                img.style.opacity = '1';
                placeholder.style.display = 'none';
                imagensCarregadas++;
                console.log(`Imagem ${index + 1} carregada:`, urlImagem);
                verificarCarregamentoCompleto();
            };
            
            // Se a imagem falhar ao carregar
            img.onerror = function() {
                clearTimeout(timeout);
                console.error('Erro ao carregar imagem:', urlImagem);
                placeholder.textContent = '❌';
                placeholder.style.color = '#e53935';
                placeholder.style.fontSize = '20px';
                imagensComErro++;
                verificarCarregamentoCompleto();
            };
            
            // Click handler
            container.onclick = function() {
                if (img.style.opacity === '1') {
                    selecionarImagemTema(this, urlImagem);
                }
            };
            
            // Hover effects
            container.onmouseenter = function() {
                if (img.style.opacity === '1') {
                    this.style.borderColor = '#1976d2';
                    this.style.transform = 'scale(1.05)';
                    this.style.boxShadow = '0 4px 20px rgba(25,118,210,0.3)';
                }
            };
            
            container.onmouseleave = function() {
                if (!this.classList.contains('selecionada')) {
                    this.style.borderColor = 'transparent';
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
            };
            
            galeriaTemas.appendChild(container);
        });
        
        function verificarCarregamentoCompleto() {
            const total = imagens.length;
            const processadas = imagensCarregadas + imagensComErro;
            
            if (processadas === total) {
                console.log(`Carregamento completo - Sucesso: ${imagensCarregadas}, Erro: ${imagensComErro}`);
                if (imagensComErro > 0) {
                    mostrarFeedback(`⚠️ ${imagensComErro} imagem(ns) falharam ao carregar`, '#ff9800');
                }
                if (imagensCarregadas > 0) {
                    mostrarFeedback(`✅ ${imagensCarregadas} imagem(ns) carregadas para "${tema}"`, '#4caf50');
                }
            }
        }
        
// Selecionar imagem do tema
// Selecionar imagem do tema
function selecionarImagemTema(elemento, urlImagem) {
    console.log('Selecionando imagem:', urlImagem);
    
    // Remove seleção anterior
    document.querySelectorAll('.galeria-temas > div').forEach(container => {
        container.classList.remove('selecionada');
        container.style.borderColor = 'transparent';
        container.style.transform = 'scale(1)';
        container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });
    
    // Adiciona seleção ao container clicado
    elemento.classList.add('selecionada');
    elemento.style.borderColor = '#1976d2';
    elemento.style.boxShadow = '0 0 0 2px #1976d2, 0 4px 20px rgba(25,118,210,0.3)';
    elemento.style.transform = 'scale(1.02)';
    
    // Aplica a imagem como fundo
    aplicarImagemFundo(urlImagem);
    imagemAtual = urlImagem;
    
    // Feedback visual
    mostrarFeedback('✅ Imagem aplicada com sucesso!', '#4caf50');
}

// Aplicar imagem de fundo com tratamento de erro
function aplicarImagemFundo(urlImagem) {
    console.log('Aplicando imagem de fundo:', urlImagem);
    
    if (!imagemFundo) {
        console.error('Elemento imagemFundo não encontrado');
        mostrarFeedback('❌ Erro: elemento de imagem não encontrado', '#f44336');
        return;
    }
    
    try {
        // Criar uma nova imagem para testar se carrega
        const testeImg = new Image();
        
        testeImg.onload = function() {
            console.log('Imagem validada, aplicando ao fundo');
            imagemFundo.src = urlImagem;
            imagemFundo.style.opacity = opacidadeAtual;
            
            // Salvar no localStorage
            localStorage.setItem('imagemFundo', urlImagem);
            localStorage.setItem('opacidadeImagem', opacidadeAtual);
            
            console.log('Imagem de fundo aplicada com sucesso');
        };
        
        testeImg.onerror = function() {
            console.error('Erro ao carregar imagem:', urlImagem);
            mostrarFeedback('❌ Erro ao carregar a imagem', '#f44336');
        };
        
        testeImg.src = urlImagem;
        
    } catch (error) {
        console.error('Erro ao aplicar imagem de fundo:', error);
        mostrarFeedback('❌ Erro ao aplicar imagem', '#f44336');
    }
}

// Remover imagem de fundo
function removerImagemFundo() {
    console.log('Removendo imagem de fundo');
    
    if (!imagemFundo) {
        console.error('Elemento imagemFundo não encontrado');
        return;
    }
    
    try {
        imagemFundo.src = '';
        imagemFundo.style.opacity = 0;
        imagemAtual = null;
        
        // Remove seleção das imagens
        document.querySelectorAll('.galeria-temas > div').forEach(container => {
            container.classList.remove('selecionada');
            container.style.borderColor = 'transparent';
            container.style.transform = 'scale(1)';
            container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        
        // Remove do localStorage
        localStorage.removeItem('imagemFundo');
        localStorage.removeItem('opacidadeImagem');
        
        // Feedback visual
        mostrarFeedback('🗑️ Imagem de fundo removida', '#f44336');
        
    } catch (error) {
        console.error('Erro ao remover imagem:', error);
    }
}

// Alterar opacidade
function alterarOpacidade() {
    if (!imagemFundo || !imagemAtual) {
        mostrarFeedback('❌ Nenhuma imagem de fundo ativa', '#ff9800');
        return;
    }
    
    try {
        // Cicla entre 0.2, 0.3, 0.5, 0.7, 0.9
        const opacidades = [0.2, 0.3, 0.5, 0.7, 0.9];
        const indiceAtual = opacidades.indexOf(opacidadeAtual);
        const proximoIndice = (indiceAtual + 1) % opacidades.length;
        
        opacidadeAtual = opacidades[proximoIndice];
        imagemFundo.style.opacity = opacidadeAtual;
        
        // Salvar no localStorage
        localStorage.setItem('opacidadeImagem', opacidadeAtual);
        
        // Feedback visual
        const porcentagem = Math.round(opacidadeAtual * 100);
        mostrarFeedback(`🔍 Opacidade: ${porcentagem}%`, '#2196f3');
        
        if (btnOpacidadeImagem) {
            btnOpacidadeImagem.textContent = `🔍 ${porcentagem}%`;
            setTimeout(() => {
                btnOpacidadeImagem.textContent = '🔍 Opacidade';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Erro ao alterar opacidade:', error);
    }
}

// Carregar configuração salva
function carregarImagemSalva() {
    console.log('Carregando configuração de imagem salva...');
    
    try {
        const imagemSalva = localStorage.getItem('imagemFundo');
        const opacidadeSalva = localStorage.getItem('opacidadeImagem');
        
        if (imagemSalva) {
            console.log('Imagem salva encontrada:', imagemSalva);
            imagemAtual = imagemSalva;
            
            if (opacidadeSalva) {
                opacidadeAtual = parseFloat(opacidadeSalva);
                console.log('Opacidade salva:', opacidadeAtual);
            }
            
            aplicarImagemFundo(imagemSalva);
        } else {
            console.log('Nenhuma imagem salva encontrada');
        }
    } catch (error) {
        console.error('Erro ao carregar imagem salva:', error);
    }
}

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando sistema de imagens...');
    
    // Aguardar um pouco para garantir que todos os elementos estejam prontos
    setTimeout(() => {
        inicializarImagensFundo();
        carregarImagemSalva();
    }, 500);
});

// Também inicializar quando a sidebar for aberta
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnMenuUsuario') {
        // Pequeno delay para aguardar a sidebar abrir
        setTimeout(() => {
            if (!galeriaTemas) {
                console.log('Reinicializando sistema de imagens...');
                inicializarImagensFundo();
            }
        }, 100);
    }
});