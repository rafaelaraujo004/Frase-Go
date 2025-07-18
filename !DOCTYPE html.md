/\* === Fonte Global === \*/

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700\&family=Lato:wght@400;700\&family=Montserrat:wght@400;700\&family=Open+Sans:wght@400;700\&family=Roboto:wght@400;700\&family=Space+Mono:wght@400;700\&display=swap');



/\* === Corpo === \*/

body {

&nbsp;   background: #f6f6f6;

&nbsp;   color: #222;

&nbsp;   font-family: 'Inter', Arial, sans-serif;

&nbsp;   margin: 0;

&nbsp;   min-height: 100vh;

&nbsp;   min-width: 100vw;

&nbsp;   width: 100vw;

&nbsp;   display: flex;

&nbsp;   align-items: center;

&nbsp;   justify-content: center;

}

.container {

&nbsp;   background: #fff;

&nbsp;   border-radius: 25px;

&nbsp;   box-shadow: 0 4px 24px rgba(0,0,0,0.07);

&nbsp;   padding: 18px 8px 24px;

&nbsp;   display: flex;

&nbsp;   flex-direction: column;

&nbsp;   align-items: center;

&nbsp;   justify-content: flex-start;

&nbsp;   min-height: 540px;

&nbsp;   min-width: 0;

&nbsp;   width: 100vw;           /\* Preenche toda largura da tela \*/

&nbsp;   max-width: 600px;       /\* Limite máximo, pode ajustar! \*/

&nbsp;   margin: auto;           /\* Centraliza horizontalmente \*/

&nbsp;   box-sizing: border-box;

&nbsp;   text-align: center;

}

@media (max-width: 600px) {

&nbsp;   .container {

&nbsp;       max-width: 100vw;

&nbsp;       border-radius: 0;

&nbsp;       box-shadow: none;

&nbsp;       padding: 8px 0 16px;

&nbsp;   }

&nbsp;   body {

&nbsp;       padding: 0;

&nbsp;   }

}

body.dark-mode {

&nbsp;   background: #181a1b !important;

&nbsp;   color: #eee !important;

}

body.dark-mode .frase-box {

&nbsp;   background: #23272b !important;

&nbsp;   color: #eee !important;

&nbsp;   box-shadow: 0 2px 12px #0006;

}

body.dark-mode select,

body.dark-mode button,

body.dark-mode input {

&nbsp;   background: #23272b !important;

&nbsp;   color: #eee !important;

&nbsp;   border-color: #444 !important;

}

body.dark-mode svg {

&nbsp;   stroke: #eee !important;

}



/\* === Botões Redondos Com Ícone === \*/

.remover-fav-btn,

.remover-todos-btn,

.copiar-fav-btn,

.copiar-btn {

&nbsp;   background: #fff;

&nbsp;   border-radius: 50%;

&nbsp;   display: inline-flex;

&nbsp;   align-items: center;

&nbsp;   justify-content: center;

&nbsp;   cursor: pointer;

&nbsp;   transition: border 0.2s, background 0.2s;

&nbsp;   padding: 0;

&nbsp;   vertical-align: middle;

}



/\* Dimensões individuais \*/

.remover-fav-btn,

.remover-todos-btn {

&nbsp;   border: 2px solid #e53935;

&nbsp;   width: clamp(28px, 1.5vw + 1.2rem, 36px);

&nbsp;   height: clamp(28px, 1.5vw + 1.2rem, 36px);

&nbsp;   margin-left: 8px;

}



.remover-todos-btn {

&nbsp;   margin-top: 2px;

&nbsp;   visibility: visible;

}



.copiar-fav-btn {

&nbsp;   border: 2px solid #222;

&nbsp;   width: 32px;

&nbsp;   height: 32px;

&nbsp;   margin-left: 8px;

}



.copiar-btn {

&nbsp;   border: 2px solid #222;

&nbsp;   width: 38px;

&nbsp;   height: 38px;

&nbsp;   margin-left: 8px;

&nbsp;   display: flex;

}



/\* Estados ativos \*/

.remover-fav-btn:active,

.remover-todos-btn:active {

&nbsp;   border-color: #b71c1c;

}



.copiar-fav-btn:active,

