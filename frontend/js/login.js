document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    if (formLogin) {
        formLogin.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailDigitado = document.getElementById('email-login').value;
            const senhaDigitada = document.getElementById('senha-login').value;

            // Busca a conta salva no localStorage
            const contaSalva = JSON.parse(localStorage.getItem('conta_perfilExato'));

            if (!contaSalva) {
                alert('Nenhuma conta encontrada. Por favor, crie uma conta primeiro.');
                return;
            }

           if (emailDigitado === contaSalva.email && senhaDigitada === contaSalva.senha) {
            // Sucesso! Vai direto para o formulário
            window.location.href = 'formulario.html';
        } else {
                alert('E-mail ou senha incorretos!');
            }
        });
    }
});