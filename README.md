Perfil Exato — SENAI
Plataforma Inteligente de Conexão entre Candidatos do SENAI e Oportunidades do Mercado de Trabalho.

O Perfil Exato é uma aplicação web desenvolvida para mapear as habilidades técnicas (hard skills) e comportamentais (soft skills) de candidatos do SENAI, comparando-as em tempo real com os requisitos de vagas do mercado através de um Motor de Match Algorítmico.

🛠️ Tecnologias Utilizadas
*Back-end
Linguagem & Framework: C# com .NET (Minimal APIs)

ORM: Entity Framework Core (EF Core)

Banco de Dados: SQL Server (Compatível com PostgreSQL / Supabase)

Autenticação: JWT (JSON Web Token)

Arquitetura: DTOs (Data Transfer Objects) & Records imutáveis

*Front-end
Interface: HTML5, CSS3, JavaScript Vanilla (ES6+)

Integrações Externas: API ViaCEP (Busca dinâmica de CEP)

Validações: Validação matemática de CPF e tratamento de erros inline em tempo real

🧠 Motor de Match de Vagas (/api/vagas/match)
O diferencial da plataforma é o seu Motor de Inteligência de Compatibilidade. Ele opera da seguinte forma:

Extração: Lê as competências técnicas e comportamentais salvas no perfil do usuário logado.

Comparação: Compara cada uma das habilidades com os requisitos cadastrados nas vagas disponíveis no banco de dados.

Cálculo de Aderência: Determina a porcentagem exata de compatibilidade entre o candidato e a vaga.

Rankeamento: Retorna as vagas ordenadas de forma decrescente (da maior compatibilidade para a menor).

🔒 Segurança e Regras de Negócio
Sessões Stateless (JWT): Apenas usuários autenticados conseguem salvar perfis, buscar vagas ou se candidatar.

Proteção Anti-IDOR: Um usuário só consegue visualizar, alterar ou cancelar dados que pertençam diretamente ao seu UsuarioId.

Trava Anti-Duplicidade: O sistema impede que um candidato envie duas inscrições para a mesma vaga da mesma empresa.

Navegação Segura no C#: Uso de null-conditional operators (?.) para evitar interrupções de serviço na API.

📌 Mapeamento dos Endpoints da API
Método	  Endpoint	                Acesso	Descrição
POST	  /api/cadastro	            Público	Cadastra um novo usuário no sistema
POST	  /api/login	            Público	Autentica o usuário e gera o Token JWT
GET	      /api/usuario	            🔒Protegido	Retorna os dados cadastrais e de perfil do usuário logado
POST	  /api/perfil/salvar	    🔒Protegido	Cria ou atualiza o perfil, endereço e habilidades do aluno
GET	      /api/vagas/match	        🔒Protegido	Executa o cálculo de aderência e lista vagas ordenadas
POST	  /api/vagas/candidatar     🔒Protegido	Registra a candidatura do aluno em uma vaga específica
DELETE	  /api/vagas/cancelar/{id}	🔒Protegido	Cancela uma inscrição previamente realizada

🗄️ Estrutura do Banco de Dados (Modelos)
[ Usuario ] 1 ─── 1 [ Perfil ]
    │
    └─── 1 ─── N [ Inscricao ]

[ Vaga ] (Catálogo geral de oportunidades)
Usuario: Dados de acesso (Nome, E-mail, Senha).
Perfil: Endereço, CPF, Formação, Curso e strings formatadas em delimitador para CompetenciasSemicolon e ComportamentaisSemicolon.
Inscricao: Histórico de candidaturas com carimbo de data/hora.
Vaga: Título, empresa, descrição e requisitos exigidos (RequisitosSemicolon).

⚙️ Como Executar o Projeto
Pré-requisitos
.NET SDK
[SQL Server] instalado localmente ou uma instância de banco na nuvem.

Passos para Instalação
1-Clone o repositório:
Bash
git clone https://github.com/seu-usuario/perfil-exato.git
cd perfil-exato

2-Configure a String de Conexão:
Ajuste o arquivo appsettings.json com os dados do seu banco de dados:
JSON
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PerfilExatoDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}

3-Execute as Migrações do Banco:
Bash
dotnet ef database update

4-Inicie a API:
Bash
dotnet run
A API estará rodando por padrão em http://localhost:5200.

🚀 Próximas Implementações
[ ] Criptografia de senhas com algoritmo Hash (BCrypt).
[ ] Implementação de painel para empresas cadastrarem novas vagas.
