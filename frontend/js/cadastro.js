document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', (event) => {
            event.preventDefault(); 

            const nome = document.getElementById('nome-cadastro').value;
            const email = document.getElementById('email-cadastro').value;
            const senha = document.getElementById('senha-cadastro').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;

            // Validação visual do front
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem! Por favor, digite senhas iguais.');
                return;
            }

            const dados = { nome, email, senha };

            // --- AGORA CONECTADO AO PORTA 5200 DO C# ---
            fetch('http://localhost:5200/api/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert(data.mensagem); 
                    window.location.href = 'login.html'; 
                } else {
                    alert('Erro no Servidor C#: ' + data.mensagem); 
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Não foi possível conectar ao servidor C#. Verifique se ele está rodando no terminal!');
            });
        });
    }
});