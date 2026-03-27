document.addEventListener("DOMContentLoaded", function() {

    // --- 1. TELA DE FORMULÁRIO (formulario.html) ---
    // Vai capturar o formulário pelo ID que acabámos de adicionar
    const formPerfil = document.getElementById('formPerfil'); 
    
    if (formPerfil) {
        formPerfil.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede o comportamento padrão de recarregar a página
            
            const btnSubmit = formPerfil.querySelector('.btn-submit');
            
            // Efeito visual de carregamento
            if (btnSubmit) {
                btnSubmit.innerHTML = "A processar dados...";
                btnSubmit.style.opacity = "0.8";
                btnSubmit.style.cursor = "wait";
            }
            
            // Aguarda quase 1 segundo e manda para o Scanner
            setTimeout(() => {
                window.location.href = "scanner.html";
            }, 800);
        });
    }

    // --- 2. TELA: O SCANNER (scanner.html) ---
    // Se a página tiver o cartão do scanner, significa que estamos no scanner.html
    const scannerScreen = document.querySelector('.scanner-card');
    if (scannerScreen) {
        // Aguarda 3.5 segundos (tempo da animação) e redireciona para o Dashboard (Meu Perfil)
        setTimeout(function() {
            window.location.href = "dashboard.html";
        }, 3500);
    }

    // --- 3. TELA: DASHBOARD (dashboard.html) ---
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        const btnVagas = dashboardCard.querySelector('.btn-primary');
        if (btnVagas) {
            btnVagas.addEventListener('click', function() {
                window.location.href = "vagas.html";
            });
        }
    }

    // --- 4. TELA: VAGAS (vagas.html) ---
    const btnApplyList = document.querySelectorAll('.btn-apply');
    if (btnApplyList.length > 0) {
        btnApplyList.forEach(function(btn) {
            btn.addEventListener('click', function() {
                this.innerText = "✓ Candidatura Enviada";
                this.style.backgroundColor = "#736B66";
                this.style.borderColor = "#736B66";
                this.disabled = true;
                this.style.cursor = "default";
                alert("Sucesso! O seu perfil foi enviado para análise da empresa com o selo PerfilExato SENAI.");
            });
        });
    }

    // --- 5. FUNCIONALIDADE DA SETA DE SCROLL (Global) ---
    const scrollArrow = document.getElementById('scrollArrow');
    if (scrollArrow) {
        scrollArrow.style.display = 'flex';
        scrollArrow.style.opacity = '0.9';

        window.addEventListener('scroll', () => {
            const scrollTopo = window.scrollY; 
            const alturaTotal = document.documentElement.scrollHeight; 
            const alturaJanela = window.innerHeight; 
            
            const noFinal = (scrollTopo + alturaJanela) >= (alturaTotal - 50);

            if (!noFinal) {
                scrollArrow.style.opacity = '0.9';
                scrollArrow.style.pointerEvents = 'auto';
            } else {
                scrollArrow.style.opacity = '0';
                scrollArrow.style.pointerEvents = 'none';
            }
        });

        scrollArrow.addEventListener('click', () => {
            window.scrollBy({
                top: window.innerHeight * 0.6,
                behavior: 'smooth'
            });
        });
    }
    
});