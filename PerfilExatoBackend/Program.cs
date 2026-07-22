using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("PermitirTudo");

// =================================================================
// 💾 BANCO DE DADOS SIMULADO (Memória RAM)
// =================================================================
var BancoUsuariosSimulado = new Dictionary<string, UsuarioSimulado>();
var SessoesAtivas = new Dictionary<string, string>(); 

// 📍 ROTA 1: CADASTRO
app.MapPost("/api/cadastro", (DadosCadastroDTO dados) =>
{
    if (BancoUsuariosSimulado.ContainsKey(dados.email))
        return Results.BadRequest(new { sucesso = false, mensagem = "Este e-mail já está cadastrado!" });

    var novoUsuario = new UsuarioSimulado(dados.nome, dados.senha);
    BancoUsuariosSimulado.Add(dados.email, novoUsuario);

    return Results.Ok(new { sucesso = true, mensagem = "Conta criada com sucesso!" });
});

// 📍 ROTA 2: LOGIN
app.MapPost("/api/login", (DadosLoginDTO dados) =>
{
    if (BancoUsuariosSimulado.ContainsKey(dados.email))
    {
        var usuario = BancoUsuariosSimulado[dados.email];
        if (usuario.HashSenha == dados.senha) 
        {
            string tokenGerado = Guid.NewGuid().ToString();
            SessoesAtivas[tokenGerado] = dados.email; 

            return Results.Ok(new { sucesso = true, mensagem = "Login realizado com sucesso!", token = tokenGerado });
        }
    }
    return Results.BadRequest(new { sucesso = false, mensagem = "E-mail ou senha incorretos." });
});

// 📍 ROTA 3: BUSCAR DADOS DO USUÁRIO + PERFIL + INSCRIÇÕES
app.MapGet("/api/usuario", (string token) =>
{
    if (string.IsNullOrEmpty(token) || !SessoesAtivas.ContainsKey(token))
        return Results.BadRequest(new { sucesso = false, message = "Sessão inválida." });

    string emailLogado = SessoesAtivas[token];
    var usuario = BancoUsuariosSimulado[emailLogado];

    return Results.Ok(new { 
        sucesso = true, 
        nome = usuario.Nome, 
        email = emailLogado,
        perfil = usuario.Perfil,
        inscricoes = usuario.Inscricoes // Retorna o histórico de vagas
    });
});

// 📍 ROTA 4: SALVAR/ATUALIZAR PERFIL (Persistência garantida)
app.MapPost("/api/perfil/salvar", (DadosPerfilDTO dados) =>
{
    if (string.IsNullOrEmpty(dados.token) || !SessoesAtivas.ContainsKey(dados.token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida!" });

    var validador = new PerfilExatoBackend.ServicoValidacaoDocumento();
    if (!validador.ValidarCPF(dados.cpf))
        return Results.BadRequest(new { sucesso = false, mensagem = "CPF inválido!" });

    string emailDono = SessoesAtivas[dados.token];
    UsuarioSimulado usuario = BancoUsuariosSimulado[emailDono];
    
    usuario.Perfil = dados; 
    return Results.Ok(new { sucesso = true, mensagem = "Perfil salvo com sucesso no servidor!" });
});

// 📍 ROTA 5: REGISTRAR NOVA INSCRIÇÃO EM VAGA
app.MapPost("/api/vagas/candidatar", (NovaCandidaturaDTO dados) =>
{
    if (string.IsNullOrEmpty(dados.token) || !SessoesAtivas.ContainsKey(dados.token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida." });

    string email = SessoesAtivas[dados.token];
    var usuario = BancoUsuariosSimulado[email];

    // Evita duplicidade de inscrição na mesma vaga
    if (usuario.Inscricoes.Any(i => i.tituloVaga == dados.tituloVaga && i.empresa == dados.empresa))
        return Results.BadRequest(new { sucesso = false, mensagem = "Você já se candidatou a esta vaga!" });

    // Registra a inscrição com o carimbo de Data e Hora atual do servidor
    string dataHoraRegistro = DateTime.Now.ToString("dd/MM/yyyy às HH:mm");
    var novaInscricao = new DadosInscricaoDTO(dados.tituloVaga, dados.empresa, dataHoraRegistro);
    usuario.Inscricoes.Add(novaInscricao);

    return Results.Ok(new { sucesso = true, mensagem = "Inscrição realizada com sucesso através do PerfilExato!" });
});

app.Run("http://localhost:5200");

// =================================================================
// 🏷️ DTOs E MODELOS DE DADOS ATUALIZADOS
// =================================================================
public record DadosCadastroDTO(string nome, string email, string senha);
public record DadosLoginDTO(string email, string senha);
public record NovaCandidaturaDTO(string token, string tituloVaga, string empresa);
public record DadosInscricaoDTO(string tituloVaga, string empresa, string dataHora);
public record DadosPerfilDTO(string token, string cpf, string cep, string cidade, string estado, string curso, string formacao, string[] competencias, string[] comportamentais);

public class UsuarioSimulado
{
    public string Nome { get; set; }
    public string HashSenha { get; set; }
    public DadosPerfilDTO? Perfil { get; set; } 
    public List<DadosInscricaoDTO> Inscricoes { get; set; } = new List<DadosInscricaoDTO>(); // Histórico das vagas

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
            int[] m1 = new int[9] { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
            int[] m2 = new int[10] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };
            string temp = cpf.Substring(0, 9);
            int soma = 0;
            for (int i = 0; i < 9; i++) soma += int.Parse(temp[i].ToString()) * m1[i];
            int resto = (soma * 10) % 11;
            if (resto == 10 || resto == 11) resto = 0;
            if (resto != int.Parse(cpf[9].ToString())) return false;
            soma = 0; temp += resto.ToString();
            for (int i = 0; i < 10; i++) soma += int.Parse(temp[i].ToString()) * m2[i];
            resto = (soma * 10) % 11;
            if (resto == 10 || resto == 11) resto = 0;
            return resto == int.Parse(cpf[10].ToString());
        }
    }
}