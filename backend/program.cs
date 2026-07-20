using System;
//Validação e Tratamento de Dados (Foco no E-mail)
//Criptografia de Senhas (Segurança no Cadastro)
namespace PerfilExatoBackend
{
    // =================================================================
    // 🏷️ 1. CLASSE ABSTRATA
    // Define o molde de comportamento para qualquer serviço do sistema.
    // =================================================================
    public abstract class ServicoBase
    {
        // 🏷️ ATRIBUTO / PROPRIEDADE PROTEGIDA (Parte do Encapsulamento)
        protected string NomeDoServico { get; set; }

        // Construtor da classe abstrata
        protected ServicoBase(string nomeServico)
        {
            NomeDoServico = nomeServico;
        }

        // 🏷️ MÉTODO ABSTRATO (Força as classes filhas a criarem sua validação)
        public abstract bool ValidarDados(string email, string senha);

        // 🏷️ MÉTODO VIRTUAL (Tem comportamento padrão, mas aceita Polimorfismo)
        public virtual string CriptografarSenha(string senha)
        {
            // Simulação de criptografia básica padrão
            return $"[HASH_PADRAO]_{senha}";
        }
    }

    // =================================================================
    // 🏷️ 2. HERANÇA: Classe Concreta que herda de ServicoBase
    // =================================================================
    public class ServicoCadastroCandidato : ServicoBase
    {
        // 🏷️ ENCAPSULAMENTO: Atributos privados protegendo o estado interno
        private string _emailCandidato;
        private string _senhaCriptografada;

        // 🏷️ PROPRIEDADES (Tratamento e Validação de Dados nos Getters/Setters)
        public string EmailCandidato
        {
            get { return _emailCandidato; }
            set 
            {
                // Regra de Negócio / Validação: E-mail precisa de '@' e '.'
                if (string.IsNullOrWhiteSpace(value) || !value.Contains("@") || !value.Contains("."))
                {
                    throw new ArgumentException("E-mail inválido! O formato deve ser correto.");
                }
                _emailCandidato = value;
            }
        }

        public string SenhaCriptografada
        {
            get { return _senhaCriptografada; }
            private set { _senhaCriptografada = value; } // Apenas este serviço pode definir
        }

        // Construtor da classe concreta repassando o nome do serviço para a classe pai
        public ServicoCadastroCandidato() : base("Serviço de Cadastro de Alunos (Candidatos)")
        {
        }

        // =================================================================
        // 🏷️ 3. POLIMORFISMO (Sobrescrita de Métodos)
        // =================================================================

        // Sobrescrevendo o método abstrato de validação de dados
        public override bool ValidarDados(string email, string senha)
        {
            if (string.IsNullOrWhiteSpace(senha) || senha.Length < 6)
            {
                Console.WriteLine("⚠️ Validação falhou: Senha deve ter pelo menos 6 caracteres.");
                return false;
            }
            return true;
        }

        // Sobrescrevendo o método virtual para usar criptografia segura (BCrypt)
        public override string CriptografarSenha(string senha)
        {
            // Simulação da criptografia BCrypt.Net usada no backend C# real
            string salt = "$2a$11$KxeH783Ysk...";
            return $"[BCRYPT_SECURE_HASH]_{senha.GetHashCode()}_{salt.Substring(0, 10)}";
        }

        // 🏷️ MÉTODO CONCRETO: Orquestra o cadastro do candidato
        public void RegistrarCandidato(string email, string senhaPlana)
        {
            Console.WriteLine($"\nIniciando processo no: {NomeDoServico}...");

            try
            {
                // Executa a validação polimórfica de dados
                if (ValidarDados(email, senhaPlana))
                {
                    this.EmailCandidato = email; // Valida o formato do e-mail no Setter
                    this.SenhaCriptografada = CriptografarSenha(senhaPlana); // Criptografa

                    Console.WriteLine("✅ Candidato cadastrado com sucesso!");
                    Console.WriteLine($"-> E-mail Salvo: {EmailCandidato}");
                    Console.WriteLine($"-> Senha Hash Gravada no Banco: {SenhaCriptografada}");
                }
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"❌ Erro de Validação: {ex.Message}");
            }
        }
    }

    // =================================================================
    // EXECUÇÃO DO SISTEMA (Simulação do Backend recebendo dados do Front)
    // =================================================================
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== MVP PERFIL EXATO: BACKEND C# EM AÇÃO ===");

            // 🏷️ 4. CRIAÇÃO DE OBJETO (Instanciação na memória)
            ServicoCadastroCandidato backend = new ServicoCadastroCandidato();

            // Simulação 1: Tentativa de cadastro com e-mail inválido (Tratamento de Dados)
            backend.RegistrarCandidato("carol_senai_com", "senha123");

            // Simulação 2: Tentativa de cadastro com senha inválido (Tratamento de Dados)
            backend.RegistrarCandidato("carol@senai.com.br", "senha");
			
			// Simulação 3: Cadastro com dados perfeitos (Validação e Criptografia OK)
            backend.RegistrarCandidato("carol@senai.com.br", "senha123");


            Console.ReadLine();
        }
    }
}
