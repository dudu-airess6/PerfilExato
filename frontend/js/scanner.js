document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está logado
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');
    if (!tokenAtivo) {
        window.location.href = 'login.html';
        return;
    }

    // ⏱️ Espera 3 segundos com a animação rodando na tela
    setTimeout(() => {
        // Depois de dar a sensação de "escaneado", direciona para o perfil
        window.location.href = 'perfil.html'; // 👈 Coloque o nome correto da sua tela de perfil aqui
    }, 3000); 
});