.copiar-btn:active {

&nbsp;   border-color: #2196f3;

}



/\* SVGs dentro dos botões \*/

.remover-fav-btn svg,

.remover-todos-btn svg,

.copiar-fav-btn svg,

.copiar-btn svg {

&nbsp;   display: block;

&nbsp;   stroke: currentColor;

&nbsp;   fill: none;

&nbsp;   transition: fill 0.2s, stroke 0.2s;

&nbsp;   width: 70%;

&nbsp;   height: 70%;

&nbsp;   max-width: 20px;

&nbsp;   max-height: 20px;

&nbsp;   min-width: 12px;

&nbsp;   min-height: 12px;

}



/\* Cores dos strokes individuais \*/

.remover-fav-btn svg,

.remover-todos-btn svg {

&nbsp;   stroke: #e53935;

}



.copiar-fav-btn svg,

.copiar-btn svg {

&nbsp;   stroke: #222;

}



/\* === Layouts === \*/

.favoritos-header {

&nbsp;   display: flex;

&nbsp;   align-items: center;

&nbsp;   justify-content: space-between;

&nbsp;   width: 100%;

&nbsp;   margin-bottom: 8px;

}



.mid-bar {

&nbsp;   display: flex;

&nbsp;   align-items: center;

&nbsp;   justify-content: center;

&nbsp;   gap: 18px;

&nbsp;   margin-top: 0.5rem;

}



.bottom-botoes {

&nbsp;   margin-top: 1.1rem;

&nbsp;   display: flex;

&nbsp;   justify-content: space-between;

&nbsp;   gap: 0.7rem;

&nbsp;   width: 100%;

&nbsp;   padding-bottom: 8px;

&nbsp;   box-sizing: border-box;

}



.bottom-botoes button {

&nbsp;   flex: 1;

&nbsp;   min-width: 0;

&nbsp;   max-width: 100%;

&nbsp;   white-space: nowrap;

&nbsp;   overflow: hidden;

&nbsp;   text-overflow: ellipsis;

}

body.dark-mode .frase-box,

body.dark-mode .favoritos-content,

body.dark-mode .tags-content {

&nbsp; background: #23272b !important;

&nbsp; color: #eee !important;

&nbsp; box-shadow: 0 4px 24px rgba(0,0,0,0.35);

}

body.dark-mode svg {

&nbsp; stroke: #eee !important;

}

body.dark-mode select,

body.dark-mode button,

body.dark-mode input {

&nbsp; background: #23272b !important;

&nbsp; color: #eee !important;

&nbsp; border-color: #444 !important;

}

body.dark-mode #iconeJogoDaVelha {

&nbsp; color: #fff !important;

}

body.dark-mode .favoritos-content h2,

body.dark-mode .tags-content h2 {

&nbsp; color: #fff !important;

}

body.dark-mode .favoritos-lista li {

&nbsp; border-bottom: 1px solid #444 !important;

&nbsp; color: #eee !important;

}

body.dark-mode .fechar-modal {

&nbsp; background: #444 !important;

&nbsp; color: #fff !important;

}

body.dark-mode .fechar-modal:hover {

&nbsp; background: #222 !important;

}

body.dark-mode .bg-watermark {

&nbsp; opacity: 0.5 !important;

&nbsp; filter: brightness(1.5) grayscale(0.2) contrast(1.1);

}



/\* === Light Mode Watermark === \*/

