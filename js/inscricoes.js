// 🔔 FUNÇÃO DE ALERTA GLOBAL
function exibirAlertaGlobal(mensagem, tipo = 'erro') {
    let caixaAlerta = document.getElementById('mensagem-alerta');
    
    if (!caixaAlerta) {
        caixaAlerta = document.createElement('div');
        caixaAlerta.id = 'mensagem-alerta';
        caixaAlerta.style.cssText = 'padding: 14px 18px; margin: 0 auto 20px auto; border-radius: 8px; font-weight: 500; font-size: 0.95rem; display: none; width: 100%; border: 1px solid; transition: all 0.3s ease; text-align: center;';
        
        const cardParent = document.querySelector('.dashboard-card');
        if (cardParent) {
            cardParent.insertBefore(caixaAlerta, cardParent.firstChild);
        }
    }

    caixaAlerta.innerText = mensagem;
    caixaAlerta.style.display = 'block';

    if (tipo === 'sucesso') {
        caixaAlerta.style.backgroundColor = '#d4edda';
        caixaAlerta.style.color = '#155724';
        caixaAlerta.style.borderColor = '#c3e6cb';
    } else {
        caixaAlerta.style.backgroundColor = '#f8d7da';
        caixaAlerta.style.color = '#721c24';
        caixaAlerta.style.borderColor = '#f5c6cb';
    }

    caixaAlerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function esconderAlertaGlobal() {
    const caixaAlerta = document.getElementById('mensagem-alerta');
    if (caixaAlerta) caixaAlerta.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-inscricoes');
    const tokenAtivo = sessionStorage.getItem('token_perfilExato');

    // Tela de estado sem dados ou sem login
    function exibirEstadoVazio() {
        if (!container) return;
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; border: 2px dashed #e0e0e0; border-radius: 8px; color: #777;">
                <span style="font-size: 2.5rem;">📁</span>
                <h3>Nenhuma candidatura realizada</h3>
                <p>Navegue até a aba de Vagas para encontrar posições alinhadas ao seu perfil.</p>
            </div>`;
    }

    if (!tokenAtivo) {
        exibirEstadoVazio();
        return;
    }

    // 📍 BUSCA O HISTÓRICO DE INSCRIÇÕES NO BACKEND (C#)
    fetch('http://localhost:5200/api/usuario', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenAtivo}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            exibirAlertaGlobal("Sessão expirada. Redirecionando...", "erro");
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
            throw new Error("Sessão expirada");
        }
        return response.json();
    })
    .then(data => {
        if (!data.sucesso || !data.inscricoes || data.inscricoes.length === 0) {
            exibirEstadoVazio();
            return;
        }

        let htmlInscricoes = '';

        // Renderiza os cards das inscrições ativas
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
                    <div class="acoes-inscricao" style="text-align: right; min-width: 180px; display: flex; flex-direction: column; gap: 10px; align-items: flex-end;">
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

        // 📍 GERENCIAMENTO DE CANCELAMENTO COM CONFIRMAÇÃO INLINE
        document.querySelectorAll('.btn-cancelar').forEach(btnCancelar => {
            btnCancelar.addEventListener('click', function() {
                esconderAlertaGlobal();

                const idInscricao = this.getAttribute('data-id');
                const containerPai = this.parentElement;

                // Oculta o botão inicial de cancelar
                this.style.display = 'none';

                // Cria o painel dinâmico de confirmação
                const boxConfirmacao = document.createElement('div');
                boxConfirmacao.className = 'confirmacao-inline';
                boxConfirmacao.style.cssText = 'display: flex; align-items: center; gap: 8px; background: #ffebee; padding: 6px 10px; border-radius: 6px; border: 1px solid #ffcdd2;';
                boxConfirmacao.innerHTML = `
                    <span style="font-size: 0.82rem; color: #c62828; font-weight: 600;">Tem certeza?</span>
                    <button class="btn-confirmar-sim" style="background: #d32f2f; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">Sim, cancelar</button>
                    <button class="btn-confirmar-nao" style="background: #e0e0e0; color: #333; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">Não</button>
                `;

                containerPai.appendChild(boxConfirmacao);

                // 🔴 Ação 1: Clique em "Não" (Desiste do cancelamento)
                boxConfirmacao.querySelector('.btn-confirmar-nao').addEventListener('click', () => {
                    boxConfirmacao.remove();
                    btnCancelar.style.display = 'inline-block';
                });

                // 🟢 Ação 2: Clique em "Sim, cancelar" (Executa a exclusão na API)
                boxConfirmacao.querySelector('.btn-confirmar-sim').addEventListener('click', function() {
                    const btnSim = this;
                    const card = containerPai.closest('.card-inscricao');

                    btnSim.disabled = true;
                    btnSim.innerText = "Cancelando...";
                    btnSim.style.opacity = "0.7";

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
                            exibirAlertaGlobal(apiData.mensagem || "Inscrição cancelada com sucesso!", "sucesso");
                            if (card) card.remove();
                            
                            if (container.querySelectorAll('.card-inscricao').length === 0) {
                                exibirEstadoVazio();
                            }
                        } else {
                            boxConfirmacao.remove();
                            btnCancelar.style.display = 'inline-block';
                            exibirAlertaGlobal(apiData.mensagem || "Não foi possível cancelar a inscrição.", "erro");
                        }
                    })
                    .catch(err => {
                        console.error("❌ Erro ao cancelar inscrição:", err);
                        boxConfirmacao.remove();
                        btnCancelar.style.display = 'inline-block';
                        exibirAlertaGlobal("Erro ao comunicar com o servidor. Tente novamente.", "erro");
                    });
                });
            });
        });
    })
    .catch(err => {
        if (!err.message.includes("Sessão expirada")) {
            console.error("❌ Erro no carregamento inicial:", err);
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #d32f2f;">
                    <h3>Falha ao carregar inscrições</h3>
                    <p style="color: #666;">Não foi possível se conectar com o servidor do PerfilExato.</p>
                </div>`;
        }
    });
});