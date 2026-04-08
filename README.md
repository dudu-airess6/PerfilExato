# 🎯 PerfilExato SENAI

> A plataforma de empregabilidade técnica do SENAI, projetada para ligar talentos às melhores vagas do mercado com precisão e inteligência.

## 💻 Sobre o Projeto

O **PerfilExato** é um protótipo funcional (MVP) de uma aplicação web focada em recrutamento e seleção inteligente para alunos do SENAI. A plataforma não apenas recolhe dados básicos do candidato, mas analisa o seu **Nível de Formação**, **Hard Skills** (Competências Técnicas) e **Soft Skills** (Competências Comportamentais) para calcular, em tempo real, a sua "Prontidão para o Mercado" e a sua compatibilidade (%) com as vagas disponíveis.

O sistema utiliza armazenamento local (`localStorage`) para simular uma base de dados, permitindo uma experiência interativa e imersiva sem a necessidade de um backend durante a fase de prototipagem e apresentação.

---

## ✨ Funcionalidades Principais

* **📝 Formulário de Perfil Inteligente:** Captura dados do candidato, incluindo nível escolar e uma vasta gama de Hard e Soft Skills.
* **🔍 Scanner Analítico:** Tela de transição com animação visual que simula a análise de dados do perfil do candidato.
* **📊 Dashboard de Prontidão:** Uma barra de progresso dinâmica que calcula (de 0 a 100%) o quão preparado o candidato está para o mercado de trabalho, alterando de cor (Vermelho, Laranja, Verde) conforme o peso das informações preenchidas.
* **🤝 Algoritmo de "Match" de Vagas:** Compara as exigências técnicas e comportamentais de uma vaga com o perfil do candidato, gerando uma taxa de compatibilidade em porcentagem.
* **🚦 UX/UI Dinâmica nas Vagas:** * **Alta Compatibilidade (≥ 60%):** Destaque verde (Incentiva a candidatura).
    * **Média Compatibilidade (40% a 59%):** Destaque cinza (Permite candidatura, mas alerta para requisitos em falta).
    * **Baixa Compatibilidade (< 40%):** Destaque vermelho e **bloqueio automático** do botão de candidatura, impedindo spam de currículos em vagas onde o candidato não possui os requisitos mínimos.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as tecnologias fundamentais da web, com foco em performance e interatividade no Frontend:

* **HTML5:** Estruturação semântica do conteúdo.
* **CSS3:** Estilização global, animações e responsividade (UI/UX).
* **JavaScript (Vanilla):** Lógica de negócios, cálculos de match e manipulação do DOM.
* **Web Storage API (LocalStorage):** Persistência de dados simulando uma base de dados em tempo real no navegador.

---

## 🚀 Como executar o projeto localmente

Como o projeto é estático (Frontend), não é necessária nenhuma instalação complexa.

1. Faça o clone do repositório:
   ```bash
   git clone [https://github.com/dudu-airess6/PerfilExato.git](https://github.com/dudu-airess6/PerfilExato.git)
   Navegue até a pasta do projeto:

2. Bash
cd PerfilExato/frontend
Abra o ficheiro index.html em qualquer navegador web (Chrome, Edge, Firefox, etc.).

3. Opcional: Se usar o VS Code, pode utilizar a extensão Live Server para uma melhor experiência de desenvolvimento.
   
4. 🧪 Como testar a inteligência do sistema
Para ver o sistema a funcionar na sua plenitude, siga estes passos:

-Vá até à página de Formulário e preencha alguns dados, marcando poucas competências.

-Observe a sua Prontidão no painel do Meu Perfil (provavelmente ficará vermelha ou laranja).

-Vá para a página de Vagas e veja que as vagas não compatíveis estarão bloqueadas (vermelhas).

-Volte, clique em Preencher Novamente (ou limpe o LocalStorage), marque muitas Hard e Soft Skills, e veja o seu perfil atingir 100% de Prontidão e os "Matches" ficarem verdes nas vagas!

👨‍💻 Desenvolvido por
Eduardo Aires (@dudu-airess6)
Projeto desenvolvido para apresentação/avaliação.
