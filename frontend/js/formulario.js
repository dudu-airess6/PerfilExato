document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. BARREIRA DE SEGURANÇA E AUTO-PREENCHIMENTO
    // ==========================================
    const contaAtiva = JSON.parse(localStorage.getItem('conta_perfilExato'));
    
    // SE NÃO ESTIVER LOGADO: Avisa e expulsa para a tela de login
    if (!contaAtiva) {
        alert("Para preencher o seu perfil e acessar as vagas, você precisa criar uma conta ou fazer login primeiro.");
        window.location.href = 'login.html';
        return; // O 'return' impede que o resto da página carregue
    }

    // SE ESTIVER LOGADO: Preenche os dados automaticamente
    const campoNome = document.getElementById('nome'); 
    const campoEmail = document.getElementById('email'); 

    if (campoNome && contaAtiva.nome) {
        campoNome.value = contaAtiva.nome;
        campoNome.readOnly = true;
        campoNome.style.backgroundColor = "#f0f0f0";
    }

    if (campoEmail && contaAtiva.email) {
        campoEmail.value = contaAtiva.email;
        campoEmail.readOnly = true;
        campoEmail.style.backgroundColor = "#f0f0f0";
    }

    // ==========================================
    // 2. LÓGICA DE ENVIO DO FORMULÁRIO
    // ==========================================
    const formPerfil = document.getElementById('formPerfil');

    if (formPerfil) {
        formPerfil.addEventListener('submit', function(event) {
            event.preventDefault();

            // Captura os dados básicos
            const nome = document.getElementById('nome').value;
            const curso = document.getElementById('curso').value;
            
            // Verifica se a formação foi selecionada antes de capturar para evitar erros
            const formacaoInput = document.querySelector('input[name="formacao"]:checked');
            const formacao = formacaoInput ? formacaoInput.value : "Não informado";

            // Captura todas as Hard Skills marcadas
            const hardSkills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
                                    .map(el => el.value);

            // Captura todas as Soft Skills marcadas
            const softSkills = Array.from(document.querySelectorAll('input[name="soft_skills"]:checked'))
                                    .map(el => el.value);

            // Monta o objeto com o perfil completo
            const perfilUsuario = {
                nome: nome,
                curso: curso,
                formacao: formacao,
                competencias: hardSkills, // Técnicas
                comportamentais: softSkills // Comportamentais
            };

            // Salva na gaveta de dados do formulário
            localStorage.setItem('dados_perfilExato', JSON.stringify(perfilUsuario));

            // Efeito visual no botão antes de ir para o scanner
            const btn = formPerfil.querySelector('.btn-submit');
            if (btn) {
                btn.innerHTML = "Analisando Perfil...";
                btn.style.backgroundColor = "#736B66"; // Muda a cor para indicar processamento
            }
            
            // Redireciona após 800ms
            setTimeout(() => {
                window.location.href = 'scanner.html';
            }, 800);
        });
    }
});