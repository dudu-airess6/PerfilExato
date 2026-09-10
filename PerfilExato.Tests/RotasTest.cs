using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using Perfilexato;

namespace Perfilexato.Tests;

public class RotasTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public RotasTest(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData("/api/usuario", "GET")]
    [InlineData("/api/perfil/salvar", "POST")]
    [InlineData("/api/vagas/candidatar", "POST")]
    [InlineData("/api/vagas/match", "GET")]
    [InlineData("/api/vagas/cancelar/1", "DELETE")]
    public async Task RotaProtegida_AcessoSemToken_DeveRetornarUnauthorized(string url, string metodo)
    {
        // Arrange
        var request = new HttpRequestMessage(new HttpMethod(metodo), url);

        // Act - Tenta acessar sem enviar o Bearer Token
        var response = await _client.SendAsync(request);

        // Assert - Deve bloquear o acesso não autenticado
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}