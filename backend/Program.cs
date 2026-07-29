using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// 🔌 CONEXÃO COM O SQL SERVER VIA EF CORE
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConexaoSQL")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("PermitirTudo");

// 🔑 Sessoes ativas mantidas em memória temporária para controle de Token
Dictionary<string, string> SessoesAtivas = new Dictionary<string, string>();

// 📍 ROTA 1: CADASTRO (Salva no SQL Server com validação de senha)
app.MapPost("/api/cadastro", async (DadosCadastroDTO dados, AppDbContext context) =>
{
    // 🔐 VALIDAÇÃO: Senha deve ter pelo menos 6 caracteres
    if (string.IsNullOrWhiteSpace(dados.senha) || dados.senha.Length < 6)
    {
        Console.WriteLine("⚠️ Validação falhou: Senha deve ter pelo menos 6 caracteres.");
        return Results.BadRequest(new { sucesso = false, mensagem = "A senha deve ter pelo menos 6 caracteres!" });
    }

    var usuarioExiste = await context.Usuarios.AnyAsync(u => u.Email == dados.email);
    if (usuarioExiste)
        return Results.BadRequest(new { sucesso = false, mensagem = "Este e-mail já está cadastrado!" });

    var novoUsuario = new Usuario { Nome = dados.nome, Email = dados.email, Senha = dados.senha };
    context.Usuarios.Add(novoUsuario);
    await context.SaveChangesAsync();

    return Results.Ok(new { sucesso = true, mensagem = "Conta criada com sucesso!" });
});

// 📍 ROTA 2: LOGIN (Valida no SQL Server)
app.MapPost("/api/login", async (DadosLoginDTO dados, AppDbContext context) =>
{
    var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == dados.email && u.Senha == dados.senha);
    if (usuario != null)
    {
        string tokenGerado = Guid.NewGuid().ToString();
        SessoesAtivas[tokenGerado] = dados.email; 

        return Results.Ok(new { sucesso = true, mensagem = "Login realizado com sucesso!", token = tokenGerado });
    }
    return Results.BadRequest(new { sucesso = false, mensagem = "E-mail ou senha incorretos." });
});

// 📍 ROTA 3: BUSCAR DADOS (Monta o JSON igual ao que o JavaScript espera)
app.MapGet("/api/usuario", async (string token, AppDbContext context) =>
{
    if (string.IsNullOrEmpty(token) || !SessoesAtivas.ContainsKey(token))
        return Results.BadRequest(new { sucesso = false, message = "Sessão inválida." });

    string emailLogado = SessoesAtivas[token];
    
    var usuario = await context.Usuarios
        .Include(u => u.Perfil)
        .Include(u => u.Inscricoes)
        .FirstOrDefaultAsync(u => u.Email == emailLogado);

    if (usuario == null) return Results.BadRequest(new { sucesso = false, message = "Usuário não encontrado." });

    object? perfilDdto = null;
    if (usuario.Perfil != null)
    {
        perfilDdto = new {
            cpf = usuario.Perfil.Cpf,
            cep = usuario.Perfil.Cep,
            cidade = usuario.Perfil.Cidade,
            estado = usuario.Perfil.Estado,
            curso = usuario.Perfil.Curso,
            formacao = usuario.Perfil.Formacao,
            competencias = string.IsNullOrEmpty(usuario.Perfil.CompetenciasSemicolon) ? Array.Empty<string>() : usuario.Perfil.CompetenciasSemicolon.Split(';'),
            comportamentais = string.IsNullOrEmpty(usuario.Perfil.ComportamentaisSemicolon) ? Array.Empty<string>() : usuario.Perfil.ComportamentaisSemicolon.Split(';')
        };
    }

    return Results.Ok(new { 
        sucesso = true, 
        nome = usuario.Nome, 
        email = emailLogado,
        perfil = perfilDdto,
        inscricoes = usuario.Inscricoes.Select(i => new { tituloVaga = i.TituloVaga, empresa = i.Empresa, dataHora = i.DataHora })
    });
});

