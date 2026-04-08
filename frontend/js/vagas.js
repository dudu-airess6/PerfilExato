// 1. Simulação do Banco de Dados de Vagas (Array de Objetos)
const vagasDisponiveis = [
    {
        titulo: "Desenvolvedor Full Stack Júnior",
        empresa: "InovaTech Solutions",
        requisitos: ["HTML", "CSS", "React", "Node.js", "MySQL"]
    },
    {
        titulo: "Técnico em Eletromecânica Jr.",
        empresa: "Indústrias Atlas",
        requisitos: ["Eletricidade Predial", "AutoCAD", "Manutenção Preventiva"]
    }
];

// 2. Busca o perfil do aluno
const dadosAluno = JSON.parse(localStorage.getItem('dados_perfilExato'));
const containerVagas = document.querySelector('.vagas-wrapper .container');

if (!dadosAluno) {
    containerVagas.innerHTML = `<p>Preencha seu perfil para ver suas vagas compatíveis!</p>`;
} else {
    // 3. Lógica para cruzar os dados e renderizar
    let htmlVagas = '';

    vagasDisponiveis.forEach(vaga => {
        // Conta quantas habilidades da vaga o aluno possui
        let matchCount = 0;
        vaga.requisitos.forEach(req => {
            if (dadosAluno.competencias.includes(req)) {
                matchCount++;
            }
        });

        // Calcula a porcentagem
        const porcentagem = Math.round((matchCount / vaga.requisitos.length) * 100);

        // Só mostra se for maior que 0% de compatibilidade (ou outro valor que você preferir)
        if (porcentagem > 0) {
            htmlVagas += `
                <div class="job-card">
                    <div class="match-badge">${porcentagem}% Compatível</div>
                    <h2 class="job-title">${vaga.titulo}</h2>
                    <p class="company-name">${vaga.empresa}</p>
                    <button class="btn-apply">Candidatar-se</button>
                </div>
            `;
        }
    });

    containerVagas.innerHTML += htmlVagas;
}