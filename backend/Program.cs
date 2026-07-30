using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;

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

// 🔐 CONFIGURAÇÃO DO JWT
var chaveSecreta = Encoding.ASCII.GetBytes("ChaveSuperSecretaDoProjetoRecrutamento2024!");

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = "Bearer";
    options.DefaultChallengeScheme = "Bearer";
})
.AddJwtBearer(options => {
    options.RequireHttpsMetadata = false; 
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(chaveSecreta),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("PermitirTudo");

// ATIVA a barreira de segurança na sua API
app.UseAuthentication(); 
app.UseAuthorization();


// 📍 ROTA 1: CADASTRO (Salva no SQL Server com validação de senha)
app.MapPost("/api/cadastro", async (DadosCadastroDTO dados, AppDbContext context) =>
{
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

// 📍 ROTA 2: LOGIN (Gera o Token JWT)
app.MapPost("/api/login", async (DadosLoginDTO dados, AppDbContext context) =>
{
    var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == dados.email && u.Senha == dados.senha);
    if (usuario != null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Email, usuario.Email) }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(chaveSecreta), SecurityAlgorithms.HmacSha256Signature)
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        string tokenGerado = tokenHandler.WriteToken(token);

        return Results.Ok(new { sucesso = true, mensagem = "Login realizado com sucesso!", token = tokenGerado });
    }
    return Results.BadRequest(new { sucesso = false, mensagem = "E-mail ou senha incorretos." });
});

// 📍 ROTA 3: BUSCAR DADOS (Protegida pelo JWT - Atualizada com ID de inscrição)
app.MapGet("/api/usuario", [Authorize] async (ClaimsPrincipal user, AppDbContext context) =>
{
    string? emailLogado = user.FindFirst(ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(emailLogado)) return Results.Unauthorized();
    
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
        // 👇 Inclusão do "id = i.Id" para o botão do frontend funcionar corretamente
        inscricoes = usuario.Inscricoes.Select(i => new { id = i.Id, tituloVaga = i.TituloVaga, empresa = i.Empresa, dataHora = i.DataHora })
    });
});

// 📍 ROTA 4: SALVAR/ATUALIZAR PERFIL (Protegida pelo JWT)
app.MapPost("/api/perfil/salvar", [Authorize] async (DadosPerfilDTO dados, ClaimsPrincipal user, AppDbContext context) =>
{
    string? emailDono = user.FindFirst(ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(emailDono)) return Results.Unauthorized();

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

// 📍 ROTA 5: INSCREVER EM VAGA (Protegida pelo JWT com Trava Anti-Duplicidade 🛡️)
app.MapPost("/api/vagas/candidatar", [Authorize] async (NovaCandidaturaDTO dados, ClaimsPrincipal user, AppDbContext context) =>
{
    string? email = user.FindFirst(ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

    var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
    if (usuario == null) return Results.BadRequest(new { sucesso = false, mensagem = "Usuário não encontrado." });

    var jaEstaInscrito = await context.Inscricoes.AnyAsync(i => 
        i.UsuarioId == usuario.Id && 
        i.TituloVaga == dados.tituloVaga && 
        i.Empresa == dados.empresa);

    if (jaEstaInscrito)
    {
        return Results.BadRequest(new { sucesso = false, mensagem = "Você já enviou uma candidatura para esta vaga!" });
    }

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

// 📍 ROTA 6: MOTOR DE MATCH DE VAGAS 🚀 (Nova rota protegida)
app.MapGet("/api/vagas/match", [Authorize] async (ClaimsPrincipal user, AppDbContext context) =>
{
    string? emailLogado = user.FindFirst(ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(emailLogado)) return Results.Unauthorized();

    var usuario = await context.Usuarios.Include(u => u.Perfil).FirstOrDefaultAsync(u => u.Email == emailLogado);
    if (usuario == null || usuario.Perfil == null) 
        return Results.BadRequest(new { sucesso = false, mensagem = "Perfil não preenchido ou não encontrado." });

    var skillsUsuario = new List<string>();
    if (!string.IsNullOrEmpty(usuario.Perfil.CompetenciasSemicolon))
        skillsUsuario.AddRange(usuario.Perfil.CompetenciasSemicolon.Split(';'));
    if (!string.IsNullOrEmpty(usuario.Perfil.ComportamentaisSemicolon))
        skillsUsuario.AddRange(usuario.Perfil.ComportamentaisSemicolon.Split(';'));

    var todasAsVagas = await context.Vagas.ToListAsync();
    
    var resultadoMatch = todasAsVagas.Select(vaga =>
    {
        var requisitosVaga = string.IsNullOrEmpty(vaga.RequisitosSemicolon) 
            ? Array.Empty<string>() 
            : vaga.RequisitosSemicolon.Split(';');

        int totalRequisitos = requisitosVaga.Length;
        int correspondencias = 0;
        
        if (totalRequisitos > 0)
        {
            correspondencias = requisitosVaga.Count(req => 
                skillsUsuario.Any(s => s.Equals(req, StringComparison.OrdinalIgnoreCase)));
        }

        double percentual = totalRequisitos == 0 ? 0 : ((double)correspondencias / totalRequisitos) * 100;
        int percentualFinal = (int)Math.Round(percentual);

        return new
        {
            id = vaga.Id,
            titulo = vaga.Titulo,
            empresa = vaga.Empresa,
            descricao = vaga.Descricao,
            requisitos = requisitosVaga,
            porcentagemMatch = percentualFinal
        };
    })
    .OrderByDescending(v => v.porcentagemMatch)
    .ToList();

    return Results.Ok(new { sucesso = true, vagas = resultadoMatch });
});

// 📍 ROTA 7: CANCELAR INSCRIÇÃO 🗑️ (Protegida pelo JWT)
app.MapDelete("/api/vagas/cancelar/{id}", [Authorize] async (int id, ClaimsPrincipal user, AppDbContext context) =>
{
    string? email = user.FindFirst(ClaimTypes.Email)?.Value;
    if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

    var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
    if (usuario == null) return Results.BadRequest(new { sucesso = false, mensagem = "Usuário não encontrado." });

    // Busca a inscrição validando se ela de fato pertence ao usuário autenticado
    var inscricao = await context.Inscricoes.FirstOrDefaultAsync(i => i.Id == id && i.UsuarioId == usuario.Id);
    
    if (inscricao == null) 
        return Results.NotFound(new { sucesso = false, mensagem = "Candidatura não encontrada ou não pertence ao seu perfil." });

    context.Inscricoes.Remove(inscricao);
    await context.SaveChangesAsync();

    return Results.Ok(new { sucesso = true, mensagem = "Candidatura cancelada com sucesso!" });
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
    public DbSet<Vaga> Vagas { get; set; }
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

public class Vaga
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Empresa { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string RequisitosSemicolon { get; set; } = string.Empty; 
}

public record DadosCadastroDTO(string nome, string email, string senha);
public record DadosLoginDTO(string email, string senha);
public record NovaCandidaturaDTO(string tituloVaga, string empresa);
public record DadosPerfilDTO(string cpf, string cep, string city, string cidade, string estado, string curso, string formacao, string[] competencias, string[] comportamentais);