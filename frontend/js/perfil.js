document.addEventListener('DOMContentLoaded', () => {
    const containerPerfil = document.getElementById('conteudo-perfil');
    const dadosSalvos = JSON.parse(localStorage.getItem('dados_perfilExato'));

    if (!dadosSalvos) {
        containerPerfil.innerHTML = `
            <div class="dashboard-card empty-state">
                <h2>📭 O seu perfil ainda está vazio!</h2>
                <p>Para que o PerfilExato encontre as melhores vagas, preencha o formulário técnico.</p>
                <a href="formulario.html" class="btn-primary">Preencher Formulário</a>
            </div>
        `;
        return;
    }

    // --- CÁLCULO DE PRONTIDÃO (LÓGICA ORIGINAL PRESERVADA) ---
    let pontuacaoProntidao = 0;
    if (dadosSalvos.formacao) {
        pontuacaoProntidao += dadosSalvos.formacao.includes("Incompleto") ? 10 : 20;
    }
    const qtdHard = dadosSalvos.competencias ? dadosSalvos.competencias.length : 0;
    pontuacaoProntidao += Math.min(qtdHard * 10, 40);
    const qtdSoft = dadosSalvos.comportamentais ? dadosSalvos.comportamentais.length : 0;
    pontuacaoProntidao += Math.min(qtdSoft * 10, 40);
    if (pontuacaoProntidao > 100) pontuacaoProntidao = 100;

    let corBarra = '#d32f2f'; 
    let textoStatus = 'Iniciante';
    if (pontuacaoProntidao >= 80) { corBarra = '#2e7d32'; textoStatus = 'Excelente'; }
    else if (pontuacaoProntidao >= 50) { corBarra = '#f57c00'; textoStatus = 'Em Desenvolvimento'; }

    // --- MONTAGEM DAS TAGS ---
    const hardTags = qtdHard > 0 ? dadosSalvos.competencias.map(s => `<span class="tag-skill hard">${s}</span>`).join('') : '<p class="no-data">Nenhuma competência técnica.</p>';
    const softTags = qtdSoft > 0 ? dadosSalvos.comportamentais.map(s => `<span class="tag-skill soft">${s}</span>`).join('') : '<p class="no-data">Nenhuma competência comportamental.</p>';

    // --- INJEÇÃO DO HTML ---
    containerPerfil.innerHTML = `
        <div class="dashboard-card">
            <div class="profile-header">
                <div class="avatar">${dadosSalvos.nome.charAt(0).toUpperCase()}</div>
                <div class="user-meta">
                    <p class="eyebrow">ESTUDANTE SENAI</p>
                    <h1>${dadosSalvos.nome}</h1>
                    <p class="main-course">${dadosSalvos.curso.toUpperCase().replace(/-/g, ' ')}</p>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-group">
                    <label>CPF</label>
                    <p>${dadosSalvos.cpf}</p>
                </div>
                <div class="info-group">
                    <label>Localização</label>
                    <p>${dadosSalvos.cidade} / ${dadosSalvos.estado}</p>
                </div>
                <div class="info-group">
                    <label>CEP</label>
                    <p>${dadosSalvos.cep}</p>
                </div>
                <div class="info-group">
                    <label>Escolaridade</label>
                    <p>${dadosSalvos.formacao || 'Não informado'}</p>
                </div>
            </div>

            <div class="readiness-box">
                <div class="readiness-header">
                    <span>Prontidão para o Mercado</span>
                    <span style="color: ${corBarra}">${pontuacaoProntidao}% - ${textoStatus}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${pontuacaoProntidao}%; background-color: ${corBarra}"></div>
                </div>
            </div>

            <div class="skills-wrapper">
                <div class="skill-column">
                    <h3>⚙️ Hard Skills</h3>
                    <div class="tags-flex">${hardTags}</div>
                </div>
                <div class="skill-column">
                    <h3>🧠 Soft Skills</h3>
                    <div class="tags-flex">${softTags}</div>
                </div>
            </div>

            <div class="profile-footer">
                <a href="vagas.html" class="btn-success-large">Ver Vagas Compatíveis</a>
            </div>
        </div>
    `;
});