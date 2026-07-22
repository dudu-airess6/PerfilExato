document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-inscricoes');
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

    if (!tokenAtivo) {
        window.location.href = 'login.html';
        return;
    }

    fetch(`http://localhost:5200/api/usuario?token=${tokenAtivo}`)
        .then(response => response.json())
        .then(data => {
            if (!data.sucesso || !data.inscricoes || data.inscricoes.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; border: 2px dashed #e0e0e0; border-radius: 8px; color: #777;">
                        <span style="font-size: 2.5rem;">📁</span>
                        <h3>Nenhuma candidatura realizada</h3>
                        <p>Navegue até a aba de Vagas para encontrar posições alinhadas ao seu perfil.</p>
                    </div>`;
                return;
            }

            let htmlInscricoes = '';

            // Varre a lista retornada pelo C# construindo o layout histórico
            data.inscricoes.forEach(candidatura => {
                htmlInscricoes += `
                    <div style="background: #fdfdfd; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #333;">${candidatura.tituloVaga}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.95rem;">🏬 Empresa: <strong>${candidatura.empresa}</strong></p>
                            <span style="display: inline-block; margin-top: 8px; font-size: 0.85rem; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 4px; font-weight: 500;">
                                Selo PerfilExato Compartilhado
                            </span>
                        </div>
                        <div style="text-align: right; min-width: 180px;">
                            <p style="margin: 0; font-size: 0.85rem; color: #999;">Candidatado em:</p>
                            <p style="margin: 2px 0 0 0; font-weight: 600; color: #444; font-size: 0.95rem;">📅 ${candidatura.dataHora}</p>
                        </div>
                    </div>`;
            });

            container.innerHTML = htmlInscricoes;
        })
        .catch(() => {
            container.innerHTML = `<h2>Erro ao carregar histórico de inscrições. O servidor está ativo?</h2>`;
        });
});