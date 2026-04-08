document.addEventListener('DOMContentLoaded', () => {
    const containerPerfil = document.getElementById('conteudo-perfil');
    const dadosSalvos = JSON.parse(localStorage.getItem('dados_perfilExato'));

    if (!dadosSalvos) {
        containerPerfil.innerHTML = `
            <div class="dashboard-card" style="text-align: center; padding: 40px 20px;">
                <h2 style="margin-bottom: 15px;">📭 O seu perfil ainda está vazio!</h2>
                <p style="margin-bottom: 25px; color: #555;">Para que o PerfilExato encontre as melhores vagas para si, precisamos de conhecer as suas habilidades.</p>
                <a href="formulario.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Preencher Formulário &rarr;</a>
            </div>
        `;
    } else {
        // --- CÁLCULO DE PRONTIDÃO PARA O MERCADO ---
        let pontuacaoProntidao = 0;

        // 1. Pontos por Formação (Máximo 20%)
        if (dadosSalvos.formacao) {
            if (dadosSalvos.formacao.includes("Incompleto")) {
                pontuacaoProntidao += 10;
            } else {
                pontuacaoProntidao += 20; // Médio completo, superior, etc.
            }
        }

        // 2. Pontos por Hard Skills (Até 40% - 10% por cada skill)
        const qtdHard = dadosSalvos.competencias ? dadosSalvos.competencias.length : 0;
        pontuacaoProntidao += Math.min(qtdHard * 10, 40);

        // 3. Pontos por Soft Skills (Até 40% - 10% por cada skill)
        const qtdSoft = dadosSalvos.comportamentais ? dadosSalvos.comportamentais.length : 0;
        pontuacaoProntidao += Math.min(qtdSoft * 10, 40);

        // Limita a 100% por segurança
        if (pontuacaoProntidao > 100) pontuacaoProntidao = 100;

        // 4. Define a cor e texto da barra baseado na nota
        let corBarra = '#d32f2f'; // Vermelho
        let textoStatus = 'Iniciante';
        
        if (pontuacaoProntidao >= 80) {
            corBarra = '#2e7d32'; // Verde
            textoStatus = 'Excelente';
        } else if (pontuacaoProntidao >= 50) {
            corBarra = '#f57c00'; // Laranja
            textoStatus = 'Em Desenvolvimento';
        }

        // --- MONTAGEM DAS TAGS ---
        let hardSkillsTags = '<p style="color: #888; font-size: 0.9em; width: 100%;">Nenhuma competência técnica informada.</p>';
        if (qtdHard > 0) {
            hardSkillsTags = dadosSalvos.competencias.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        }

        let softSkillsTags = '<p style="color: #888; font-size: 0.9em; width: 100%;">Nenhuma competência comportamental informada.</p>';
        if (qtdSoft > 0) {
            softSkillsTags = dadosSalvos.comportamentais.map(skill => `<span class="skill-tag" style="background-color: #e3f2fd; color: #1565c0; border-color: #bbdefb;">${skill}</span>`).join('');
        }

        const cursoFormatado = dadosSalvos.curso ? dadosSalvos.curso.toUpperCase() : 'Profissional SENAI';

        // --- INJEÇÃO DO HTML ---
        containerPerfil.innerHTML = `
            <div class="dashboard-card">
                <div class="user-info">
                    <p class="eyebrow">PERFIL ANALISADO</p>
                    <h2>Olá, ${dadosSalvos.nome}</h2>
                    <p class="user-title" style="margin-bottom: 5px;"><strong>Curso:</strong> ${cursoFormatado}</p>
                    <p style="color: #555; font-size: 0.95em;"><strong>Nível de Formação:</strong> ${dadosSalvos.formacao || 'Não informado'}</p>
                    
                    <div class="readiness-section" style="margin-top: 20px;">
                        <p style="margin-bottom: 8px;"><strong>Prontidão para o Mercado:</strong></p>
                        <div class="match-bar-container" style="background-color: #e0e0e0; border-radius: 20px; overflow: hidden; height: 24px; width: 100%;">
                            <div class="match-bar" style="width: ${pontuacaoProntidao}%; background-color: ${corBarra}; color: white; text-align: center; font-size: 0.85em; font-weight: bold; line-height: 24px; transition: width 1s ease-in-out;">
                                ${pontuacaoProntidao}% - ${textoStatus}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="skills-section" style="margin-top: 30px;">
                    <h3 style="margin-bottom: 15px; font-size: 1.1em; color: #333;">⚙️ Competências Técnicas (Hard Skills)</h3>
                    <div class="skills-container" style="margin-bottom: 25px; display: flex; flex-wrap: wrap; gap: 8px;">
                        ${hardSkillsTags}
                    </div>

                    <h3 style="margin-bottom: 15px; font-size: 1.1em; color: #333;">🧠 Competências Comportamentais (Soft Skills)</h3>
                    <div class="skills-container" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${softSkillsTags}
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <a href="vagas.html" style="text-decoration: none; display: inline-block;">
                            <button class="btn-primary">Ver Vagas Compatíveis &rarr;</button>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
});