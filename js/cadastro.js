document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const nomeInput = document.getElementById('nome-cadastro');
    const emailInput = document.getElementById('email-cadastro');
    const senhaInput = document.getElementById('senha-cadastro');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');
    
    const msgAlerta = document.getElementById('mensagem-alerta') || document.getElementById('mensagem-erro');
    const btnSubmit = document.querySelector('.btn-auth-submit') || document.querySelector('button[type="submit"]');

    // Lista com todos os inputs para manipulação de estilos de erro
    const todosInputs = [nomeInput, emailInput, senhaInput, confirmarSenhaInput].filter(Boolean);

    // 📧 Função para validar se o e-mail possui "@" e o ponto "." do domínio (ex: nome@dominio.com)
    function validarEmail(email) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexEmail.test(email);
    }

    // 🎨 Função para exibir os Alertas Visuais (Erro ou Sucesso)
    function exibirAlerta(mensagem, tipo = 'error', camposComErro = []) {
        if (!msgAlerta) return;

        msgAlerta.textContent = mensagem;
        msgAlerta.className = `alert-box alert-${tipo}`;
        msgAlerta.style.display = 'block';

        // Destaca campos específicos em vermelho se forem passados, ou todos se for erro geral
        if (tipo === 'error') {
            if (camposComErro.length > 0) {
                camposComErro.forEach(input => input && input.classList.add('input-error'));
            } else {
                todosInputs.forEach(input => input.classList.add('input-error'));
            }
        } else {
            todosInputs.forEach(input => input.classList.remove('input-error'));
        }
    }

    // 🧹 Função para Limpar Alertas e bordas vermelhas
    function limparAlerta() {
        if (msgAlerta) {
            msgAlerta.style.display = 'none';
            msgAlerta.textContent = '';
        }
        todosInputs.forEach(input => input.classList.remove('input-error'));
    }

    // Limpa os alertas vermelhos assim que o usuário digita em qualquer campo
    todosInputs.forEach(input => input.addEventListener('input', limparAlerta));

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita recarregar a página
            limparAlerta();

            const nome = nomeInput ? nomeInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const senha = senhaInput ? senhaInput.value : '';
            const confirmarSenha = confirmarSenhaInput ? confirmarSenhaInput.value : '';

            // 1. 🔍 Validação local: Formato de E-mail (Exige @ e .)
            if (!validarEmail(email)) {
                exibirAlerta('Por favor, insira um e-mail válido contendo "@" e o domínio (ex: seu@gmail.com).', 'error', [emailInput]);
                return;
            }

            // 2. 🔍 Validação local: Senhas coincidem?
            if (senha !== confirmarSenha) {
                exibirAlerta('As senhas não coincidem! Por favor, digite senhas iguais.', 'error', [senhaInput, confirmarSenhaInput]);
                return;
            }

            // Desabilita o botão temporariamente
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Cadastrando...';
            }

            const dadosCadastro = { nome, email, senha };

            try {
                // 3. 📡 Conectando à rota de Cadastro do C#
                const resposta = await fetch('http://localhost:5200/api/cadastro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosCadastro)
                });

                const dados = await resposta.json().catch(() => null);

                console.log('Status HTTP do Cadastro:', resposta.status);
                console.log('Resposta do C#:', dados);

                // 🟢 SE O CADASTRO FOI BEM-SUCEDIDO (Status 200/201 ou flag de sucesso)
                const cadastroValido = resposta.ok && (dados?.sucesso || dados?.success || !dados?.erro);

                if (cadastroValido) {
                    const mensagemSucesso = (dados && dados.mensagem) ? dados.mensagem : 'Conta criada com sucesso! Redirecionando...';
                    exibirAlerta(mensagemSucesso, 'success');

                    // Aguarda 1.5s para o usuário ler a mensagem verde antes de ir para o login
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);

                } else {
                    // 🔴 SE HOUVE ERRO RETORNADO PELO C# (Ex: E-mail já cadastrado)
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Cadastrar';
                    }

                    const mensagemErro = (dados && dados.mensagem) ? dados.mensagem : 'Não foi possível realizar o cadastro. Verifique os dados.';
                    exibirAlerta(mensagemErro, 'error');
                }

            } catch (erroConexao) {
                console.error('Erro de Conexão no Cadastro:', erroConexao);

                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Cadastrar';
                }

                exibirAlerta('Não foi possível conectar ao servidor C#. Verifique se ele está rodando!', 'error');
            }
        });
    }
});