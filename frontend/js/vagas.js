document.addEventListener('DOMContentLoaded', () => {
    const containerVagas = document.getElementById('lista-vagas');
    const dadosAluno = JSON.parse(localStorage.getItem('dados_perfilExato'));

    // --- BANCO DE VAGAS COM REQUISITOS TÉCNICOS E COMPORTAMENTAIS ---
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

    if (!dadosAluno) {
        containerVagas.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px;">
                <h2 style="margin-bottom: 15px;">🔍 Onde está o seu perfil?</h2>
                <a href="formulario.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Preencher Formulário &rarr;</a>
            </div>`;
        return;
    }

    let htmlVagas = '';

    vagasDisponiveis.forEach(vaga => {
        let totalRequisitos = vaga.hardRequired.length + vaga.softRequired.length;
        let meusMatches = 0;
        let skillsEncontradas = [];

        // Verifica Hard Skills
        vaga.hardRequired.forEach(req => {
            if (dadosAluno.competencias && dadosAluno.competencias.includes(req)) {
                meusMatches++;
                skillsEncontradas.push(req);
            }
        });

        // Verifica Soft Skills
        vaga.softRequired.forEach(soft => {
            if (dadosAluno.comportamentais && dadosAluno.comportamentais.includes(soft)) {
                meusMatches++;
                skillsEncontradas.push(soft);
            }
        });

        const porcentagem = Math.round((meusMatches / totalRequisitos) * 100);

        // --- NOVA LÓGICA DE CORES E BLOQUEIO ---
        let corBadge = '';
        let estadoBotao = '';
        let textoBotao = 'Candidatar-se com PerfilExato';

        if (porcentagem >= 60) {
            corBadge = '#2e7d32'; // Verde forte (Alta compatibilidade)
        } else if (porcentagem >= 40) {
            corBadge = '#8ba88e'; // Verde acinzentado (Média compatibilidade)
        } else {
            corBadge = '#d32f2f'; // Vermelho (Baixa compatibilidade)
            // Se for menor que 40%, desativa o botão e muda o estilo/texto
            estadoBotao = 'disabled style="background-color: #e0e0e0; color: #9e9e9e; border-color: #e0e0e0; cursor: not-allowed;"';
            textoBotao = 'Requisitos Insuficientes';
        }

        // Removi a condição "if (porcentagem > 0)" para que você possa ver as vagas vermelhas mesmo se a pessoa tiver 0% ou pouco match.
        const skillsHtml = skillsEncontradas.length > 0 
            ? skillsEncontradas.map(s => `<span class="skill-match">✓ ${s}</span>`).join('') 
            : `<span class="skill-match" style="color: #d32f2f; background: #ffebee;">Nenhum requisito preenchido</span>`;

        htmlVagas += `
            <div class="job-card">
                <div class="match-badge" style="background-color: ${corBadge}; color: white; border: none;">${porcentagem}% Compatível</div>
                <h2 class="job-title">${vaga.titulo}</h2>
                <p class="company-name">${vaga.empresa}</p>
                
                <div class="job-description">
                    <p class="match-reason"><strong>Match Técnico e Comportamental:</strong> Você possui ${meusMatches} de ${totalRequisitos} requisitos exigidos:</p>
                    <div class="job-skills">
                        ${skillsHtml}
                    </div>
                </div>

                <button class="btn-apply" ${estadoBotao}>${textoBotao}</button>
            </div>
        `;
    });

    containerVagas.innerHTML = htmlVagas || `<h2>Nenhuma vaga encontrada para o seu perfil.</h2>`;

    // Evento do botão de candidatura apenas para os botões que não estão "disabled"
    document.querySelectorAll('.btn-apply').forEach(btn => {
        // O navegador automaticamente ignora cliques em botões com o atributo "disabled"
        btn.addEventListener('click', function() {
            this.innerText = "✓ Candidatura Enviada";
            this.style.backgroundColor = "#736B66";
            this.style.borderColor = "#736B66";
            this.disabled = true;
            this.style.cursor = "default";
            alert("Sucesso! Seu perfil completo foi enviado para a empresa com o selo PerfilExato SENAI, entraremos em contato pelo seu email.");
        });
    });
});