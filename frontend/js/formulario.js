function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
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
    return resto === parseInt(cpf.substring(10, 11));
}

document.addEventListener('DOMContentLoaded', () => {
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

    const tokenAtivo = sessionStorage.getItem('token_perfilExato');
    if (!tokenAtivo) {
        alert("Faça login para acessar o formulário.");
        window.location.href = 'login.html';
        return;
    }

    const campoNome = document.getElementById('nome'); 
    const campoEmail = document.getElementById('email'); 

    // 🔄 RECONEXÃO: Puxa os dados para verificar se já existem respostas salvas
    fetch(`http://localhost:5200/api/usuario?token=${tokenAtivo}`)
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                if (campoNome) { campoNome.value = data.nome; campoNome.readOnly = true; campoNome.style.backgroundColor = "#f0f0f0"; }
                if (campoEmail) { campoEmail.value = data.email; campoEmail.readOnly = true; campoEmail.style.backgroundColor = "#f0f0f0"; }

                // ✨ AUTO-PREENCHIMENTO: Caso o usuário já tenha salvo dados antes, renderiza nas caixas
                if (data.perfil) {
                    if(document.getElementById('cpf')) document.getElementById('cpf').value = data.perfil.cpf;
                    if(document.getElementById('cep')) document.getElementById('cep').value = data.perfil.cep;
                    if(document.getElementById('cidade')) document.getElementById('cidade').value = data.perfil.cidade;
                    if(document.getElementById('estado')) document.getElementById('estado').value = data.perfil.estado;
                    if(document.getElementById('curso')) document.getElementById('curso').value = data.perfil.curso;
                    
                    const radioFormacao = document.querySelector(`input[name="formacao"][value="${data.perfil.formacao}"]`);
                    if (radioFormacao) radioFormacao.checked = true;

                    if (data.perfil.competencias) {
                        data.perfil.competencias.forEach(skill => {
                            const box = document.querySelector(`input[name="skills"][value="${skill}"]`);
                            if (box) box.checked = true;
                        });
                    }
                    if (data.perfil.comportamentais) {
                        data.perfil.comportamentais.forEach(skill => {
                            const box = document.querySelector(`input[name="soft_skills"][value="${skill}"]`);
                            if (box) box.checked = true;
                        });
                    }
                }
            }
        });

    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', function(event) {
            event.preventDefault();
            const cpfValue = document.getElementById('cpf').value;
            const formacaoInput = document.querySelector('input[name="formacao"]:checked');
            
            if (!validarCPF(cpfValue)) {
                alert("CPF inválido.");
                return;
            }

            const dadosParaBackend = {
                token: tokenAtivo,
                cpf: cpfValue,
                cep: document.getElementById('cep').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
                curso: document.getElementById('curso').value,
                formacao: formacaoInput ? formacaoInput.value : "Não informado",
                competencias: Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(el => el.value),
                comportamentais: Array.from(document.querySelectorAll('input[name="soft_skills"]:checked')).map(el => el.value)
            };

            fetch('http://localhost:5200/api/perfil/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaBackend)
            })
            .then(res => res.json())
            .then(data => {
                if (data.sucesso) {
                    alert(data.mensagem);
                    window.location.href = 'scanner.html';
                } else {
                    alert('Erro: ' + data.mensagem);
                }
            });
        });
    }

    // LÓGICA DO VIA CEP MANTIDA
    const campoCep = document.getElementById('cep');
    if (campoCep) {
        campoCep.addEventListener('blur', async () => {
            const cep = campoCep.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        document.getElementById('cidade').value = data.localidade;
                        document.getElementById('estado').value = data.uf;
                    }
                } catch (e) { console.error(e); }
            }
        });
    }
});