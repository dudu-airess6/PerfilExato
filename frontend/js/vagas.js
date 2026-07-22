document.addEventListener('DOMContentLoaded', () => {
    const containerVagas = document.getElementById('lista-vagas');
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

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

    function exibirEstadoVazio() {
        containerVagas.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; margin: 40px auto;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                <h2>Onde está o seu perfil?</h2>
                <p style="margin-bottom: 30px; color: #666;">Preencha o formulário técnico para visualizar o cálculo de match e liberar as candidaturas.</p>
                <a href="formulario.html" class="btn-primary" style="text-decoration: none; display: inline-block; padding: 12px 28px; border-radius: 6px; background-color: #2e7d32; color: white; font-weight: bold;">Preencher Meu Perfil &rarr;</a>
            </div>`;
    }

    if (!tokenAtivo) { exibirEstadoVazio(); return; }

    fetch(`http://localhost:5200/api/usuario?token=${tokenAtivo}`)
        .then(response => response.json())
        .then(data => {
            if (!data.sucesso || !data.perfil) { exibirEstadoVazio(); return; }

            const dadosAluno = data.perfil;
            const inscricoesUsuario = data.inscricoes || []; // Lista de vagas já aplicadas
            let htmlVagas = '';

            vagasDisponiveis.forEach((vaga, index) => {
                let totalRequisitos = vaga.hardRequired.length + vaga.softRequired.length;
                let meusMatches = 0;
                let skillsEncontradas = [];

                vaga.hardRequired.forEach(req => {
                    if (dadosAluno.competencias && dadosAluno.competencias.includes(req)) { meusMatches++; skillsEncontradas.push(req); }
                });
                vaga.softRequired.forEach(soft => {
                    if (dadosAluno.comportamentais && dadosAluno.comportamentais.includes(soft)) { meusMatches++; skillsEncontradas.push(soft); }
                });

                const porcentagem = Math.round((meusMatches / totalRequisitos) * 100);

                let corBadge = '#d32f2f';
                let estadoBotao = '';
                let textoBotao = 'Candidatar-se com PerfilExato';

                // Verifica se já existe essa vaga salva no histórico do C#
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

            // Configuração do clique enviando os dados pro C#
            document.querySelectorAll('.btn-apply').forEach(btn => {
                if (btn.hasAttribute('disabled')) return;

                btn.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    const vagaSelecionada = vagasDisponiveis[index];

                    // Faz o envio real para o histórico do backend
                    fetch('http://localhost:5200/api/vagas/candidatar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token: tokenAtivo,
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
                            alert(apiData.mensagem);
                        } else {
                            alert(apiData.mensagem);
                        }
                    })
                    .catch(() => alert("Erro ao registrar candidatura no servidor."));
                });
            });
        });
});