body:not(.dark-mode) .bg-watermark {

&nbsp;   filter: drop-shadow(0 0 6px #fff8) drop-shadow(0 0 2px #0002);

&nbsp;   opacity: 0.38;

}



/\* === Container Principal === \*/

.container {

&nbsp; background: #fff;

&nbsp; border-radius: 18px;

&nbsp; box-shadow: 0 4px 24px rgba(0,0,0,0.07);

&nbsp; padding: 18px 8px 24px;

&nbsp; display: flex;

&nbsp; flex-direction: column;

&nbsp; align-items: center;

&nbsp; justify-content: flex-start;

&nbsp; min-height: 540px;

&nbsp; max-width: 420px;

&nbsp; width: 100vw;

&nbsp; text-align: center;

&nbsp; box-sizing: border-box;

}



/\* === Títulos e Texto === \*/

h1 {

&nbsp; font-size: 2.2rem;

&nbsp; margin: 0 0 10px;

&nbsp; font-weight: 700;

&nbsp; letter-spacing: -1px;

&nbsp; width: 100%;

&nbsp; text-align: center;

}



/\* === Frase Box === \*/

.frase-box {

&nbsp; display: flex;

&nbsp; flex-direction: column;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; gap: 0.5rem;

&nbsp; padding: calc(2cm + 1.2rem) 5vw calc(2cm + 0.7rem) 5vw; /\* top, right, bottom, left \*/

&nbsp; margin: 0 auto;

&nbsp; width: 100%;

&nbsp; max-width: 400px;

&nbsp; min-width: 0;

&nbsp; box-sizing: border-box;

}



.frase-box > \*:not(.bg-watermark) {

&nbsp; position: relative;

&nbsp; z-index: 1;

}



.frase {

&nbsp; font-size: 2.18rem;

&nbsp; min-height: 60px;

&nbsp; width: 100%;

&nbsp; text-align: center;

&nbsp; line-height: 1.45;

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; transition: font-family 0.3s;

&nbsp; overflow-wrap: break-word;

}



/\* === Botões e Controles === \*/

.controls {

&nbsp; display: flex;

&nbsp; gap: 12px;

&nbsp; justify-content: center;

&nbsp; margin-bottom: 24px;

}



select {

&nbsp; padding: 8px 12px;

&nbsp; border-radius: 8px;

&nbsp; border: 1.5px solid #0d47a1;

&nbsp; background: rgba(255,255,255,0.65);

&nbsp; font-size: 0.7rem;

&nbsp; color: #0d47a1;

&nbsp; outline: none;

&nbsp; box-shadow: 0 1px 6px #0001;

&nbsp; transition: background 0.2s, border 0.2s;

&nbsp; backdrop-filter: blur(2px);

}



select:focus {

&nbsp; background: rgba(255,255,255,0.85);

&nbsp; border-color: #08306b;

}



button {

&nbsp; background: #0d47a1;

&nbsp; color: #fff;

&nbsp; border: none;

&nbsp; border-radius: 8px;

&nbsp; padding: 12px 28px;

&nbsp; font-size: 1rem;

&nbsp; font-weight: 600;

&nbsp; cursor: pointer;

&nbsp; transition: background 0.2s;

}



button:hover {

&nbsp; background: #08306b;

}



/\* === Botões de Ação (Favoritos, Coração etc.) === \*/

.coracao-btn,

.favoritos-btn {

&nbsp; background: #fff;

&nbsp; border: 2px solid #222;

&nbsp; border-radius: 50%;

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; cursor: pointer;

&nbsp; transition: border 0.2s, background 0.2s;

&nbsp; padding: 0;

}



.coracao-btn {

&nbsp; width: 48px;

&nbsp; height: 48px;

&nbsp; margin-left: 8px;

}



.favoritos-btn {

&nbsp; width: 40px;

&nbsp; height: 40px;

&nbsp; margin-left: 8px;

}



.coracao-btn svg,

.favoritos-btn svg {

&nbsp; stroke: #222;

&nbsp; fill: none;

&nbsp; transition: fill 0.2s, stroke 0.2s;

}



.coracao-btn.favorito svg {

&nbsp; fill: #e53935;

&nbsp; stroke: #e53935;

}



.favoritos-btn.ativo svg {

&nbsp; fill: #ff9800;

&nbsp; stroke: #ff9800;

}



.coracao-btn:focus {

&nbsp; outline: 2px solid #e53935;

}



/\* === Modal de Favoritos === \*/

\#favoritosModal {

&nbsp; position: fixed;

&nbsp; top: 0;

&nbsp; left: 0;

&nbsp; width: 100vw;

&nbsp; height: 100vh;

&nbsp; background: rgba(0,0,0,0.25);

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; z-index: 1000;

&nbsp; visibility: hidden;

&nbsp; opacity: 0;

&nbsp; transition: opacity 0.2s, visibility 0.2s;

}



\#favoritosModal.ativo {

&nbsp; visibility: visible;

