document.addEventListener('DOMContentLoaded', () => {
    const containerVagas = document.getElementById('lista-vagas');
    // Captura o Token gerado no Login em vez do localStorage
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

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

    // --- FUNÇÃO PARA RENDERIZAR O ESTADO VAZIO CASO NÃO EXISTA PERFIL ---
    function exibirEstadoVazio() {
        containerVagas.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; margin: 40px auto;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                <h2 style="margin-bottom: 10px; color: #333;">Onde está o seu perfil?</h2>
                <p style="margin-bottom: 30px; color: #666; line-height: 1.5; font-size: 1.1em;">
                    Não conseguimos encontrar os seus dados. Para acessar as vagas compatíveis e ver a sua compatibilidade, preencha o formulário primeiro.
                </p>
                <a href="formulario.html" class="btn-primary" style="text-decoration: none; display: inline-block; padding: 12px 28px; border-radius: 6px; background-color: var(--primary-green-dark); color: white; border: none; font-weight: bold; transition: background-color 0.3s;">
                    Preencher Meu Perfil &rarr;
                </a>
            </div>`;
    }

    // Se o usuário nem sequer fez login (sem token), já exibe o estado vazio imediatamente
    if (!tokenAtivo) {
        exibirEstadoVazio();
        return;
    }

    // --- CONEXÃO COM O BACKEND C# EM TEMPO REAL ---
    fetch(`http://localhost:5200/api/usuario?token=${tokenAtivo}`)
        .then(response => response.json())
        .then(data => {
            // Se o C# responder que a sessão caiu ou que o formulário está vazio (null)
            if (!data.sucesso || !data.perfil || !data.perfil.competencias) {
                exibirEstadoVazio();
                return;
            }

            // Mapeia os dados retornados do C# para a variável que roda na sua lógica
            const dadosAluno = data.perfil;
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

                // --- LÓGICA DE CORES E BLOQUEIO MANTIDA ---
                let corBadge = '';
                let estadoBotao = '';
                let textoBotao = 'Candidatar-se com PerfilExato';

                if (porcentagem >= 60) {
                    corBadge = '#2e7d32'; // Verde forte (Alta compatibilidade)
                } else if (porcentagem >= 40) {
                    corBadge = '#8ba88e'; // Verde acinzentado (Média compatibilidade)
                } else {
                    corBadge = '#d32f2f'; // Vermelho (Baixa compatibilidade)
                    estadoBotao = 'disabled style="background-color: #e0e0e0; color: #9e9e9e; border-color: #e0e0e0; cursor: not-allowed;"';
                    textoBotao = 'Requisitos Insuficientes';
                }

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

            // --- EVENTO DO BOTÃO DE CANDIDATURA ---
            // Colocado dentro do fluxo assíncrono para garantir que os botões já existam na tela
            document.querySelectorAll('.btn-apply').forEach(btn => {
                if (btn.hasAttribute('disabled')) return; // Prevenção extra para botões inativos

                btn.addEventListener('click', function() {
                    this.innerText = "✓ Candidatura Enviada";
                    this.style.backgroundColor = "#736B66";
                    this.style.borderColor = "#736B66";
                    this.disabled = true;
                    this.style.cursor = "default";
                    alert("Sucesso! Seu perfil completo foi enviado para a empresa com o selo PerfilExato SENAI, entraremos em contato pelo seu email.");
                });
            });
        })
        .catch(error => {
            console.error("Erro ao conectar ao C#:", error);
            containerVagas.innerHTML = `<h2 style="text-align:center; color:#d32f2f;">Erro ao carregar as vagas. O servidor backend está ligado?</h2>`;
        });
});