document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const emailInput = document.getElementById('email-login');
    const senhaInput = document.getElementById('senha-login');
    const msgAlerta = document.getElementById('mensagem-alerta') || document.getElementById('mensagem-erro');
    const btnSubmit = document.querySelector('.btn-auth-submit');

    // 🎨 Função Única para exibir Alertas (Erro ou Sucesso)
    function exibirAlerta(mensagem, tipo = 'error') {
        if (!msgAlerta) return;

        msgAlerta.textContent = mensagem;
        msgAlerta.className = `alert-box alert-${tipo}`; // Aplica alert-error ou alert-success
        msgAlerta.style.display = 'block';

        if (tipo === 'error') {
            if (emailInput) emailInput.classList.add('input-error');
            if (senhaInput) senhaInput.classList.add('input-error');
        } else {
            if (emailInput) emailInput.classList.remove('input-error');
            if (senhaInput) senhaInput.classList.remove('input-error');
        }
    }

    // 🧹 Função para Limpar Alertas
    function limparAlerta() {
        if (msgAlerta) {
            msgAlerta.style.display = 'none';
            msgAlerta.textContent = '';
        }
        if (emailInput) emailInput.classList.remove('input-error');
        if (senhaInput) senhaInput.classList.remove('input-error');
    }

    // Limpa os erros quando o usuário começa a digitar nos campos
    if (emailInput) emailInput.addEventListener('input', limparAlerta);
    if (senhaInput) senhaInput.addEventListener('input', limparAlerta);

    // 🚀 Lógica de Envio do Formulário com Async/Await
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();
            limparAlerta();

            // Bloqueia o botão para evitar múltiplos cliques
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Entrando...';
            }

            try {
                // Requisição direta e assíncrona para o C#
                const resposta = await fetch('http://localhost:5200/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput ? emailInput.value : '',
                        senha: senhaInput ? senhaInput.value : ''
                    })
                });

                // Converte a resposta recebida
                const dados = await resposta.json().catch(() => null);

                // Diagnóstico visual no Console F12
                console.log('Status HTTP da resposta:', resposta.status);
                console.log('Dados vindos da API C#:', dados);

                // 🟢 SE O SERVIDOR RETORNOU STATUS DE SUCESSO (200, 201, etc.)
                if (resposta.ok) {
                    const textoSucesso = (dados && dados.mensagem) ? dados.mensagem : 'Login efetuado com sucesso!';
                    exibirAlerta(textoSucesso, 'success');

                    // Salva o Token JWT
                    if (dados && dados.token) {
                        sessionStorage.setItem('token_perfilExato', dados.token);
                    }

                    // Aguarda 1.2s para mostrar a caixa verde antes de redirecionar
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1200);

                } else {
                    // 🔴 SE O SERVIDOR RETORNOU ERRO (400, 401, 404, etc.)
                    const textoErro = (dados && dados.mensagem) ? dados.mensagem : 'E-mail ou senha incorretos.';
                    exibirAlerta(textoErro, 'error');

                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Entrar';
                    }
                }

            } catch (erroConexao) {
                // ⚠️ SE O SERVIDOR C# ESTIVER DESLIGADO OU HOUVER ERRO DE REDE
                console.error('Falha de Conexão:', erroConexao);
                exibirAlerta('Não foi possível conectar ao servidor C#.', 'error');

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Entrar';
                }
            }
        });
    }
});