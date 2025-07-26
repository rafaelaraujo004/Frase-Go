// ...existing code...
// Função para alternar o ícone do convidado conforme o modo
function alternarIconeConvidado() {
    const iconeConvidado = document.getElementById('iconeConvidado');
    if (!iconeConvidado) return;
    if (document.body.classList.contains('dark-mode')) {
        iconeConvidado.classList.add('dark');
        iconeConvidado.classList.remove('normal');
    } else {
        iconeConvidado.classList.remove('dark');
        iconeConvidado.classList.add('normal');
    }
}

// Garante que o ícone está correto ao carregar a página
// ...existing code...
document.addEventListener('DOMContentLoaded', alternarIconeConvidado);

// ...existing code...
const btnDarkMode = document.getElementById('btnDarkMode');
btnDarkMode?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    alternarIconeConvidado();
});
// ...existing code...
