using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace PerfilExato.Tests;

public class AuthApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsuario_SemTokenJWT_DeveRetornarUnauthorized401()
    {
        var response = await _client.GetAsync("/api/usuario");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Cadastro_ComDadosInvalidos_DeveRetornarBadRequest400()
    {
        var usuarioInvalido = new { Nome = "", Email = "email-invalido", Senha = "123" };
        var response = await _client.PostAsJsonAsync("/api/cadastro", usuarioInvalido);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Cadastro_ComDadosValidos_DeveRetornarSucesso()
    {
        var usuarioValido = new 
        { 
            Nome = "Dev Teste", 
            Email = $"dev.teste.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        var response = await _client.PostAsJsonAsync("/api/cadastro", usuarioValido);
        Assert.True(response.IsSuccessStatusCode, $"Falhou com status: {response.StatusCode}");
    }

    [Fact]
    public async Task SalvarPerfil_ComCpfInvalido_DeveRetornarBadRequest400()
    {
        var usuario = new 
        { 
            Nome = "Teste CPF Invalido", 
            Email = $"cpf.inv.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        await _client.PostAsJsonAsync("/api/cadastro", usuario);
        var loginResp = await _client.PostAsJsonAsync("/api/login", new { Email = usuario.Email, Senha = usuario.Senha });
        var loginData = await loginResp.Content.ReadFromJsonAsync<LoginResponse>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        var perfilCpfInvalido = new 
        {
            cpf = "111.111.111-11", // CPF com dígitos inválidos
            cep = "49000000",
            cidade = "Aracaju",
            estado = "SE",
            curso = "ti",
            formacao = "Ensino Medio Completo",
            competencias = new[] { "BackEnd", "API" },
            comportamentais = new[] { "Proatividade" }
        };

        var response = await _client.PostAsJsonAsync("/api/perfil/salvar", perfilCpfInvalido);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetMatch_ComUsuarioAutenticado_DeveRetornar200OK()
    {
        var usuario = new 
        { 
            Nome = "Dev Match", 
            Email = $"dev.match.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        var cadastroResp = await _client.PostAsJsonAsync("/api/cadastro", usuario);
        Assert.True(cadastroResp.IsSuccessStatusCode, $"Falha no cadastro: {await cadastroResp.Content.ReadAsStringAsync()}");

        var loginResponse = await _client.PostAsJsonAsync("/api/login", new 
        { 
            Email = usuario.Email, 
            Senha = usuario.Senha 
        });

        var loginData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        var perfil = new 
        {
            cpf = "52998224725",
            cep = "49000000",
            cidade = "Aracaju",
            estado = "SE",
            curso = "ti",
            formacao = "Ensino Medio Completo",
            competencias = new[] { "BackEnd", "API", "Banco de dados" },
            comportamentais = new[] { "Proatividade", "Trabalho em Equipe" }
        };

        var perfilResp = await _client.PostAsJsonAsync("/api/perfil/salvar", perfil);
        var perfilErro = await perfilResp.Content.ReadAsStringAsync();
        Assert.True(perfilResp.IsSuccessStatusCode, $"Erro na rota de Perfil ({perfilResp.StatusCode}): {perfilErro}");

        var response = await _client.GetAsync("/api/vagas/match");
        var matchErro = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode, $"Erro no Match ({response.StatusCode}): {matchErro}");
    }

    [Fact]
    public async Task GetMatch_ComPerfilEArraysDeCompetencias_DeveRetornarOK()
    {
        var usuario = new 
        { 
            Nome = "Dev Match Test", 
            Email = $"dev.match.arr.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        await _client.PostAsJsonAsync("/api/cadastro", usuario);
        var loginResp = await _client.PostAsJsonAsync("/api/login", new { Email = usuario.Email, Senha = usuario.Senha });
        var loginData = await loginResp.Content.ReadFromJsonAsync<LoginResponse>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        var perfil = new 
        {
            cpf = "52998224725",
            cep = "49000000",
            cidade = "Aracaju",
            estado = "SE",
            curso = "ti",
            formacao = "Cursando Superior",
            competencias = new[] { "FrontEnd", "BackEnd" },
            comportamentais = new[] { "Proatividade", "Comunicativo" }
        };

        var perfilResp = await _client.PostAsJsonAsync("/api/perfil/salvar", perfil);
        Assert.True(perfilResp.IsSuccessStatusCode);

        var matchResp = await _client.GetAsync("/api/vagas/match");
        Assert.Equal(HttpStatusCode.OK, matchResp.StatusCode);
    }

    [Fact]
    public async Task Candidatar_VagaDuplicada_DeveRetornarBadRequest400()
    {
        var usuario = new 
        { 
            Nome = "Candidato Duplicado", 
            Email = $"candidatura.dup.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        await _client.PostAsJsonAsync("/api/cadastro", usuario);
        var loginResp = await _client.PostAsJsonAsync("/api/login", new { Email = usuario.Email, Senha = usuario.Senha });
        var loginData = await loginResp.Content.ReadFromJsonAsync<LoginResponse>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        var vagaPayload = new { tituloVaga = "Desenvolvedor Backend", empresa = "Tech Solutions" };

        var primeiraTentativa = await _client.PostAsJsonAsync("/api/vagas/candidatar", vagaPayload);
        Assert.True(primeiraTentativa.IsSuccessStatusCode);

        var segundaTentativa = await _client.PostAsJsonAsync("/api/vagas/candidatar", vagaPayload);
        Assert.Equal(HttpStatusCode.BadRequest, segundaTentativa.StatusCode);
    }

    [Fact]
    public async Task CancelarCandidatura_Existente_DeveRetornarOK200()
    {
        var usuario = new 
        { 
            Nome = "Candidato Cancelamento", 
            Email = $"cancelar.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        await _client.PostAsJsonAsync("/api/cadastro", usuario);
        var loginResp = await _client.PostAsJsonAsync("/api/login", new { Email = usuario.Email, Senha = usuario.Senha });
        var loginData = await loginResp.Content.ReadFromJsonAsync<LoginResponse>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        var vagaPayload = new { tituloVaga = "Dev QA", empresa = "Test Corp" };
        await _client.PostAsJsonAsync("/api/vagas/candidatar", vagaPayload);

        var usuarioResp = await _client.GetAsync("/api/usuario");
        var usuarioData = await usuarioResp.Content.ReadFromJsonAsync<UsuarioResponse>();
        var inscricaoId = usuarioData?.Inscricoes?.FirstOrDefault()?.Id ?? 0;

        Assert.True(inscricaoId > 0, "A inscrição não foi encontrada para realizar o cancelamento.");

        var cancelResp = await _client.DeleteAsync($"/api/vagas/cancelar/{inscricaoId}");
        Assert.Equal(HttpStatusCode.OK, cancelResp.StatusCode);
    }

    [Fact]
    public async Task CancelarCandidatura_Inexistente_DeveRetornarNotFound404()
    {
        var usuario = new 
        { 
            Nome = "Candidato Sem Vaga", 
            Email = $"semvaga.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        await _client.PostAsJsonAsync("/api/cadastro", usuario);
        var loginResp = await _client.PostAsJsonAsync("/api/login", new { Email = usuario.Email, Senha = usuario.Senha });
        var loginData = await loginResp.Content.ReadFromJsonAsync<LoginResponse>();

        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        var response = await _client.DeleteAsync("/api/vagas/cancelar/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    [Fact]
public async Task Login_ComCredenciaisInvalidas_DeveRetornarUnauthorized()
{
    var loginInvalido = new 
    { 
        Email = "usuario.inexistente@perfilexato.com", 
        Senha = "SenhaIncorreta123!" 
    };

    var response = await _client.PostAsJsonAsync("/api/login", loginInvalido);

    // Ajustado para BadRequest
    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}
}

// 🟢 Classes auxiliares para deserialização dos DTOs nas respostas dos testes
public class LoginResponse
{
    public bool Sucesso { get; set; }
    public string Token { get; set; } = string.Empty;
}

public class UsuarioResponse
{
    public bool Sucesso { get; set; }
    public List<InscricaoItem>? Inscricoes { get; set; }
}

public class InscricaoItem
{
    public int Id { get; set; }
    public string TituloVaga { get; set; } = string.Empty;
    public string Empresa { get; set; } = string.Empty;
}