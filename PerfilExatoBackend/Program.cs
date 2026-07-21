using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
var app = builder.Build();

app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

// 💾 BANCO DE DADOS SIMULADO EM MEMÓRIA
// Guarda o E-mail (Chave) e o Hash da Senha (Valor) enquanto o servidor estiver ligado
var BancoUsuariosSimulado = new Dictionary<string, string>();

// =================================================================
// 📍 1. ROTA DE CADASTRO
// =================================================================
app.MapPost("/api/cadastro", (DadosCandidatoDTO dados) =>
{
    try
    {
        var backend = new PerfilExatoBackend.ServicoCadastroCandidato();
        backend.RegistrarCandidato(dados.email, dados.senha);

        // Verifica se o e-mail já existe na nossa memória
        if (BancoUsuariosSimulado.ContainsKey(dados.email))
            return Results.BadRequest(new { sucesso = false, mensagem = "Este e-mail já está cadastrado!" });

        // Salva o e-mail e o HASH gerado pela nossa classe de POO
        BancoUsuariosSimulado[dados.email] = backend.SenhaCriptografada;

        return Results.Ok(new { sucesso = true, mensagem = "✅ Cadastro realizado com sucesso no Backend C#!" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { sucesso = false, mensagem = ex.Message });
    }
});

// =================================================================
// 📍 2. ROTA DE LOGIN (Nova!)
// =================================================================
app.MapPost("/api/login", (DadosLoginDTO dados) =>
{
    try
    {
        // 1. O sistema tenta buscar o e-mail na memória
        if (!BancoUsuariosSimulado.ContainsKey(dados.email))
        {
            return Results.BadRequest(new { sucesso = false, mensagem = "Usuário ou senha incorretos!" });
        }

        // 2. Resgata o HASH que foi guardado no momento do cadastro (CORRIGIDO: Sem espaço no nome da variável)
        string hashGuardadoNoBanco = BancoUsuariosSimulado[dados.email];

        // 3. Pega a senha que o usuário digitou AGORA no login e joga na máquina de moer (Criptografar)
        var backend = new PerfilExatoBackend.ServicoCadastroCandidato();
        string hashGeradoAgora = backend.CriptografarSenha(dados.senha);

        // 4. A COMPARAÇÃO: Confere se a carne moída de hoje é idêntica à do cadastro (CORRIGIDO)
        if (hashGuardadoNoBanco == hashGeradoAgora)
        {
            return Results.Ok(new { sucesso = true, mensagem = "🎉 Login realizado com sucesso! Seja bem-vindo." });
        }
        else
        {
            return Results.BadRequest(new { sucesso = false, mensagem = "Usuário ou senha incorretos!" });
        }
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { sucesso = false, mensagem = ex.Message });
    }
});

app.Run("http://localhost:5200");

// DTOs (Moldes para receber os dados do Javascript)
public record DadosCandidatoDTO(string nome, string email, string senha);
public record DadosLoginDTO(string email, string senha);

// =================================================================
// 🏷️ SUA ESTRUTURA DE POO PRESERVADA
// =================================================================
namespace PerfilExatoBackend
{
    public abstract class ServicoBase
    {
        protected string NomeDoServico { get; set; }
        protected ServicoBase(string nomeServico) { NomeDoServico = nomeServico; }
        public abstract bool ValidarDados(string email, string senha);
        public virtual string CriptografarSenha(string senha) => $"[HASH_PADRAO]_{senha}";
    }

    public class ServicoCadastroCandidato : ServicoBase
    {
        private string _emailCandidato;
        private string _senhaCriptografada;

        public string EmailCandidato
        {
            get => _emailCandidato;
            set 
            {
                if (string.IsNullOrWhiteSpace(value) || !value.Contains("@") || !value.Contains("."))
                    throw new Exception("Formato de e-mail inválido detectado pelo Backend!");
                _emailCandidato = value;
            }
        }

        public string SenhaCriptografada { get => _senhaCriptografada; private set => _senhaCriptografada = value; }

        public ServicoCadastroCandidato() : base("Serviço de Cadastro") { }

        public override bool ValidarDados(string email, string senha)
        {
            if (string.IsNullOrWhiteSpace(senha) || senha.Length < 6)
                throw new Exception("A senha precisa ter no mínimo 6 caracteres!");
            return true;
        }

        public override string CriptografarSenha(string senha)
        {
            string salt = "$2a$11$KxeH783Ysk...";
            return $"[BCRYPT_SECURE_HASH]_{Math.Abs(senha.GetHashCode())}_{salt.Substring(0, 10)}";
        }

        public void RegistrarCandidato(string email, string senhaPlana)
        {
            if (ValidarDados(email, senhaPlana))
            {
                this.EmailCandidato = email; 
                this.SenhaCriptografada = CriptografarSenha(senhaPlana); 
            }
        }
    }
}