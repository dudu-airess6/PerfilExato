using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Configuração do CORS para permitir que o Front-End conecte sem erros
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("PermitirTudo");

// =================================================================
// SIMULADOR DE BANCO DE DADOS (Na memória RAM do servidor)
// =================================================================
var BancoUsuariosSimulado = new Dictionary<string, UsuarioSimulado>();
var SessoesAtivas = new Dictionary<string, string>(); // Guarda qual Token pertence a qual Email

// =================================================================
// 📍 1. ROTA DE CADASTRO
// =================================================================
app.MapPost("/api/cadastro", (DadosCadastroDTO dados) =>
{
    if (BancoUsuariosSimulado.ContainsKey(dados.email))
    {
        return Results.BadRequest(new { sucesso = false, mensagem = "Este e-mail já está cadastrado!" });
    }

    var novoUsuario = new UsuarioSimulado(dados.nome, dados.senha);
    BancoUsuariosSimulado.Add(dados.email, novoUsuario);

    return Results.Ok(new { sucesso = true, mensagem = "Conta criada com sucesso!" });
});

// =================================================================
// 📍 2. ROTA DE LOGIN
// =================================================================
app.MapPost("/api/login", (DadosLoginDTO dados) =>
{
    if (BancoUsuariosSimulado.ContainsKey(dados.email))
    {
        var usuario = BancoUsuariosSimulado[dados.email];

        if (usuario.HashSenha == dados.senha) 
        {
            string tokenGerado = Guid.NewGuid().ToString();
            SessoesAtivas[tokenGerado] = dados.email; 

            return Results.Ok(new { 
                sucesso = true, 
                mensagem = "Login realizado com sucesso!",
                token = tokenGerado 
            });
        }
    }

    return Results.BadRequest(new { sucesso = false, mensagem = "E-mail ou senha incorretos." });
});

// =================================================================
// 📍 3. ROTA PARA BUSCAR DADOS DO USUÁRIO LOGADO
// =================================================================
app.MapGet("/api/usuario", (string token) =>
{
    if (SessoesAtivas.ContainsKey(token))
    {
        string emailLogado = SessoesAtivas[token];
        var usuario = BancoUsuariosSimulado[emailLogado];

        return Results.Ok(new { sucesso = true, nome = usuario.Nome, email = emailLogado });
    }

    return Results.BadRequest(new { sucesso = false, mensagem = "Token inválido ou expirado." });
});

// =================================================================
// 📍 4. ROTA DE SALVAR PERFIL (Formulário Avançado)
// =================================================================
app.MapPost("/api/perfil/salvar", (DadosPerfilDTO dados) =>
{
    // 1. Verifica se o usuário está logado usando o Token
    if (string.IsNullOrEmpty(dados.token) || !SessoesAtivas.ContainsKey(dados.token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida! Faça login novamente." });

    // 2. Validação do CPF no Backend (Segurança Caixa Branca)
    var validador = new PerfilExatoBackend.ServicoValidacaoDocumento();
    if (!validador.ValidarCPF(dados.cpf))
        return Results.BadRequest(new { sucesso = false, mensagem = "CPF inválido detectado pelo servidor!" });

    // 3. Salva os dados no perfil do usuário
    string emailDono = SessoesAtivas[dados.token];
    UsuarioSimulado usuario = BancoUsuariosSimulado[emailDono];
    
    usuario.Perfil = dados; // Grava o formulário na memória do C# associado ao usuário

    return Results.Ok(new { sucesso = true, mensagem = "Perfil analisado e salvo com segurança no Backend!" });
});

app.Run("http://localhost:5200");


// =================================================================
// CLASSES E ESTRUTURAS DE DADOS (DTOs)
// =================================================================
public record DadosCadastroDTO(string nome, string email, string senha);
public record DadosLoginDTO(string email, string senha);
public record DadosPerfilDTO(string token, string cpf, string cep, string cidade, string estado, string curso, string formacao, string[] competencias, string[] comportamentais);

public class UsuarioSimulado
{
    public string Nome { get; set; }
    public string HashSenha { get; set; }
    public DadosPerfilDTO? Perfil { get; set; } // Guarda o formulário preenchido

    public UsuarioSimulado(string nome, string hashSenha)
    {
        Nome = nome;
        HashSenha = hashSenha;
    }
}

namespace PerfilExatoBackend
{
    public class ServicoValidacaoDocumento
    {
        // Regra de Negócio Pura: Validação de CPF migrada para o C#
        public bool ValidarCPF(string cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf)) return false;
            
            cpf = new string(cpf.Where(char.IsDigit).ToArray()); // Remove pontos e traços
            
            if (cpf.Length != 11 || new string(cpf[0], 11) == cpf) return false;

            int[] multiplicador1 = new int[9] { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
            int[] multiplicador2 = new int[10] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

            string tempCpf = cpf.Substring(0, 9);
            int soma = 0;

            for (int i = 0; i < 9; i++) soma += int.Parse(tempCpf[i].ToString()) * multiplicador1[i];
            int resto = (soma * 10) % 11;
            if (resto == 10 || resto == 11) resto = 0;
            if (resto != int.Parse(cpf[9].ToString())) return false;

            soma = 0;
            tempCpf += resto.ToString();
            for (int i = 0; i < 10; i++) soma += int.Parse(tempCpf[i].ToString()) * multiplicador2[i];
            resto = (soma * 10) % 11;
            if (resto == 10 || resto == 11) resto = 0;

            return resto == int.Parse(cpf[10].ToString());
        }
    }
}