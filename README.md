<div align="center">
  <h1>Corely</h1>
  <p>Alternativa open-source ao Raycast para Linux — leve, extensível e com personalização avançada.</p>

  <img src="https://img.shields.io/badge/plataforma-Linux-blue?style=flat-square" alt="Linux" />
  <img src="https://img.shields.io/badge/Tauri-v2-orange?style=flat-square" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/Rust-1.75+-brown?style=flat-square" alt="Rust" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/versão-0.1.0-green?style=flat-square" alt="v0.1.0" />
</div>

---

## O que é o Corely?

O Corely é um **launcher de aplicações para Linux** inspirado no Raycast do macOS. Com uma única tecla de atalho, uma janela flutuante aparece no centro da tela e permite que você abra apps, busque arquivos, execute comandos do sistema — tudo sem tirar as mãos do teclado.

O projeto existe porque o Raycast é exclusivo do macOS e o Linux não possui um equivalente com a mesma polimento visual e extensibilidade. O Corely preenche essa lacuna com uma interface moderna, efeito frosted glass, temas personalizáveis e atalhos configuráveis.

---

## Funcionalidades

- **Launcher de aplicações** — lista todos os apps instalados via GIO (padrão freedesktop), com ícones e descrições.
- **Busca de arquivos** — pesquisa recursiva no diretório home em tempo real.
- **Comandos do sistema** — desligar, reiniciar, suspender e controle de volume via `pactl`.
- **Atalho global** — `Ctrl+Alt+Espaço` (configurável) invoca o launcher de qualquer lugar.
- **Bandeja do sistema** — vive em background na system tray; clique para reabrir.
- **Aparência personalizável** — tema claro/escuro, cor de destaque com presets + picker livre, modo compacto, toggle de ícones e efeito de transparência (frosted glass).
- **Atalhos configuráveis** — todos os atalhos de teclado são editáveis e persistidos localmente.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Janela nativa | [Tauri v2](https://tauri.app/) |
| Backend | Rust (GIO, x11rb, tauri-plugin-store, tauri-plugin-global-shortcut) |
| Frontend | React 19, TypeScript, Vite 7 |
| Estilo | Tailwind CSS v4, tw-animate-css |
| Componentes | shadcn/ui, Base UI |
| Ícones | Lucide React |
| Fonte | Geist Variable |

---

## Requisitos

- Linux (X11 ou Wayland)
- [Rust](https://rustup.rs/) 1.75+
- Node.js 18+
- Bibliotecas de sistema: `libgtk-3`, `libwebkit2gtk-4.1`, `libappindicator3`, `librsvg2`
- Para controle de volume: `pulseaudio` / `pipewire-pulse` (`pactl`)

Instalação das dependências no Ubuntu/Debian:

```bash
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev \
  libappindicator3-dev librsvg2-dev patchelf
```

---

## Instalação e execução

```bash
# Clone o repositório
git clone https://github.com/Waccampos/corely.git
cd corely

# Instale as dependências JavaScript
npm install

# Rode em modo de desenvolvimento (hot-reload)
npm run tauri dev

# Gere o binário de produção
npm run tauri build
```

---

## Estrutura do projeto

```
corely/
├── src/                        # Frontend React + TypeScript
│   ├── screens/
│   │   ├── launcher/           # Tela principal de busca
│   │   ├── extensions/         # Tela de extensões (futuro)
│   │   └── settings/           # Configurações (aparência, atalhos, privacidade)
│   ├── components/             # Titlebar, Rail, AppIcon, Glass…
│   ├── context/AppContext.tsx  # Estado global (tema, accent, screen)
│   ├── hooks/                  # useApps, useLauncherKeys, useShortcuts
│   └── data/                   # Presets de cores de destaque
│
└── src-tauri/                  # Backend Rust
    └── src/core/
        ├── orchestrator.rs     # Listagem de apps, busca de arquivos, launch
        ├── shortcuts.rs        # Atalhos globais (registro/persistência)
        ├── window.rs           # Janela transparente + hack de foco X11
        ├── tray.rs             # Ícone na system tray
        └── commands.rs         # hide_window e demais comandos Tauri
```

---

## Como funciona

1. **Inicialização** — o Tauri cria uma janela transparente, sem decorações, sempre no topo e oculta por padrão. Um ícone é registrado na bandeja do sistema.
2. **Atalho global** — ao pressionar `Ctrl+Alt+Espaço`, o backend exibe a janela e força o foco (via `_NET_ACTIVE_WINDOW` no X11 para contornar focus-stealing prevention dos WMs).
3. **Busca** — o frontend invoca `get_items` (apps + comandos do sistema) na montagem e `search_files` com debounce de 300 ms conforme o usuário digita. Os resultados são agrupados por categoria: *Aplicativos*, *Sistema*, *Pastas* e *Arquivos*.
4. **Launch** — ao pressionar Enter (ou clicar), `launch_app` é chamado no Rust; para apps do sistema o GIO dispara o `.desktop` correto, para arquivos usa `xdg-open`. A janela é escondida em seguida.
5. **Configurações** — tema, accent e preferências de layout são persistidos no `localStorage`. Atalhos de teclado usam `tauri-plugin-store` (arquivo `shortcuts.json`).

---

## Atalhos padrão

| Ação | Teclas |
|------|--------|
| Abrir Corely | `Ctrl+Alt+Espaço` |
| Navegar resultados | `↑` / `↓` |
| Abrir selecionado | `Enter` |
| Ver ações do item | `Ctrl+K` |
| Limpar / fechar | `Esc` |

Todos os atalhos podem ser alterados em **Configurações → Atalhos**.

---

## Contribuindo

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

---

<div align="center">
  Feito com ♥ para a comunidade Linux
</div>
