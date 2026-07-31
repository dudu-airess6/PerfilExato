document.addEventListener("DOMContentLoaded", function() {

    // --- 2. TELA: O SCANNER (scanner.html) ---
    const scannerScreen = document.querySelector('.scanner-card');
    if (scannerScreen) {
        setTimeout(function() {
            window.location.href = "perfil.html"; 
        }, 3500);
    }

    // --- 3. TELA: DASHBOARD/PERFIL (perfil.html) ---
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        const btnVagas = dashboardCard.querySelector('.btn-primary');
        if (btnVagas) {
            btnVagas.addEventListener('click', function(e) {
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

    // --- 6. FUNCIONALIDADE DA NAVBAR (Mostra/Esconde Botão Entrar) ---
    const token = sessionStorage.getItem('token_perfilExato');
    const botaoLoginNav = document.getElementById('nav-login');

    if (botaoLoginNav) {
        if (!token) {
            botaoLoginNav.style.display = 'inline-block'; // Mostra se deslogado
        } else {
            botaoLoginNav.style.display = 'none'; // Esconde se logado
        }
    }
    
}); // <- Este é o fechamento do único DOMContentLoaded da página