// Captura o formulário pelo ID
const formPerfil = document.getElementById('form-perfil');

formPerfil.addEventListener('submit', function(event) {
    // Evita que a página recarregue ao enviar
    event.preventDefault();

    // Captura os valores dos campos (exemplo com nome e habilidades)
    const nomeAluno = document.getElementById('nome').value;
    // Supondo que as habilidades sejam digitadas separadas por vírgula
    const skillsInput = document.getElementById('skills').value; 
    
    // Transforma o texto em um array (lista) e tira os espaços em branco
    const skillsArray = skillsInput.split(',').map(skill => skill.trim());

    // Cria um objeto com os dados do usuário
    const perfilUsuario = {
        nome: nomeAluno,
        competencias: skillsArray
    };

    // Salva no LocalStorage transformando o objeto em texto (JSON)
    localStorage.setItem('dados_perfilExato', JSON.stringify(perfilUsuario));

    // Redireciona o usuário automaticamente para a página de Perfil
    window.location.href = 'dashboard.html';
});