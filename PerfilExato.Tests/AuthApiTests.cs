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
        // 1. Setup de usuário autenticado
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

        // 2. Envia perfil com CPF incorreto
        var perfilCpfInvalido = new 
        {
            cpf = "111.111.111-11", // CPF com dígitos inválidos
            cep = "49000000",
            cidade = "Aracaju",
            estado = "SE",
            curso = "Sistemas",
            formacao = "Superior",
            competencias = new[] { "C#" },
            comportamentais = new[] { "Foco" }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/perfil/salvar", perfilCpfInvalido);

        // Assert: Deve barrar no backend com 400 Bad Request
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetMatch_ComUsuarioAutenticado_DeveRetornar200OK()
    {
        // 1. Cadastra usuário novo
        var usuario = new 
        { 
            Nome = "Dev Match", 
            Email = $"dev.match.{Guid.NewGuid()}@perfilexato.com", 
            Senha = "SenhaForte123!" 
        };

        var cadastroResp = await _client.PostAsJsonAsync("/api/cadastro", usuario);
        Assert.True(cadastroResp.IsSuccessStatusCode, $"Falha no cadastro: {await cadastroResp.Content.ReadAsStringAsync()}");

        // 2. Faz login para obter o JWT
        var loginResponse = await _client.PostAsJsonAsync("/api/login", new 
        { 
            Email = usuario.Email, 
            Senha = usuario.Senha 
        });

        var loginData = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();

        // 3. Define o token JWT no cabeçalho
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData?.Token);

        // 4. Salva o perfil do candidato com CPF válido
        var perfil = new 
        {
            cpf = "52998224725", // CPF válido para passar na validação
            cep = "49000000",
            cidade = "Aracaju",
            estado = "SE",
            formacao = "Ensino Superior",
            curso = "Tecnologia da Informação",
            competencias = new[] { "C#", ".NET", "SQL" },
            comportamentais = new[] { "Proatividade", "Comunicação" }
        };

        var perfilResp = await _client.PostAsJsonAsync("/api/perfil/salvar", perfil);
        var perfilErro = await perfilResp.Content.ReadAsStringAsync();
        Assert.True(perfilResp.IsSuccessStatusCode, $"Erro na rota de Perfil ({perfilResp.StatusCode}): {perfilErro}");

        // 5. Act: Chama o motor de match
        var response = await _client.GetAsync("/api/vagas/match");
        var matchErro = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.True(response.IsSuccessStatusCode, $"Erro no Match ({response.StatusCode}): {matchErro}");
    }

    [Fact]
    public async Task Candidatar_VagaDuplicada_DeveRetornarBadRequest400()
    {
        // 1. Setup de usuário e autenticação
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

        // 2. Primeira candidatura (deve ter sucesso)
        var primeiraTentativa = await _client.PostAsJsonAsync("/api/vagas/candidatar", vagaPayload);
        Assert.True(primeiraTentativa.IsSuccessStatusCode);

        // 3. Segunda candidatura para a mesma vaga (deve ser bloqueada)
        var segundaTentativa = await _client.PostAsJsonAsync("/api/vagas/candidatar", vagaPayload);
        Assert.Equal(HttpStatusCode.BadRequest, segundaTentativa.StatusCode);
    }

    [Fact]
    public async Task GetMatch_ComPerfilEArraysDeCompetencias_DeveRetornarOK()
    {
        // 1. Setup de usuário
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

        // 2. Salva perfil usando CPF válido
        var perfil = new 
        {
            cpf = "52998224725",
            cep = "49000000",
            cidade = "Aracaju",
            estado = "SE",
            curso = "Análise e Desenvolvimento de Sistemas",
            formacao = "Superior Cursando",
            competencias = new[] { "C#", ".NET", "SQL Server" },
            comportamentais = new[] { "Trabalho em Equipe", "Proatividade" }
        };

        var perfilResp = await _client.PostAsJsonAsync("/api/perfil/salvar", perfil);
        Assert.True(perfilResp.IsSuccessStatusCode);

        // 3. Executa a busca de vagas compatíveis
        var matchResp = await _client.GetAsync("/api/vagas/match");
        Assert.Equal(HttpStatusCode.OK, matchResp.StatusCode);
    }
    [Fact]
public async Task CancelarCandidatura_Existente_DeveRetornarOK200()
{
    // 1. Cadastra e autentica usuário
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

    // 2. Realiza a candidatura
    var vagaPayload = new { tituloVaga = "Dev QA", empresa = "Test Corp" };
    await _client.PostAsJsonAsync("/api/vagas/candidatar", vagaPayload);

    // 3. Obtém o ID da inscrição criada através da Rota 3 (/api/usuario)
    var usuarioResp = await _client.GetAsync("/api/usuario");
    var usuarioData = await usuarioResp.Content.ReadFromJsonAsync<UsuarioResponse>();
    var inscricaoId = usuarioData?.Inscricoes?.FirstOrDefault()?.Id ?? 0;

    Assert.True(inscricaoId > 0, "A inscrição não foi encontrada para realizar o cancelamento.");

    // 4. Act: Envia a requisição DELETE para cancelar
    var cancelResp = await _client.DeleteAsync($"/api/vagas/cancelar/{inscricaoId}");

    // Assert
    Assert.Equal(HttpStatusCode.OK, cancelResp.StatusCode);
}

[Fact]
public async Task CancelarCandidatura_Inexistente_DeveRetornarNotFound404()
{
    // 1. Cadastra e autentica usuário
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

    // 2. Act: Tenta cancelar uma candidatura inexistente (ID 999999)
    var response = await _client.DeleteAsync("/api/vagas/cancelar/999999");

    // Assert: Deve retornar 404 Not Found
    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
}

// 🟢 Classes auxiliares para deserialização dos testes de cancelamento
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

    // 🟢 Classe auxiliar para deserializar a resposta do Login
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
    }
}