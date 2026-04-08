document.addEventListener('DOMContentLoaded', () => {
    // 1. Captura a div vazia do HTML
    const containerPerfil = document.getElementById('conteudo-perfil');
    
    // 2. Busca os dados salvos no navegador
    const dadosSalvos = JSON.parse(localStorage.getItem('dados_perfilExato'));

    // 3. Lógica de renderização
    if (!dadosSalvos) {
        // --- ESTADO VAZIO (EMPTY STATE) ---
        containerPerfil.innerHTML = `
            <div class="dashboard-card" style="text-align: center; padding: 40px 20px;">
                <h2 style="margin-bottom: 15px;">📭 Seu perfil ainda está vazio!</h2>
                <p style="margin-bottom: 25px; color: #555;">Para que o PerfilExato encontre as melhores vagas do SENAI para você, precisamos conhecer suas habilidades técnicas.</p>
                <a href="formulario.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Preencher Formulário &rarr;</a>
            </div>
        `;
    } else {
        // --- PERFIL PREENCHIDO COM SUCESSO ---
        
        // Pega o array de competências e transforma nas suas tags HTML
        const skillsTags = dadosSalvos.competencias.map(skill => {
            return `<span class="skill-tag">${skill}</span>`;
        }).join('');

        // Injeta a estrutura mantendo as suas classes CSS originais
        containerPerfil.innerHTML = `
            <div class="dashboard-card">
                <div class="user-info">
                    <p class="eyebrow">PERFIL ANALISADO</p>
                    <h2>Olá, ${dadosSalvos.nome}</h2>
                    <p class="user-title">${dadosSalvos.areaFormacao || 'Profissional SENAI'}</p>
                    
                    <div class="readiness-section">
                        <p><strong>Prontidão para o Mercado:</strong></p>
                        <div class="match-bar-container">
                            <div class="match-bar">85% Pronto</div>
                        </div>
                    </div>
                </div>

                <div class="skills-section">
                    <h3>Competências Detectadas</h3>
                    <div class="skills-container">
                        ${skillsTags} </div>
                    
                    <a href="vagas.html" style="text-decoration: none; display: inline-block; margin-top: 20px;">
                        <button class="btn-primary">Ver Vagas Compatíveis &rarr;</button>
                    </a>
                </div>
            </div>
        `;
    }
});