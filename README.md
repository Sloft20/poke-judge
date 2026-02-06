# 🛡️ PokéJudge Pro v2.5

> **Sistema Profissional de Arbitragem para Pokémon TCG**
> Controle de tempo, gestão de danos e ranking global em tempo real.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-blue?style=for-the-badge&logo=react)
![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Tailwind_|_Supabase-purple?style=for-the-badge)

## 📸 Screenshots

| **Lobby & Setup** | **Painel de Arbitragem** |
|:---:|:---:|
| ![Lobby]([<img width="1910" height="909" alt="Image" src="https://github.com/user-attachments/assets/ea2629c0-2284-4ede-92ee-18cb10022b38" />](https://private-user-images.githubusercontent.com/254816311/545973949-ea2629c0-2284-4ede-92ee-18cb10022b38.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzAzNDgyNDEsIm5iZiI6MTc3MDM0Nzk0MSwicGF0aCI6Ii8yNTQ4MTYzMTEvNTQ1OTczOTQ5LWVhMjYyOWMwLTIyODQtNGVkZS05MmVlLTE4Y2IxMDAyMmIzOC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwMjA2JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDIwNlQwMzE5MDFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mZTVmOTdkYzRhYjc0Nzg3ODllYjM2MWQ1NmIzYWUwZTVhOTkwZmE3MmUzODNjNDM4ZmE4NjkxODQ1M2VhNDZjJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.OxxDL7H91Xt3pcTT7qWlc0WxE2fgL8nE6DCkeAbRopk)) | ![Game](https://via.placeholder.com/400x200?text=Print+do+Jogo) |
| *Seleção de Decks e Ranking* | *Controle de Turnos e Danos* |

---

## 🚀 Sobre o Projeto

O **PokéJudge Pro** é uma ferramenta desenvolvida para juízes e jogadores competitivos de Pokémon TCG. Ele substitui os marcadores físicos e cronômetros manuais por uma interface digital precisa, evitando erros de cálculo e disputas sobre o estado do jogo.

### ✨ Funcionalidades Principais

#### 🎮 Gestão de Partida (Live Game)
- **Cronômetro Oficial:** Timer de 30/50 minutos com controle de fases (Setup, Draw, Action, Attack, Checkup).
- **Log de Eventos:** Histórico automático de todas as ações (Dano, Recuo, Habilidades) exportável em `.txt` para auditoria.
- **Ferramentas de Juiz:** Botões rápidos para aplicar penalidades (*Slow Play*, *Procedural Error*) e corrigir Game State.
- **Moeda Imersiva:** Simulador de Cara ou Coroa com efeitos visuais e sonoros 3D.

#### 🏆 Sistema de Ranking & Meta
- **Global Leaderboard:** Integração com **Supabase** para salvar histórico de partidas.
- **Análise de Meta:** Estatísticas de *Win Rate* (Taxa de Vitória) por Deck (ex: Charizard ex vs Dragapult ex).
- **Visual Pro:** Modal com tema escuro (Dark Mode), ícones das cartas e barras de progresso visuais.

#### 📱 UI/UX Moderna
- **Design Responsivo:** Funciona perfeitamente em Tablets (para mesas de torneio) e Celulares.
- **Lobby Interativo:** Tela inicial com acesso rápido a Nova Partida e Ranking.
- **Feedback Visual:** Animações de dano, modais de seleção de cartas e alertas coloridos.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React.js (Vite)
* **Estilização:** Tailwind CSS (com Lucide React Icons)
* **Backend/Database:** Supabase (PostgreSQL)
* **Hospedagem:** Vercel

---

## 📦 Como Rodar Localmente

1. **Clone o repositório**
   ```bash
   git clone [https://github.com/Sloft20/poke-judge.git](https://github.com/Sloft20/poke-judge.git)
   cd poke-judge
