document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login'); 

    if (formLogin) {
        formLogin.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita recarregar a página

            const email = document.getElementById('email-login').value; 
            const senha = document.getElementById('senha-login').value; 

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
                    
                    // 🔑 NOVIDADE AQUI: Salva o token na memória do navegador
                    sessionStorage.setItem('token_perfilExato', data.token);
                    
                    // Redireciona para a página principal
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