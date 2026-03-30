# 🚀 Tauri + SurrealDB + WebContainer

An advanced, professional-grade Tauri template featuring an embedded terminal, WebContainer API support, and filesystem persistence with SurrealDB.

## 🛠️ Tech Stack

- **Runtime:** [Tauri 2.0](https://tauri.app/)
- **Frontend:** [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **Terminal:** [xterm.js](https://xtermjs.org/) + [Addon-fit](https://github.com/xtermjs/xterm.js/tree/master/addons/addon-fit)
- **Filesystem Environment:** [WebContainer API](https://webcontainers.io/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Database:** [SurrealDB](https://surreal.com/) (Embedded/Browser)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Layout:** [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)

## ⚖️ Performance & Backend

Unlike the `-wasm` variant, this template runs **SurrealDB directly in the Rust backend**, providing superior performance and full feature support (including SurrealKV and persistent filesystem storage).

### Metrics
- **Installed Size:** ~66 MB
- **Windows Package (.msi/.exe):** ~13-15 MB
- **Storage:** Native filesystem persistence via SurrealDB Rust engine.


## ✨ Unique Features

- **Embedded Development Environment:** Run Node.js directly within the Tauri app using WebContainers.
- **Persistent Filesystem:** The WebContainer's filesystem tree is automatically synced to a local SurrealDB database via Tauri `invoke` calls to the Rust backend.
- **Dynamic Terminal:** A fully integrated xterm.js terminal for direct interaction with the WebContainer environment.

## 🚀 Getting Started

### Prerequisites

- [Tauri prerequisites](https://tauri.app/v2/guides/getting-started/prerequisites)
- [WebContainer API Access Key](https://webcontainers.io/) (if required for your use case)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run in development mode:
   ```bash
   pnpm tauri dev
   ```

## 🏗️ Project Structure

- `src-tauri/`: Rust logic for SurrealDB management and filesystem persistence.
- `src/store/webcontainer-store.tsx`: Centralized Zustand store for WebContainer lifecycle, port management, and DB synchronization.
- `src/components/`: Reusable UI components including terminal and resizable panels.
- `src/hooks/`: Custom hooks for WebContainer interaction.

