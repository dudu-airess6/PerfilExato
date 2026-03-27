document.addEventListener("DOMContentLoaded", function() {

    // --- 1. TELA DE FORMULÁRIO (formulario.html) ---
    // Esta parte vai capturar o clique do botão "Analisar Perfil" quando criarmos o formulário
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede a página de recarregar
            
            // Aqui futuramente enviaremos os dados para o C#, mas por agora:
            // Simula o envio e vai para a tela do Scanner
            window.location.href = "scanner.html";
        });
    }

    // --- 2. TELA: O SCANNER (scanner.html) ---
    const scannerScreen = document.querySelector('.scanner-card');
    if (scannerScreen) {
        // Aguarda 3.5 segundos e redireciona para o Dashboard
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
        window.addEventListener('scroll', () => {
            const scrollTopo = window.scrollY; // O quanto já desceu
            const alturaTotal = document.documentElement.scrollHeight; // Altura total da página
            const alturaJanela = window.innerHeight; // Altura da tela
            
            // Esconde a seta se estiver chegando no fim (faltando menos de 100px)
            const noFinal = (scrollTopo + alturaJanela) >= (alturaTotal - 100);

            // Mostra a seta apenas se não estiver no topo (desceu > 200px) e não estiver no final
            if (scrollTopo > 200 && !noFinal) {
                scrollArrow.style.display = 'flex';
                scrollArrow.style.opacity = '1';
                scrollArrow.style.pointerEvents = 'auto';
            } else {
                scrollArrow.style.opacity = '0';
                scrollArrow.style.pointerEvents = 'none';
                
                // Delay para o display none não cortar a animação de opacidade
                setTimeout(() => {
                    if (scrollArrow.style.opacity === '0') {
                        scrollArrow.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Clique para descer suavemente
        scrollArrow.addEventListener('click', () => {
            window.scrollBy({
                top: window.innerHeight * 0.7,
                behavior: 'smooth'
            });
        });
    }
    
});