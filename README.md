Perfil Exato — SENAI
Plataforma Inteligente de Conexão entre Alunos do SENAI e Oportunidades do Mercado de Trabalho.

O Perfil Exato é uma aplicação web desenvolvida para mapear as habilidades técnicas (hard skills) e comportamentais (soft skills) de alunos do SENAI, comparando-as em tempo real com os requisitos de vagas do mercado através de um Motor de Match Algorítmico.

🛠️ Tecnologias Utilizadas
Back-end
Linguagem & Framework: C# com .NET (Minimal APIs)

ORM: Entity Framework Core (EF Core)

Banco de Dados: SQL Server (Compatível com PostgreSQL / Supabase)

Autenticação: JWT (JSON Web Token)

Arquitetura: DTOs (Data Transfer Objects) & Records imutáveis

Front-end
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
