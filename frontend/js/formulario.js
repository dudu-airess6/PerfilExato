// ==========================================
// 1. FUNÇÃO DE VALIDAÇÃO DE CPF (UX no Front)
// ==========================================
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove pontos e traços
    if (cpf.length !== 11 || !!cpf.match(/^(\d)\1+$/)) return false; 
    
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    // --- MÁSCARA DE CPF EM TEMPO REAL ---
    const campoCpf = document.getElementById('cpf');

    if (campoCpf) {
        campoCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
            
            if (v.length <= 11) {
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            }
            
            e.target.value = v;
        });
    }

    // ==========================================
    // 2. BARREIRA DE SEGURANÇA E AUTO-PREENCHIMENTO VIA BACKEND C#
    // ==========================================
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');
    
    if (!tokenAtivo) {
        alert("Para preencher o seu perfil e acessar as vagas, você precisa criar uma conta ou fazer login primeiro.");
        window.location.href = 'login.html';
        return;
    }

    const campoNome = document.getElementById('nome'); 
    const campoEmail = document.getElementById('email'); 

    // 🔄 Puxa os dados do C# dinamicamente usando o Token da sessão
    fetch(`http://localhost:5200/api/usuario?token=${tokenAtivo}`)
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Preenche o campo Nome e bloqueia para edição
                if (campoNome && data.nome) {
                    campoNome.value = data.nome;
                    campoNome.readOnly = true;
                    campoNome.style.backgroundColor = "#f0f0f0";
                }
                // Preenche o campo E-mail e bloqueia para edição
                if (campoEmail && data.email) {
                    campoEmail.value = data.email;
                    campoEmail.readOnly = true;
                    campoEmail.style.backgroundColor = "#f0f0f0";
                }
            } else {
                alert("Erro ao carregar dados do usuário: " + data.mensagem);
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error("Erro ao conectar ao servidor para buscar usuário:", error);
        });

    // ==========================================
    // 3. LÓGICA DE ENVIO DO FORMULÁRIO API C#
    // ==========================================
    const formPerfil = document.getElementById('formPerfil');

    if (formPerfil) {
        formPerfil.addEventListener('submit', function(event) {
            event.preventDefault();

            // CAPTURA DOS CAMPOS
            const cpfValue = document.getElementById('cpf').value;
            const cepValue = document.getElementById('cep').value;
            const cidadeValue = document.getElementById('cidade').value;
            const estadoValue = document.getElementById('estado').value;
            const curso = document.getElementById('curso').value;
            const formacaoInput = document.querySelector('input[name="formacao"]:checked');
            const formacao = formacaoInput ? formacaoInput.value : "Não informado";

            const hardSkills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
                                    .map(el => el.value);

            const softSkills = Array.from(document.querySelectorAll('input[name="soft_skills"]:checked'))
                                    .map(el => el.value);

            // VALIDAÇÃO RÁPIDA NO FRONTEND
            if (!validarCPF(cpfValue)) {
                alert("O CPF digitado é inválido. Por favor, verifique.");
                document.getElementById('cpf').focus();
                return; 
            }

            // MONTAGEM DO OBJETO PARA ENVIAR AO C#
            const dadosParaBackend = {
                token: tokenAtivo,
                cpf: cpfValue,
                cep: cepValue,
                cidade: cidadeValue,
                estado: estadoValue,
                curso: curso,
                formacao: formacao,
                competencias: hardSkills,
                comportamentais: softSkills
            };

            // EFEITO VISUAL NO BOTÃO
            const btn = formPerfil.querySelector('.btn-submit');
            if (btn) {
                btn.innerHTML = "Analisando Perfil no Servidor...";
                btn.style.backgroundColor = "#736B66";
            }
            
            // --- ENVIA PARA A API C# ---
            fetch('http://localhost:5200/api/perfil/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaBackend)
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert(data.mensagem);
                    window.location.href = 'scanner.html'; 
                } else {
                    alert('Erro: ' + data.mensagem); 
                    if(btn) {
                        btn.innerHTML = "Tentar Novamente";
                        btn.style.backgroundColor = ""; 
                    }
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert("Erro ao conectar com o backend C#.");
                if(btn) {
                    btn.innerHTML = "Tentar Novamente";
                    btn.style.backgroundColor = "";
                }
            });
        });
    }

    // ==========================================
    // 4. LÓGICA DE INTEGRAÇÃO COM API VIACEP
    // ==========================================
    const campoCep = document.getElementById('cep');
    const campoCidade = document.getElementById('cidade');
    const campoEstado = document.getElementById('estado');
    const loadingCep = document.getElementById('cep-loading');

    if (campoCep) {
        campoCep.addEventListener('blur', async () => {
            const cep = campoCep.value.replace(/\D/g, '');

            if (cep.length === 8) {
                try {
                    if (loadingCep) loadingCep.style.display = 'block';
                    
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();

                    if (data.erro) {
                        alert("CEP não encontrado!");
                        campoCep.value = "";
                    } else {
                        campoCidade.value = data.localidade;
                        campoEstado.value = data.uf;
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                } finally {
                    if (loadingCep) loadingCep.style.display = 'none';
                }
            }
        });
    }
});