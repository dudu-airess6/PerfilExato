document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-inscricoes');
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

    function exibirEstadoVazio() {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; border: 2px dashed #e0e0e0; border-radius: 8px; color: #777;">
                <span style="font-size: 2.5rem;">📁</span>
                <h3>Nenhuma candidatura realizada</h3>
                <p>Navegue até a aba de Vagas para encontrar posições alinhadas ao seu perfil.</p>
            </div>`;
    }


    // Carrega o histórico de inscrições do usuário
    fetch('http://localhost:5200/api/usuario', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenAtivo}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 401) throw new Error("Sessão expirada");
            return response.json();
        })
        .then(data => {
            if (!data.sucesso || !data.inscricoes || data.inscricoes.length === 0) {
                exibirEstadoVazio();
                return;
            }

            let htmlInscricoes = '';

            // Constrói o layout incluindo o botão de exclusão com o data-id
            data.inscricoes.forEach(candidatura => {
                htmlInscricoes += `
                    <div class="card-inscricao" style="background: #fdfdfd; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #333;">${candidatura.tituloVaga}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.95rem;">🏬 Empresa: <strong>${candidatura.empresa}</strong></p>
                            <span style="display: inline-block; margin-top: 8px; font-size: 0.85rem; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 4px; font-weight: 500;">
                                Selo PerfilExato Compartilhado
                            </span>
                        </div>
                        <div style="text-align: right; min-width: 180px; display: flex; flex-direction: column; gap: 10px; align-items: flex-end;">
                            <div style="text-align: right;">
                                <p style="margin: 0; font-size: 0.85rem; color: #999;">Candidatado em:</p>
                                <p style="margin: 2px 0 0 0; font-weight: 600; color: #444; font-size: 0.95rem;">📅 ${candidatura.dataHora}</p>
                            </div>
                            <button class="btn-cancelar" data-id="${candidatura.id}" style="background: none; border: 1px solid #d32f2f; color: #d32f2f; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                                Cancelar Inscrição
                            </button>
                        </div>
                    </div>`;
            });

            container.innerHTML = htmlInscricoes;

            // Configura a ação de clique dos botões de cancelamento
            document.querySelectorAll('.btn-cancelar').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idInscricao = this.getAttribute('data-id');
                    
                    if (confirm("Tem certeza que deseja cancelar sua inscrição para esta vaga?")) {
                        fetch(`http://localhost:5200/api/vagas/cancelar/${idInscricao}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${tokenAtivo}`,
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(res => res.json())
                        .then(apiData => {
                            if (apiData.sucesso) {
                                alert(apiData.mensagem);
                                // Remove o elemento do card direto da tela sem precisar dar F5
                                this.closest('.card-inscricao').remove();
                                
                                // Se não sobrar nenhum card na tela, exibe a mensagem de lista vazia
                                if (container.querySelectorAll('.card-inscricao').length === 0) {
                                    exibirEstadoVazio();
                                }
                            } else {
                                alert(apiData.mensagem);
                            }
                        })
                        .catch(() => alert("Erro ao processar cancelamento no servidor."));
                    }
                });
            });
        })
        .catch(() => {
            container.innerHTML = `<h2>Erro ao carregar histórico de inscrições. Inscreva-se em uma vaga</h2>`;
        });
});