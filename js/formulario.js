// ==========================================
// 1. FUNÇÃO DE VALIDAÇÃO DE CPF (CAIXA BRANCA)
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

campoCpf.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    
    if (v.length <= 11) {
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    
    e.target.value = v;
});
    // ==========================================
    // 2. BARREIRA DE SEGURANÇA E AUTO-PREENCHIMENTO
    // ==========================================
    const contaAtiva = JSON.parse(localStorage.getItem('conta_perfilExato'));
    
    if (!contaAtiva) {
        alert("Para preencher o seu perfil e acessar as vagas, você precisa criar uma conta ou fazer login primeiro.");
        window.location.href = 'login.html';
        return;
    }

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
    // 3. LÓGICA DE ENVIO DO FORMULÁRIO (ATUALIZADA)
    // ==========================================
    const formPerfil = document.getElementById('formPerfil');

    if (formPerfil) {
        formPerfil.addEventListener('submit', function(event) {
            event.preventDefault();

            // CAPTURA DOS NOVOS CAMPOS
            const cpfValue = document.getElementById('cpf').value;
            const cepValue = document.getElementById('cep').value;
            const cidadeValue = document.getElementById('cidade').value;
            const estadoValue = document.getElementById('estado').value;

            // VALIDAÇÃO DE SEGURANÇA (CPF)
            if (!validarCPF(cpfValue)) {
                alert("O CPF digitado é inválido. Por favor, verifique.");
                document.getElementById('cpf').focus();
                return; // INTERROMPE O ENVIO
            }

            const nome = document.getElementById('nome').value;
            const curso = document.getElementById('curso').value;
            const formacaoInput = document.querySelector('input[name="formacao"]:checked');
            const formacao = formacaoInput ? formacaoInput.value : "Não informado";

            const hardSkills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
                                    .map(el => el.value);

            const softSkills = Array.from(document.querySelectorAll('input[name="soft_skills"]:checked'))
                                    .map(el => el.value);

            // MONTAGEM DO OBJETO COMPLETO (Incluso CEP/CPF/Cidade)
            const perfilUsuario = {
                nome: nome,
                cpf: cpfValue,
                cep: cepValue,
                cidade: cidadeValue,
                estado: estadoValue,
                curso: curso,
                formacao: formacao,
                competencias: hardSkills,
                comportamentais: softSkills
            };

            // SALVAMENTO NO LOCALSTORAGE
            localStorage.setItem('dados_perfilExato', JSON.stringify(perfilUsuario));

            // EFEITO VISUAL NO BOTÃO
            const btn = formPerfil.querySelector('.btn-submit');
            if (btn) {
                btn.innerHTML = "Analisando Perfil...";
                btn.style.backgroundColor = "#736B66";
            }
            
            // REDIRECIONAMENTO
            setTimeout(() => {
                window.location.href = 'scanner.html';
            }, 800);
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