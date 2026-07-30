document.addEventListener('DOMContentLoaded', () => {
    const painelDashboard = document.getElementById('painel-dashboard');
    const painelVazio = document.getElementById('painel-vazio');
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

    // Barreira de segurança: Sem login ativo, redireciona
    if (!tokenAtivo) {
        alert("Por favor, faça login para acessar seu perfil.");
        window.location.href = 'login.html';
        return;
    }

    // Enviando o Token JWT no Header
    fetch('http://localhost:5200/api/usuario', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenAtivo}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error("Sessão expirada. Faça login novamente.");
        }
        return response.json();
    })
    .then(data => {
        // Se o C# responder que deu errado ou o objeto do perfil estiver nulo
        if (!data.sucesso || !data.perfil) {
            painelVazio.style.display = 'block';
            painelDashboard.style.display = 'none';
            return;
        }

        // Ajustado aqui: Trocado '=' por ':' que estava quebrando o script
        const dadosSalvos = {
            nome: data.nome,
            curso: data.perfil.curso || '',
            cpf: data.perfil.cpf || '',
            cidade: data.perfil.cidade || '',
            estado: data.perfil.estado || '',
            cep: data.perfil.cep || '',
            formacao: data.perfil.formacao || '',
            competencias: data.perfil.competencias || [],
            comportamentais: data.perfil.comportamentais || []
        };

        // --- 📊 CÁLCULO DE PRONTIDÃO ATUALIZADO COM PESOS DO MERCADO ---
        let pontuacaoProntidao = 0;
        
        // 1. Escolaridade/Formação (Máx: 20 pontos)
        if (dadosSalvos.formacao) {
            pontuacaoProntidao += dadosSalvos.formacao.includes("Incompleto") ? 10 : 20;
        }
        
        // 2. Hard Skills - Peso Maior (Máx: 50 pontos)
        const qtdHard = dadosSalvos.competencias.length;
        pontuacaoProntidao += Math.min(qtdHard * 10, 50); 
        
        // 3. Soft Skills - Peso Menor (Máx: 30 pontos)
        const qtdSoft = dadosSalvos.comportamentais.length;
        pontuacaoProntidao += Math.min(qtdSoft * 10, 30); 
        
        if (pontuacaoProntidao > 100) pontuacaoProntidao = 100;

        let corBarra = '#d32f2f'; 
        let textoStatus = 'Iniciante';
        if (pontuacaoProntidao >= 80) { 
            corBarra = '#2e7d32'; 
            textoStatus = 'Excelente'; 
        } else if (pontuacaoProntidao >= 50) { 
            corBarra = '#f57c00'; 
            textoStatus = 'Em Desenvolvimento'; 
        }

        // --- PREENCHIMENTO DOS CAMPOS ESTILIZADOS ---
        document.getElementById('perfil-avatar').textContent = dadosSalvos.nome.charAt(0).toUpperCase();
        document.getElementById('perfil-nome').textContent = dadosSalvos.nome;
        document.getElementById('perfil-curso').textContent = dadosSalvos.curso.toUpperCase().replace(/-/g, ' ');
        document.getElementById('perfil-cpf').textContent = dadosSalvos.cpf;
        document.getElementById('perfil-localizacao').textContent = `${dadosSalvos.cidade} / ${dadosSalvos.estado}`;
        document.getElementById('perfil-cep').textContent = dadosSalvos.cep;
        document.getElementById('perfil-escolaridade').textContent = dadosSalvos.formacao || 'Não informado';

        // --- ATUALIZAÇÃO DA BARRA DE PRONTIDÃO ---
        const statusLabel = document.getElementById('readiness-status');
        statusLabel.textContent = `${pontuacaoProntidao}% - ${textoStatus}`;
        statusLabel.style.color = corBarra;

        const progressBar = document.getElementById('readiness-bar');
        progressBar.style.width = `${pontuacaoProntidao}%`;
        progressBar.style.backgroundColor = corBarra;

        // --- INJEÇÃO DAS SKILLS (HARD E SOFT) ---
        const containerHard = document.getElementById('tags-hard');
        containerHard.innerHTML = qtdHard > 0 
            ? dadosSalvos.competencias.map(s => `<span class="tag-skill hard">${s}</span>`).join('') 
            : '<p class="no-data">Nenhuma competência técnica.</p>';

        const containerSoft = document.getElementById('tags-soft');
        containerSoft.innerHTML = qtdSoft > 0 
            ? dadosSalvos.comportamentais.map(s => `<span class="tag-skill soft">${s}</span>`).join('') 
            : '<p class="no-data">Nenhuma competência comportamental.</p>';

        // Torna o painel visível após popular tudo perfeitamente
        painelDashboard.style.display = 'block';
        painelVazio.style.display = 'none';
    })
    .catch(error => {
        console.error("Erro crítico de conexão com o servidor C#:", error);
        painelVazio.style.display = 'block';
        painelVazio.innerHTML = `<h2>⚠️ Erro de Conexão</h2><p>${error.message || 'Não foi possível estabelecer contato com a API do PerfilExato.'}</p>`;
    });
});