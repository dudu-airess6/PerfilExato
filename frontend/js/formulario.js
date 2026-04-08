// Captura o formulário pelo ID correto do HTML
const formPerfil = document.getElementById('formPerfil');

if (formPerfil) {
    formPerfil.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita recarregar a página

        // 1. Captura o Nome
        const nomeAluno = document.getElementById('nome').value;
        
        // 2. Captura o Curso (para aparecer bonitinho no perfil)
        const cursoSelect = document.getElementById('curso');
        const areaFormacao = cursoSelect.options[cursoSelect.selectedIndex].text;

        // 3. Captura apenas as Hard Skills (Checkboxes) que foram marcadas
        const skillsMarcadas = document.querySelectorAll('input[name="skills"]:checked');
        // Transforma a lista de caixas marcadas em uma lista de textos
        const skillsArray = Array.from(skillsMarcadas).map(checkbox => checkbox.value);

        // Cria um objeto com os dados
        const perfilUsuario = {
            nome: nomeAluno,
            areaFormacao: areaFormacao,
            competencias: skillsArray
        };

        // Salva no LocalStorage
        localStorage.setItem('dados_perfilExato', JSON.stringify(perfilUsuario));

        // 4. Efeito do botão carregando (movido do script.js para cá)
        const btnSubmit = formPerfil.querySelector('.btn-submit');
        if (btnSubmit) {
            btnSubmit.innerHTML = "A processar dados...";
            btnSubmit.style.opacity = "0.8";
            btnSubmit.style.cursor = "wait";
        }

        // Aguarda 800ms e manda para o Scanner
        setTimeout(() => {
            window.location.href = "scanner.html";
        }, 800);
    });
}