// 🔔 Função para exibir avisos/alertas visuais sem usar alert() nativo
function exibirAlertaGlobal(mensagem, tipo = 'erro') {
    let caixaAlerta = document.getElementById('mensagem-alerta');
    
    // Se a caixa de alerta não existir no HTML, cria dinamicamente no topo
    if (!caixaAlerta) {
        caixaAlerta = document.createElement('div');
        caixaAlerta.id = 'mensagem-alerta';
        caixaAlerta.style.cssText = 'padding: 14px 18px; margin: 0 auto 24px auto; border-radius: 8px; font-weight: 500; font-size: 0.95rem; display: none; max-width: 800px; border: 1px solid; transition: all 0.3s ease; text-align: center;';
        
        const wrapper = document.querySelector('.vagas-wrapper') || document.body;
        wrapper.insertBefore(caixaAlerta, wrapper.firstChild);
    }

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

document.addEventListener('DOMContentLoaded', () => {
    const containerVagas = document.getElementById('lista-vagas');
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

    // Lista estática de vagas com requisitos técnicos e comportamentais
    const vagasDisponiveis = [
        {
            titulo: "Técnico em Eletromecânica Jr.",
            empresa: "Indústrias Atlas",
            hardRequired: ["Eletricidade Predial", "AutoCAD", "CLP", "Normas NR10"],
            softRequired: ["Proatividade", "Resolucao de Problemas", "Pontualidade"]
        },
        {
            titulo: "Desenvolvedor Full Stack Júnior",
            empresa: "InovaTech Solutions",
            hardRequired: ["FrontEnd", "BackEnd", "Banco de dados", "API"],
            softRequired: ["Trabalho em Equipe", "Comunicativo", "Organizacão"]
        },
        {
            titulo: "Assistente de Automação",
            empresa: "Tech Corp Brasil",
            hardRequired: ["CLP", "Leitura de Projetos", "Pneumatica"],
            softRequired: ["Proatividade", "Resolucao de Problemas"]
        }
    ];

    // Card visual caso o usuário não esteja logado ou não possua perfil preenchido
    function exibirEstadoVazio() {
        if (!containerVagas) return;
        containerVagas.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; margin: 40px auto;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                <h2>Onde está o seu perfil?</h2>
                <p style="margin-bottom: 30px; color: #666;">Preencha o formulário técnico para visualizar o cálculo de match e liberar as candidaturas.</p>
                <a href="formulario.html" class="btn-primary" style="text-decoration: none; display: inline-block; padding: 12px 28px; border-radius: 6px; background-color: #2e7d32; color: white; font-weight: bold;">Preencher Meu Perfil &rarr;</a>
            </div>`;
    }

    // 🛑 Barreiras de Login Inicial
    if (!tokenAtivo) { 
        exibirEstadoVazio(); 
        return; 
    }

    // 📍 BUSCA OS DADOS DO USUÁRIO NO BACKEND (C#)
    fetch('http://localhost:5200/api/usuario', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenAtivo}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            exibirAlertaGlobal("Sessão expirada. Por favor, faça login novamente.", "erro");
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
            throw new Error("Sessão expirada");
        }
        return response.json();
    })
    .then(data => {
        if (!data.sucesso || !data.perfil) { 
            exibirEstadoVazio(); 
            return; 
        }

        const dadosAluno = data.perfil;
        const inscricoesUsuario = data.inscricoes || []; 
        let htmlVagas = '';

        // 📍 PROCESSAMENTO E RENDERIZAÇÃO DAS VAGAS
        vagasDisponiveis.forEach((vaga, index) => {
            // 🧮 MATEMÁTICA DE MATCH: Hard skills (peso 2) + Soft skills (peso 1)
            let totalPontosPossiveis = (vaga.hardRequired.length * 2) + (vaga.softRequired.length * 1);
            let pontosObtidos = 0;
            let skillsEncontradas = [];

            // Validação de Hard Skills (Peso 2)
            vaga.hardRequired.forEach(req => {
                if (dadosAluno.competencias && dadosAluno.competencias.includes(req)) { 
                    pontosObtidos += 2; 
                    skillsEncontradas.push(req); 
                }
            });

            // Validação de Soft Skills (Peso 1)
            vaga.softRequired.forEach(soft => {
                if (dadosAluno.comportamentais && dadosAluno.comportamentais.includes(soft)) { 
                    pontosObtidos += 1; 
                    skillsEncontradas.push(soft); 
                }
            });

            const porcentagem = Math.round((pontosObtidos / totalPontosPossiveis) * 100);
            const meusMatches = skillsEncontradas.length;
            const totalRequisitos = vaga.hardRequired.length + vaga.softRequired.length;

            let corBadge = '#d32f2f';
            let estadoBotao = '';
            let textoBotao = 'Candidatar-se com PerfilExato';

            // Verifica se a candidatura já foi efetuada previamente
            const jaInscrito = inscricoesUsuario.some(i => i.tituloVaga === vaga.titulo && i.empresa === vaga.empresa);

            if (jaInscrito) {
                corBadge = '#2e7d32';
                estadoBotao = 'disabled style="background-color: #736B66; color: white; border-color: #736B66; cursor: default;"';
                textoBotao = '✓ Candidatura Enviada';
            } else if (porcentagem >= 60) {
                corBadge = '#2e7d32';
            } else if (porcentagem >= 40) {
                corBadge = '#8ba88e';
            } else {
                corBadge = '#d32f2f';
                estadoBotao = 'disabled style="background-color: #e0e0e0; color: #9e9e9e; border-color: #e0e0e0; cursor: not-allowed;"';
                textoBotao = 'Requisitos Insuficientes';
            }

            const skillsHtml = skillsEncontradas.length > 0 
                ? skillsEncontradas.map(s => `<span class="skill-match">✓ ${s}</span>`).join('') 
                : `<span class="skill-match" style="color: #d32f2f; background: #ffebee;">Nenhum requisito preenchido</span>`;

            htmlVagas += `
                <div class="job-card">
                    <div class="match-badge" style="background-color: ${corBadge}; color: white;">${porcentagem}% Compatível</div>
                    <h2 class="job-title">${vaga.titulo}</h2>
                    <p class="company-name">${vaga.empresa}</p>
                    <div class="job-description">
                        <p class="match-reason"><strong>Match Técnico e Comportamental:</strong> Você possui ${meusMatches} de ${totalRequisitos} requisitos exigidos:</p>
                        <div class="job-skills">${skillsHtml}</div>
                    </div>
                    <button class="btn-apply" data-index="${index}" ${estadoBotao}>${textoBotao}</button>
                </div>`;
        });

        containerVagas.innerHTML = htmlVagas || `<h2>Nenhuma vaga encontrada.</h2>`;

        // 📍 REGISTRO DE CANDIDATURA (SUBMIT VIA API)
        document.querySelectorAll('.btn-apply').forEach(btn => {
            if (btn.hasAttribute('disabled')) return;

            btn.addEventListener('click', function() {
                esconderAlertaGlobal();

                const index = this.getAttribute('data-index');
                const vagaSelecionada = vagasDisponiveis[index];
                const btnOriginalText = this.innerText;

                // Feedback visual temporário durante o envio
                this.disabled = true;
                this.innerText = "Enviando Candidatura...";

                fetch('http://localhost:5200/api/vagas/candidatar', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${tokenAtivo}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        tituloVaga: vagaSelecionada.titulo,
                        empresa: vagaSelecionada.empresa
                    })
                })
                .then(res => res.json())
                .then(apiData => {
                    if (apiData.sucesso) {
                        this.innerText = "✓ Candidatura Enviada";
                        this.style.backgroundColor = "#736B66";
                        this.style.borderColor = "#736B66";
                        this.disabled = true;
                        this.style.cursor = "default";
                        exibirAlertaGlobal(apiData.mensagem || "Candidatura registrada com sucesso!", "sucesso");
                    } else {
                        this.disabled = false;
                        this.innerText = btnOriginalText;
                        exibirAlertaGlobal(apiData.mensagem || "Erro ao registrar candidatura.", "erro");
                    }
                })
                .catch(err => {
                    console.error("❌ Erro ao enviar candidatura:", err);
                    this.disabled = false;
                    this.innerText = btnOriginalText;
                    exibirAlertaGlobal("Erro ao registrar candidatura no servidor. Tente novamente.", "erro");
                });
            });
        });
    })
    .catch(err => {
        if (!err.message.includes("Sessão expirada")) {
            console.error("❌ Falha na requisição principal:", err);
            exibirEstadoVazio(); 
        }
    });
});