&nbsp; opacity: 1;

}



.favoritos-content {

&nbsp; background: #fff;

&nbsp; border-radius: 16px;

&nbsp; box-shadow: 0 4px 24px rgba(0,0,0,0.12);

&nbsp; padding: 32px 24px;

&nbsp; max-width: 400px;

&nbsp; width: 90vw;

&nbsp; max-height: 80vh;

&nbsp; overflow-y: auto;

&nbsp; display: flex;

&nbsp; flex-direction: column;

&nbsp; align-items: center;

}



.favoritos-content h2 {

&nbsp; font-size: 1.5rem;

&nbsp; margin: 0 0 18px;

}



.favoritos-lista {

&nbsp; width: 100%;

&nbsp; margin-bottom: 18px;

}



.favoritos-lista li {

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: space-between;

&nbsp; gap: 0.5rem;

&nbsp; padding: 10px 0;

&nbsp; font-size: 1.1rem;

&nbsp; text-align: left;

&nbsp; border-bottom: 1px solid #eee;

&nbsp; word-break: break-word;

}



.favoritos-lista span {

&nbsp; flex: 1;

&nbsp; min-width: 0;

&nbsp; font-size: 1em;

&nbsp; overflow-wrap: break-word;

&nbsp; word-break: break-word;

}



.favoritos-lista button {

&nbsp; flex-shrink: 0;

&nbsp; width: 2.2em;

&nbsp; height: 2.2em;

&nbsp; min-width: 36px;

&nbsp; min-height: 36px;

&nbsp; max-width: 44px;

&nbsp; max-height: 44px;

&nbsp; margin-left: 6px;

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; padding: 0;

}



.favoritos-lista svg {

&nbsp; width: 1.4em;

&nbsp; height: 1.4em;

&nbsp; min-width: 18px;

&nbsp; min-height: 18px;

&nbsp; max-width: 28px;

&nbsp; max-height: 28px;

}



/\* Ajuste para telas pequenas \*/

@media (max-width: 600px) {

&nbsp; .favoritos-content {

&nbsp;   padding: 16px 4px;

&nbsp;   max-width: 98vw;

&nbsp; }

&nbsp; .favoritos-lista li {

&nbsp;   font-size: 1rem;

&nbsp;   gap: 0.3rem;

&nbsp;   padding: 8px 0;

&nbsp; }

&nbsp; .favoritos-lista button {

&nbsp;   min-width: 30px;

&nbsp;   min-height: 30px;

&nbsp;   width: 1.8em;

&nbsp;   height: 1.8em;

&nbsp; }

&nbsp; .favoritos-lista svg {

&nbsp;   min-width: 16px;

&nbsp;   min-height: 16px;

&nbsp;   width: 1.1em;

&nbsp;   height: 1.1em;

&nbsp; }

&nbsp; .favoritos-lista span {

&nbsp;   font-size: 0.97em;

&nbsp; }

}



/\* Ajuste para telas muito pequenas \*/

@media (max-width: 400px) {

&nbsp; .favoritos-lista li {

&nbsp;   font-size: 0.92rem;

&nbsp;   gap: 0.15rem;

&nbsp;   padding: 6px 0;

&nbsp; }

&nbsp; .favoritos-lista button {

&nbsp;   min-width: 24px;

&nbsp;   min-height: 24px;

&nbsp;   width: 1.2em;

&nbsp;   height: 1.2em;

&nbsp; }

&nbsp; .favoritos-lista svg {

&nbsp;   min-width: 12px;

&nbsp;   min-height: 12px;

&nbsp;   width: 0.9em;

&nbsp;   height: 0.9em;

&nbsp; }

&nbsp; .favoritos-lista span {

&nbsp;   font-size: 0.92em;

&nbsp; }

}



/\* === Barra Superior === \*/

.top-bar {

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: space-between;

&nbsp; margin-bottom: 8px;

}



.top-bar-center {

&nbsp; flex: 1;

&nbsp; display: flex;

&nbsp; justify-content: center;

&nbsp; align-items: flex-start;

}



/\* === Marca d'água temática === \*/

