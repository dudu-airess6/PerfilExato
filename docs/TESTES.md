# Documentação da Suíte de Testes - PerfilExato API

Este documento detalha os testes de desempenho, resiliência, escrita e segurança executados na API .NET 9 com k6 e SQL Server, cobrindo 100% dos endpoints.

## Estrutura de Scripts

* `tests/k6/teste_carga.js`: Validação de segurança sem token JWT (401 Unauthorized).
* `tests/k6/teste_carga_autenticado.js`: Carga nominal no motor de match (`GET /api/vagas/match`).
* `tests/k6/teste_estresse.js`: Teste de estresse extremo com 1.500 VUs simultâneos.
* `tests/k6/teste_candidatura.js`: Ciclo completo de escrita/deleção (`POST /api/vagas/candidatar` e `DELETE /api/vagas/cancelar/{id}`).
* `tests/k6/teste_perfil.js`: Atualização de perfil e validação de CPF (`POST /api/perfil/salvar`).

---

## Resultados Consolidados de Desempenho

| Cenário de Teste | VUs Máx. | Requisições Totais | Taxa de Erro | Latência Média | Latência p95 | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Segurança (Sem Token)** | 50 | 50 | 0.00%* | ~0.50 ms | ~1.20 ms | Aprovado ✅ |
| **2. Carga Nominal (Match)** | 250 | ~50.000 | 0.00% | 2.10 ms | 4.29 ms | Aprovado ✅ |
| **3. Estresse Extremo (Match)** | 1.500 | 253.111 | 0.00% | 12.14 ms | 20.52 ms | Aprovado ✅ |
| **4. Ciclo Candidatura/Cancelamento** | 100 | 7.267 | 0.00% | 2.64 ms | 5.43 ms | Aprovado ✅ |
| **5. Salvar Perfil (CPF/Skills)** | 100 | 2.436 | 0.00% | 1.89 ms | 3.17 ms | Aprovado ✅ |

*\* 100% das requisições foram rejeitadas corretamente com Status 401 pelo middleware de segurança.*

---

## Destaques de Arquitetura e Engenharia

* **Zero Lock Volatilidade:** O SQL Server processou concorrência massiva de `INSERT` e `DELETE` em `Inscricoes` sem gerar deadlocks.
* **Algoritmo Eficiente:** A validação customizada de CPF em C# na rota `/api/perfil/salvar` respondeu em menos de 3.2 ms sob carga de 100 VUs.
* **Alta Vazão no Kestrel:** O motor de match processou **2.404 requisições/segundo** sem falhas de memória ou estouro de pool de conexões.

---

## Como Executar a Suíte

Certifique-se de que a API está rodando (`dotnet run`) na porta `5200` e execute no PowerShell:

```powershell
# 1. Teste de Segurança (Sem Token)
.\k6.exe run .\tests\k6\teste_carga.js

# 2. Teste de Carga Autenticado (Match)
.\k6.exe run .\tests\k6\teste_carga_autenticado.js

# 3. Teste de Estresse Extremo (1500 VUs)
.\k6.exe run .\tests\k6\teste_estresse.js

# 4. Teste de Inscrição e Cancelamento (Write/Delete)
.\k6.exe run .\tests\k6\teste_candidatura.js

# 5. Teste de Perfil (Validação & Update)
.\k6.exe run .\tests\k6\teste_perfil.js