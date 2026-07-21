document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login'); // Verifique se o ID do seu form html é esse mesmo

    if (formLogin) {
        formLogin.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita recarregar a página

            const email = document.getElementById('email-login').value; // Verifique o ID do input de email
            const senha = document.getElementById('senha-login').value; // Verifique o ID do input de senha

            const dadosLogin = { email, senha };

            // --- CONECTANDO À ROTA DE LOGIN DO C# ---
            fetch('http://localhost:5200/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosLogin)
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert(data.mensagem); // "Login realizado com sucesso!"
                    
                    // Altere 'dashboard.html' ou 'index.html' para o nome da página principal do seu projeto
                    window.location.href = 'index.html'; 
                } else {
                    alert('Erro de Autenticação: ' + data.mensagem); 
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Não foi possível conectar ao servidor C# para fazer o login.');
            });
        });
    }
});