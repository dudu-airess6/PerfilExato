using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Configuração do CORS para integração perfeita com o Frontend
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
// 💾 BANCO DE DADOS SIMULADO (Memória RAM)
// =================================================================
var BancoUsuariosSimulado = new Dictionary<string, UsuarioSimulado>();
var SessoesAtivas = new Dictionary<string, string>(); 

// =================================================================
// 📍 ROTA 1: CADASTRO
// =================================================================
app.MapPost("/api/cadastro", (DadosCadastroDTO dados) =>
{
    if (BancoUsuariosSimulado.ContainsKey(dados.email))
        return Results.BadRequest(new { sucesso = false, mensagem = "Este e-mail já está cadastrado!" });

    var novoUsuario = new UsuarioSimulado(dados.nome, dados.senha);
    BancoUsuariosSimulado.Add(dados.email, novoUsuario);

    return Results.Ok(new { sucesso = true, mensagem = "Conta criada com sucesso!" });
});

// =================================================================
// 📍 ROTA 2: LOGIN (Geração de Token)
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
// 📍 ROTA 3: BUSCAR DADOS DO USUÁRIO + PERFIL (Atualizada!)
// =================================================================
app.MapGet("/api/usuario", (string token) =>
{
    if (string.IsNullOrEmpty(token) || !SessoesAtivas.ContainsKey(token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida ou expirada." });

    string emailLogado = SessoesAtivas[token];
    var usuario = BancoUsuariosSimulado[emailLogado];

    return Results.Ok(new { 
        sucesso = true, 
        nome = usuario.Nome, 
        email = emailLogado,
        perfil = usuario.Perfil // Envia o formulário preenchido (se houver)
    });
});

// =================================================================
// 📍 ROTA 4: SALVAR PERFIL
// =================================================================
app.MapPost("/api/perfil/salvar", (DadosPerfilDTO dados) =>
{
    if (string.IsNullOrEmpty(dados.token) || !SessoesAtivas.ContainsKey(dados.token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida! Faça login novamente." });

    var validador = new PerfilExatoBackend.ServicoValidacaoDocumento();
    if (!validador.ValidarCPF(dados.cpf))
        return Results.BadRequest(new { sucesso = false, mensagem = "CPF inválido detectado pelo servidor!" });

    string emailDono = SessoesAtivas[dados.token];
    UsuarioSimulado usuario = BancoUsuariosSimulado[emailDono];
    
    usuario.Perfil = dados; // Salva o formulário na conta do usuário

    return Results.Ok(new { sucesso = true, mensagem = "Perfil analisado e salvo com segurança no Backend!" });
});

// Força o servidor a rodar sempre na porta correta
app.Run("http://localhost:5200");

// =================================================================
// 🏷️ ESTRUTURAS DE DADOS (DTOs e Modelos)
// =================================================================
public record DadosCadastroDTO(string nome, string email, string senha);
public record DadosLoginDTO(string email, string senha);
public record DadosPerfilDTO(string token, string cpf, string cep, string cidade, string estado, string curso, string formacao, string[] competencias, string[] comportamentais);

public class UsuarioSimulado
{
    public string Nome { get; set; }
    public string HashSenha { get; set; }
    public DadosPerfilDTO? Perfil { get; set; } // '?' Resolve o warning de nulo

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
        public bool ValidarCPF(string cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf)) return false;
            cpf = new string(cpf.Where(char.IsDigit).ToArray());
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