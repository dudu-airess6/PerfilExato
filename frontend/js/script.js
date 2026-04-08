document.addEventListener("DOMContentLoaded", function() {

    // (O Bloco 1 do formulário foi removido daqui pois agora está a ser controlado pelo formulario.js)

    // --- 2. TELA: O SCANNER (scanner.html) ---
    // Se a página tiver o cartão do scanner, significa que estamos no scanner.html
    const scannerScreen = document.querySelector('.scanner-card');
    if (scannerScreen) {
        // Aguarda 3.5 segundos (tempo da animação) e redireciona para o Perfil
        setTimeout(function() {
            window.location.href = "perfil.html"; // <-- CORRIGIDO PARA perfil.html
        }, 3500);
    }

    // --- 3. TELA: DASHBOARD/PERFIL (perfil.html) ---
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        const btnVagas = dashboardCard.querySelector('.btn-primary');
        if (btnVagas) {
            btnVagas.addEventListener('click', function(e) {
                // Apenas por segurança, se já houver um <a> no HTML, não impede
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