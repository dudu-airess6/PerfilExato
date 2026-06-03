# 🎯 PerfilExato SENAI

> **Conectando talentos técnicos às oportunidades certas através de dados.**

O **PerfilExato** é um ecossistema de empregabilidade projetado para o ambiente SENAI. Ele atua como um "Matchmaker" inteligente que analisa a prontidão técnica e comportamental de alunos, filtrando as vagas de emprego com base em requisitos reais.

---

## 💻 Sobre o Projeto
Este é um MVP (Minimum Viable Product) que resolve o problema do "currículo genérico". O sistema não apenas armazena dados; ele **processa** o perfil do candidato em relação ao mercado, utilizando cálculos de peso para competências técnicas (Hard Skills) e comportamentais (Soft Skills).

## ✨ Funcionalidades Destaque
* **Validação de Identidade:** Sistema de validação real de CPF (Algoritmo Módulo 11).
* **Geolocalização Automática:** Integração com API externa (**ViaCEP**) para preenchimento de endereço.
* **Dashboard de Prontidão:** Barra dinâmica que reflete a saúde do perfil (0-100%).
* **Algoritmo de Match:** Filtro inteligente que bloqueia candidaturas em vagas onde o perfil possui menos de 40% de aderência, otimizando o tempo do recrutador.

## 🛠️ Tecnologias & Ferramentas
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![API](https://img.shields.io/badge/ViaCEP_API-0080FF?style=for-the-badge&logo=google-cloud&logoColor=white)

## 🏗️ Arquitetura de Dados
Para garantir a velocidade e funcionalidade do protótipo sem a necessidade de um servidor robusto, utilizei:
* **Web Storage API (LocalStorage):** Persistência de dados e simulação de estado de sessão.
* **DOM Manipulation:** Atualização em tempo real dos cards de vagas e indicadores de perfil.

## 🚀 Como Executar
1. Clone este repositório:
   ```bash
   git clone [https://github.com/dudu-airess6/PerfilExato.git](https://github.com/dudu-airess6/PerfilExato.git)

2. Navegue até a pasta do projeto.

3. Abra o arquivo index.html em qualquer navegador moderno.
4. Acesse o link: https://dudu-airess6.github.io/PerfilExato/