.bg-watermark {

&nbsp; position: absolute;

&nbsp; inset: 0;

&nbsp; width: 100%;

&nbsp; height: 100%;

&nbsp; z-index: 0;

&nbsp; opacity: 0.33;

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; pointer-events: none;

&nbsp; background-repeat: no-repeat;

&nbsp; background-position: center;

&nbsp; background-size: 70% auto;

&nbsp; transition: background-image 0.3s, opacity 0.2s;

&nbsp; margin-top: 2cm;

}



/\* === Botões Copiar e Jogo da Velha === \*/

.botoes-copiar-tags {

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; gap: 12px;

&nbsp; margin-top: 16px;

&nbsp; width: 100%;

&nbsp; padding: 0 8px;

&nbsp; box-sizing: border-box;

}



.botoes-copiar-tags button {

&nbsp; flex: 1;

&nbsp; min-width: 0;

&nbsp; max-width: 100%;

&nbsp; white-space: nowrap;

&nbsp; overflow: hidden;

&nbsp; text-overflow: ellipsis;

}



\#iconeJogoDaVelha {

&nbsp;   font-weight: 400 !important;

}

body.dark-mode #tagsModal {

&nbsp; background: rgba(0,0,0,0.45) !important;

}

body.dark-mode .tags-content {

&nbsp; background: #23272b !important;

&nbsp; color: #eee !important;

&nbsp; box-shadow: 0 4px 24px rgba(0,0,0,0.35);

}

body.dark-mode .tags-content h2 {

&nbsp; color: #fff !important;

}

body.dark-mode .tags-content button {

&nbsp; background: #444 !important;

&nbsp; color: #fff !important;

}

body.dark-mode .tags-content button:hover {

&nbsp; background: #222 !important;

}

body.dark-mode .tags-content div {

&nbsp; background: #333 !important;

&nbsp; color: #eee !important;

&nbsp; border-color: #444 !important;

}

\#logoApp {

&nbsp; margin-left: -7cm;

position: relative;

left: -8cm;

}



/\* Melhorias de acessibilidade para botões \*/

button:focus, .coracao-btn:focus, .fechar-modal:focus {

&nbsp;   outline: 2px solid #2196f3;

&nbsp;   outline-offset: 2px;

}



/\* Responsividade extra para dispositivos menores \*/

@media (max-width: 400px) {

&nbsp;   .container {

&nbsp;       padding: 4px 0 8px;

&nbsp;       font-size: 0.95rem;

&nbsp;   }

&nbsp;   .frase-box {

&nbsp;       padding: 1.2rem 2vw 1.2rem 2vw;

&nbsp;       max-width: 98vw;

&nbsp;   }

&nbsp;   h1 {

&nbsp;       font-size: 1.5rem;

&nbsp;   }

}



/\* Corrige sobreposição do logo em telas pequenas \*/

@media (max-width: 600px) {

&nbsp;   #logoApp {

&nbsp;       margin-left: 0;

&nbsp;       left: 0;

&nbsp;       position: static;

&nbsp;       max-width: 120px;

&nbsp;       width: 100%;

&nbsp;   }

}



/\* Melhora contraste de botões no modo escuro \*/

body.dark-mode button,

body.dark-mode .fechar-modal {

&nbsp;   background: #23272b !important;

&nbsp;   color: #ff9800 !important;

&nbsp;   border-color: #ff9800 !important;

}



body.dark-mode button:hover,

body.dark-mode .fechar-modal:hover {

&nbsp;   background: #444 !important;

&nbsp;   color: #fff !important;

}



/\* Corrige detalhes vazados da logo/frase no modo dark \*/

body.dark-mode #logoApp,

body.dark-mode .logoApp,

body.dark-mode .logo-frase {

&nbsp; filter: brightness(1.2) contrast(1.3) drop-shadow(0 0 2px #181a1b) !important;

&nbsp; /\* Se for SVG, força preenchimento \*/

&nbsp; fill: #fff !important;

&nbsp; stroke: #fff !important;

}



/\* Se a logo for SVG, garanta que todos paths estejam preenchidos \*/

body.dark-mode #logoApp svg path,

body.dark-mode .logoApp svg path,

body.dark-mode .logo-frase svg path {

&nbsp; fill: #fff !important;

&nbsp; stroke: #fff !important;

}