// 📍 ROTA 4: SALVAR/ATUALIZAR PERFIL (Insert ou Update automático no SQL)
app.MapPost("/api/perfil/salvar", async (DadosPerfilDTO dados, AppDbContext context) =>
{
    if (string.IsNullOrEmpty(dados.token) || !SessoesAtivas.ContainsKey(dados.token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida!" });

    string emailDono = SessoesAtivas[dados.token];
    var usuario = await context.Usuarios.Include(u => u.Perfil).FirstOrDefaultAsync(u => u.Email == emailDono);
    
    if (usuario == null) return Results.BadRequest(new { sucesso = false, mensagem = "Usuário não encontrado." });

    string comps = dados.competencias != null ? string.Join(";", dados.competencias) : "";
    string softs = dados.comportamentais != null ? string.Join(";", dados.comportamentais) : "";

    if (usuario.Perfil == null)
    {
        usuario.Perfil = new Perfil {
            Cpf = dados.cpf, Cep = dados.cep, Cidade = dados.cidade, Estado = dados.estado,
            Curso = dados.curso, Formacao = dados.formacao, CompetenciasSemicolon = comps, ComportamentaisSemicolon = softs
        };
    }
    else
    {
        usuario.Perfil.Cpf = dados.cpf; usuario.Perfil.Cep = dados.cep;
        usuario.Perfil.Cidade = dados.cidade; usuario.Perfil.Estado = dados.estado;
        usuario.Perfil.Curso = dados.curso; usuario.Perfil.Formacao = dados.formacao;
        usuario.Perfil.CompetenciasSemicolon = comps; usuario.Perfil.ComportamentaisSemicolon = softs;
    }

    await context.SaveChangesAsync();
    return Results.Ok(new { sucesso = true, mensagem = "Perfil salvo com sucesso no SQL Server!" });
});

// 📍 ROTA 5: INSCREVER EM VAGA (Histórico persistente no SQL)
app.MapPost("/api/vagas/candidatar", async (NovaCandidaturaDTO dados, AppDbContext context) =>
{
    if (string.IsNullOrEmpty(dados.token) || !SessoesAtivas.ContainsKey(dados.token))
        return Results.BadRequest(new { sucesso = false, mensagem = "Sessão inválida." });

    string email = SessoesAtivas[dados.token];
    var usuario = await context.Usuarios.Include(u => u.Inscricoes).FirstOrDefaultAsync(u => u.Email == email);

    if (usuario == null) return Results.BadRequest(new { sucesso = false, mensagem = "Usuário não encontrado." });

    if (usuario.Inscricoes.Any(i => i.TituloVaga == dados.tituloVaga && i.Empresa == dados.empresa))
        return Results.BadRequest(new { sucesso = false, mensagem = "Você já se candidatou a esta vaga!" });

    string dataHoraRegistro = DateTime.Now.ToString("dd/MM/yyyy 'às' HH:mm");
    
    var novaInscricao = new Inscricao {
        TituloVaga = dados.tituloVaga,
        Empresa = dados.empresa,
        DataHora = dataHoraRegistro,
        UsuarioId = usuario.Id
    };

    context.Inscricoes.Add(novaInscricao);
    await context.SaveChangesAsync();

    return Results.Ok(new { sucesso = true, message = "Inscrição realizada com sucesso!", mensagem = "Inscrição gravada no SQL Server!" });
});

app.Run("http://localhost:5200");

// =================================================================
// 🗄️ MODELOS DE MAPEAMENTO DO BANCO DE DADOS (TABELAS)
// =================================================================
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Perfil> Perfis { get; set; }
    public DbSet<Inscricao> Inscricoes { get; set; }
}

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public Perfil? Perfil { get; set; }
    public List<Inscricao> Inscricoes { get; set; } = new List<Inscricao>();
}

public class Perfil
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Cpf { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string Cidade { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string Curso { get; set; } = string.Empty;
    public string Formacao { get; set; } = string.Empty;
    public string CompetenciasSemicolon { get; set; } = string.Empty; 
    public string ComportamentaisSemicolon { get; set; } = string.Empty;
}

public class Inscricao
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string TituloVaga { get; set; } = string.Empty;
    public string Empresa { get; set; } = string.Empty;
    public string DataHora { get; set; } = string.Empty;
}

public record DadosCadastroDTO(string nome, string email, string senha);
public record DadosLoginDTO(string email, string senha);
public record NovaCandidaturaDTO(string token, string tituloVaga, string empresa);
public record DadosPerfilDTO(string token, string cpf, string cep, string cidade, string estado, string curso, string formacao, string[] competencias, string[] comportamentais);