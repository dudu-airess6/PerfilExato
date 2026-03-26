document.addEventListener("DOMContentLoaded", function() {

    // --- 1. TELA INICIAL: UPLOAD DE CURRÍCULO (index.html atualizado) ---
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const btnUpload = document.querySelector('.btn-outline-upload');
    const hintText = document.querySelector('.upload-hint');

    // Verifica se estamos na tela inicial
    if (dropzone && fileInput && btnUpload && hintText) {
        
        // Abrir seletor de arquivos ao clicar no botão ou na caixa
        btnUpload.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });

        dropzone.addEventListener('click', () => {
            fileInput.click();
        });

        // Prevenir comportamento padrão de abrir o PDF no navegador
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Efeito visual ao arrastar o arquivo por cima
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                dropzone.style.borderColor = '#3A2E24';
            }, false);
        });

        // Remove o efeito visual ao tirar o arquivo de cima
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => {
                dropzone.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                dropzone.style.borderColor = 'rgba(58, 46, 36, 0.6)';
            }, false);
        });

        // Quando o usuário solta o arquivo na caixa
        dropzone.addEventListener('drop', (e) => {
            handleFiles(e.dataTransfer.files);
        }, false);

        // Quando o usuário seleciona pela janela do Windows/Mac
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        // Função que processa o arquivo
        function handleFiles(files) {
            if (files.length > 0) {
                const file = files[0];
                
                // Verifica se é PDF
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    
                    // Feedback de sucesso na tela
                    hintText.innerHTML = `✓ Arquivo anexado:<br>${file.name}`;
                    hintText.style.color = '#3A2E24';
                    hintText.style.fontWeight = '600';
                    
                    btnUpload.textContent = 'Processando...';
                    btnUpload.style.backgroundColor = 'var(--text-dark)';
                    btnUpload.style.color = 'var(--bg-light)';
                    
                    // Aguarda 1.5 segundos para o usuário ver que deu certo, depois vai para o Scanner
                    setTimeout(() => {
                        window.location.href = "scanner.html"; 
                    }, 1500);

                } else {
                    // Erro se não for PDF
                    alert('Por favor, selecione apenas arquivos no formato PDF.');
                    hintText.textContent = 'Formato inválido. Tente novamente com um .pdf';
                    hintText.style.color = 'red';
                }
            }
        }
    }

    // --- 2. TELA: O SCANNER (scanner.html) ---
    const scannerScreen = document.querySelector('.scanner-card');
    if (scannerScreen) {
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
                this.disabled = true;
                alert("Sucesso! Seu currículo foi enviado para análise da empresa com o selo PerfilExato SENAI.");
            });
        });
    }
});
// --- FUNCIONALIDADE DA SETA COM DETECÇÃO DE FINAL DE PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    const scrollArrow = document.getElementById('scrollArrow');

    if (scrollArrow) {
        window.addEventListener('scroll', () => {
            const scrollTopo = window.scrollY; // O quanto você já desceu
            const alturaTotal = document.documentElement.scrollHeight; // Altura total da página
            const alturaJanela = window.innerHeight; // Altura da sua tela
            
            // 1. Mostra a seta apenas se não estiver no topo (ex: desceu mais de 200px)
            // 2. Esconde a seta se estiver chegando no fim (ex: faltam menos de 100px para o fim)
            const noFinal = (scrollTopo + alturaJanela) >= (alturaTotal - 100);

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