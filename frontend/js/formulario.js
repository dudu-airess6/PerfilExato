// 🔹 Validação Matemática do CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; 
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
}

// 📍 FUNÇÕES DE GERENCIAMENTO DE ERROS INLINE (ABAIXO DOS INPUTS)

// Exibe mensagem de erro logo abaixo de um campo específico
function mostrarErroCampo(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;

    // Destaca o input com borda vermelha
    campo.style.borderColor = "#d32f2f";

    // Busca elemento de erro existente ou cria um novo dinamicamente
    let msgElement = document.getElementById(`${campoId}-error`);
    if (!msgElement) {
        msgElement = document.createElement('small');
        msgElement.id = `${campoId}-error`;
        msgElement.className = 'field-error-msg';
        msgElement.style.color = '#d32f2f';
        msgElement.style.fontSize = '0.85rem';
        msgElement.style.marginTop = '4px';
        msgElement.style.display = 'block';
        
        // Insere logo abaixo do input
        campo.parentNode.appendChild(msgElement);
    }

    msgElement.innerText = mensagem;
    msgElement.style.display = 'block';
}

// 🎯 Exibe mensagem de erro especificamente ABAIXO DO BOTÃO de submissão
function mostrarErroBotao(mensagem) {
    const btnSalvar = document.querySelector('#formPerfil button[type="submit"]') || document.querySelector('button[type="submit"]');
    if (!btnSalvar) return;

    let msgElement = document.getElementById('btn-submit-error');
    if (!msgElement) {
        msgElement = document.createElement('small');
        msgElement.id = 'btn-submit-error';
        msgElement.className = 'field-error-msg';
        msgElement.style.color = '#d32f2f';
        msgElement.style.fontSize = '0.95rem';
        msgElement.style.fontWeight = '600';
        msgElement.style.marginTop = '12px';
        msgElement.style.display = 'block';
        msgElement.style.textAlign = 'center';
        
        // Insere logo abaixo do botão
        btnSalvar.parentNode.appendChild(msgElement);
    }

    msgElement.innerText = mensagem;
    msgElement.style.display = 'block';
    msgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Limpa o erro de um campo específico
function limparErroCampo(campoId) {
    const campo = document.getElementById(campoId);
    if (campo) campo.style.borderColor = "";

    const msgElement = document.getElementById(`${campoId}-error`);
    if (msgElement) {
        msgElement.style.display = 'none';
        msgElement.innerText = "";
    }
}

// Limpa todos os erros dos campos e do botão
function limparTodosErrosCampos() {
    document.querySelectorAll('.field-error-msg').forEach(el => {
        el.style.display = 'none';
        el.innerText = '';
    });
    document.querySelectorAll('input, select').forEach(el => {
        el.style.borderColor = '';
    });
    esconderAlertaGlobal();
}

// 🔔 Alerta Global (Usado apenas para erros de rede/servidor ou sucesso)
function exibirAlertaGlobal(mensagem, tipo = 'erro') {
    const caixaAlerta = document.getElementById('mensagem-alerta');
    if (!caixaAlerta) return;

    caixaAlerta.innerText = mensagem;
    caixaAlerta.style.display = 'block';

    if (tipo === 'sucesso') {
        caixaAlerta.style.backgroundColor = '#d4edda';
        caixaAlerta.style.color = '#155724';
        caixaAlerta.style.borderColor = '#c3e6cb';
    } else {
        caixaAlerta.style.backgroundColor = '#f8d7da';
        caixaAlerta.style.color = '#721c24';
        caixaAlerta.style.borderColor = '#f5c6cb';
    }

    caixaAlerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function esconderAlertaGlobal() {
    const caixaAlerta = document.getElementById('mensagem-alerta');
    if (caixaAlerta) caixaAlerta.style.display = 'none';
}


document.addEventListener('DOMContentLoaded', async () => {
    const tokenAtivo = sessionStorage.getItem('token_perfilExato'); 

    // 📍 CPF: MÁSCARA E VALIDAÇÃO EM TEMPO REAL
    const campoCpf = document.getElementById('cpf');
    if (campoCpf) {
        campoCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length <= 11) {
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            }
            e.target.value = v;

            // Limpa o erro enquanto digita
            limparErroCampo('cpf');
        });

        campoCpf.addEventListener('blur', () => {
            if (campoCpf.value && !validarCPF(campoCpf.value)) {
                mostrarErroCampo('cpf', 'CPF inválido! Verifique os números digitados.');
            } else {
                limparErroCampo('cpf');
            }
        });
    }

    // 📍 CARREGAR DADOS DO USUÁRIO LOGADO
    const campoNome = document.getElementById('nome'); 
    const campoEmail = document.getElementById('email'); 

    if (tokenAtivo) {
        try {
            const response = await fetch(`http://localhost:5200/api/usuario`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenAtivo}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.sucesso) {
                if (campoNome) { campoNome.value = data.nome; campoNome.readOnly = true; campoNome.style.backgroundColor = "#f0f0f0"; }
                if (campoEmail) { campoEmail.value = data.email; campoEmail.readOnly = true; campoEmail.style.backgroundColor = "#f0f0f0"; }

                if (data.perfil) {
                    const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };
                    
                    setVal('cpf', data.perfil.cpf);
                    setVal('cep', data.perfil.cep);
                    setVal('cidade', data.perfil.cidade);
                    setVal('estado', data.perfil.estado);
                    setVal('curso', data.perfil.curso);
                    
                    const radioFormacao = document.querySelector(`input[name="formacao"][value="${data.perfil.formacao}"]`);
                    if (radioFormacao) radioFormacao.checked = true;

                    (data.perfil.competencias || []).forEach(skill => {
                        const box = document.querySelector(`input[name="skills"][value="${skill}"]`);
                        if (box) box.checked = true;
                    });
                    
                    (data.perfil.comportamentais || []).forEach(skill => {
                        const box = document.querySelector(`input[name="soft_skills"][value="${skill}"]`);
                        if (box) box.checked = true;
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
        }
    }

    // 📍 LÓGICA DO VIA CEP DINÂMICA
    const campoCep = document.getElementById('cep');
    const cepLoading = document.getElementById('cep-loading');

    if (campoCep) {
        campoCep.addEventListener('input', () => limparErroCampo('cep'));

        campoCep.addEventListener('blur', async () => {
            const cep = campoCep.value.replace(/\D/g, '');
            if (cep.length === 8) {
                if (cepLoading) cepLoading.style.display = 'block';
                limparErroCampo('cep');

                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (data.erro) {
                        if(document.getElementById('cidade')) document.getElementById('cidade').value = "";
                        if(document.getElementById('estado')) document.getElementById('estado').value = "";
                        mostrarErroCampo('cep', 'CEP não encontrado! Verifique o número digitado.');
                    } else {
                        if(document.getElementById('cidade')) document.getElementById('cidade').value = data.localidade;
                        if(document.getElementById('estado')) document.getElementById('estado').value = data.uf;
                        limparErroCampo('cep');
                    }
                } catch (e) { 
                    console.error("Erro na busca do CEP:", e); 
                    mostrarErroCampo('cep', 'Erro ao consultar o CEP.');
                } finally {
                    if (cepLoading) cepLoading.style.display = 'none';
                }
            } else if (cep.length > 0) {
                mostrarErroCampo('cep', 'O CEP deve conter 8 dígitos.');
            }
        });
    }

    // 📍 SUBMIT DO FORMULÁRIO
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            limparTodosErrosCampos();

            // 🛑 BARREIRA DE LOGIN (Mensagem exibida ABAIXO do botão)
            if (!tokenAtivo) {
                mostrarErroBotao("Para analisarmos o seu perfil e te conectar às vagas, faça login na sua conta SENAI!");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2500); // 2.5s para dar tempo do usuário ler
                return;
            }

            let temErro = false;

            // 1. Validação do CPF
            const cpfValue = document.getElementById('cpf')?.value || "";
            if (!validarCPF(cpfValue)) {
                mostrarErroCampo('cpf', 'Informe um CPF válido.');
                temErro = true;
            }

            // 2. Validação do CEP e Endereço
            const cepValue = document.getElementById('cep')?.value.replace(/\D/g, '') || "";
            const cidadeValue = document.getElementById('cidade')?.value || "";
            const estadoValue = document.getElementById('estado')?.value || "";
            
            if (cepValue.length !== 8 || !cidadeValue || !estadoValue) {
                mostrarErroCampo('cep', 'Informe um CEP válido para carregar cidade e estado.');
                temErro = true;
            }

            // 3. Validação do Curso
            const cursoValue = document.getElementById('curso')?.value;
            if (!cursoValue) {
                mostrarErroCampo('curso', 'Selecione o seu curso técnico.');
                temErro = true;
            }

            // Se encontrou algum erro nos campos, interrompe o envio
            if (temErro) {
                // Rola até o primeiro campo com erro
                const primeiroErro = document.querySelector('.field-error-msg[style*="display: block"]');
                if (primeiroErro) {
                    primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const btnSalvar = formPerfil.querySelector('button[type="submit"]');
            if (btnSalvar) {
                btnSalvar.disabled = true;
                btnSalvar.innerText = "Analisando Perfil...";
            }

            try {
                // Preparando os dados para o backend
                const formacaoInput = document.querySelector('input[name="formacao"]:checked');
                const dadosParaBackend = {
                    cpf: cpfValue,
                    cep: document.getElementById('cep').value,
                    cidade: cidadeValue, 
                    estado: estadoValue,  
                    curso: cursoValue,
                    formacao: formacaoInput ? formacaoInput.value : "Não informado",
                    competencias: Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(el => el.value),
                    comportamentais: Array.from(document.querySelectorAll('input[name="soft_skills"]:checked')).map(el => el.value)
                };

                // 🚀 ENVIO PARA A API
                const res = await fetch('http://localhost:5200/api/perfil/salvar', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${tokenAtivo}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(dadosParaBackend)
                });

                if (res.status === 401) {
                    exibirAlertaGlobal("Sessão expirada. Redirecionando para o login...", "erro");
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                    return;
                }
                
                if (!res.ok) {
                    const textoErro = await res.text();
                    throw new Error(textoErro || `Erro ${res.status}`);
                }

                const data = await res.json();
                
                if (data.sucesso) {
                    exibirAlertaGlobal(data.mensagem || "Perfil salvo com sucesso! Redirecionando...", "sucesso");
                    setTimeout(() => {
                        window.location.href = 'scanner.html';
                    }, 1500);
                } else {
                    exibirAlertaGlobal('Erro do sistema: ' + (data.mensagem || "Não foi possível salvar."), "erro");
                }

            } catch (error) {
                console.error("❌ Falha no salvamento:", error);
                exibirAlertaGlobal(error.message || "Falha na comunicação com o servidor.", "erro");
            } finally {
                if (btnSalvar) { 
                    btnSalvar.disabled = false; 
                    btnSalvar.innerText = "Analisar Meu Perfil →"; 
                }
            }
        });
    }
});