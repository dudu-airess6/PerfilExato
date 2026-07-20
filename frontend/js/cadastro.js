document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita recarregar a página

            const nome = document.getElementById('nome-cadastro').value;
            const email = document.getElementById('email-cadastro').value;
            const senha = document.getElementById('senha-cadastro').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;

            // --- NOVA LÓGICA: Validação das Senhas ---
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem! Por favor, digite senhas iguais.');
                return; // O 'return' trava a execução aqui e não deixa criar a conta
            }

            // Guarda a "conta" no banco de dados simulado (localStorage)
            const novaConta = { nome, email, senha };
            localStorage.setItem('conta_perfilExato', JSON.stringify(novaConta));

            alert('Conta criada com sucesso! Faça login para continuar.');
            
            // Redireciona o utilizador para a página de login
            window.location.href = 'login.html';
        });
    }
});