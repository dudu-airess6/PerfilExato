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

document.addEventListener('DOMContentLoaded', async () => {
    // 🔹 Busca o token salvo na sessão
    const tokenAtivo = sessionStorage.getItem('token_perfilExato'); 

    // 📍 MÁSCARA DE CPF
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
        });
    }

    const campoNome = document.getElementById('nome'); 
    const campoEmail = document.getElementById('email'); 

    // 🔄 RECONEXÃO: Só tenta buscar os dados se o usuário estiver logado
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
    if (campoCep) {
        campoCep.addEventListener('blur', async () => {
            const cep = campoCep.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (data.erro) {
                        if(document.getElementById('cidade')) document.getElementById('cidade').value = "";
                        if(document.getElementById('estado')) document.getElementById('estado').value = "";
                        alert("CEP não encontrado! Verifique o número digitado.");
                    } else {
                        if(document.getElementById('cidade')) document.getElementById('cidade').value = data.localidade;
                        if(document.getElementById('estado')) document.getElementById('estado').value = data.uf;
                    }
                } catch (e) { 
                    console.error("Erro na busca do CEP:", e); 
                }
            }
        });
    }

    // 📍 ENVIO DO FORMULÁRIO
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o envio imediato

            // 🛑 BARREIRA DE LOGIN: Verifica se tem token ANTES de fazer qualquer coisa
            if (!tokenAtivo) {
                alert("Para analisarmos o seu perfil e te conectar às vagas, faça login na sua conta SENAI!");
                window.location.href = "login.html"; // Redireciona para o login
                return; // Para a execução do código aqui mesmo!
            }

            const btnSalvar = formPerfil.querySelector('button[type="submit"]');
            if (btnSalvar) {
                btnSalvar.disabled = true;
                btnSalvar.innerText = "Analisando Perfil...";
            }

            try {
                // 1. Validação do CPF
                const campoCpfElement = document.getElementById('cpf');
                const cpfValue = campoCpfElement ? campoCpfElement.value : "";
                if (!validarCPF(cpfValue)) {
                    alert("CPF inválido.");
                    throw new Error("Validação Interrompida: CPF");
                }

                // 2. Validação básica do CEP
                const cepValue = document.getElementById('cep')?.value.replace(/\D/g, '');
                const cidadeValue = document.getElementById('cidade')?.value;
                const estadoValue = document.getElementById('estado')?.value;
                
                if (cepValue.length !== 8 || !cidadeValue || !estadoValue) {
                    alert("Não é possível salvar com um CEP inválido ou em branco.");
                    throw new Error("Validação Interrompida: CEP");
                }

                // 3. Preparando os dados
                const formacaoInput = document.querySelector('input[name="formacao"]:checked');
                const dadosParaBackend = {
                    cpf: cpfValue,
                    cep: document.getElementById('cep').value,
                    cidade: cidadeValue, 
                    estado: estadoValue,  
                    curso: document.getElementById('curso').value,
                    formacao: formacaoInput ? formacaoInput.value : "Não informado",
                    competencias: Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(el => el.value),
                    comportamentais: Array.from(document.querySelectorAll('input[name="soft_skills"]:checked')).map(el => el.value)
                };

                // 🚀 4. ENVIO SEGURO PARA A API
                const res = await fetch('http://localhost:5200/api/perfil/salvar', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${tokenAtivo}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(dadosParaBackend)
                });

                if (res.status === 401) {
                    alert("Sessão expirada. Faça login novamente.");
                    window.location.href = "login.html";
                    return;
                }
                
                if (!res.ok) {
                    const textoErro = await res.text();
                    throw new Error(textoErro || `Erro ${res.status}`);
                }

                const data = await res.json();
                
                if (data.sucesso) {
                    alert(data.mensagem); // Mensagem de sucesso
                    window.location.href = 'scanner.html'; // Redireciona para o scanner
                } else {
                    alert('Erro do sistema: ' + data.mensagem);
                    throw new Error("Erro na API");
                }

            } catch (error) {
                // Apenas exibe o erro se não for uma das validações que já disparou o alert()
                if (!error.message.includes("Validação Interrompida")) {
                    console.error("❌ Falha crítica no salvamento:", error);
                    alert(error.message);
                }
            } finally {
                // Habilita o botão novamente caso algo falhe
                if (btnSalvar) { 
                    btnSalvar.disabled = false; 
                    btnSalvar.innerText = "Analisar Meu Perfil"; 
                }
            }
        });
    }
});