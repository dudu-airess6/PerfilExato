const formPerfil = document.getElementById('formPerfil');

if (formPerfil) {
    formPerfil.addEventListener('submit', function(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const curso = document.getElementById('curso').value;
        const formacao = document.querySelector('input[name="formacao"]:checked').value;

        // Captura todas as Hard Skills marcadas
        const hardSkills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
                                .map(el => el.value);

        // Captura todas as Soft Skills marcadas (ADICIONADO)
        const softSkills = Array.from(document.querySelectorAll('input[name="soft_skills"]:checked'))
                                .map(el => el.value);

        const perfilUsuario = {
            nome: nome,
            curso: curso,
            formacao: formacao,
            competencias: hardSkills, // Técnicas
            comportamentais: softSkills // Comportamentais
        };

        localStorage.setItem('dados_perfilExato', JSON.stringify(perfilUsuario));

        // Efeito visual antes de ir para o scanner
        const btn = formPerfil.querySelector('.btn-submit');
        btn.innerHTML = "Analisando Perfil...";
        
        setTimeout(() => {
            window.location.href = 'scanner.html';
        }, 800);
    });
}