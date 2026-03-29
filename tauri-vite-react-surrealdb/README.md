# ⚡ Tauri + Vite + React + SurrealDB WASM

A high-performance, production-ready Tauri template featuring an embedded SurrealDB WASM instance for ultra-fast local data persistence.

## 🛠️ Tech Stack

- **Runtime:** [Tauri 2.0](https://tauri.app/)
- **Frontend:** [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **Database:** [SurrealDB WASM](https://surrealdb.com/docs/surrealdb/integration/libraries/wasm) (In-memory by default)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Theme:** [next-themes](https://github.com/pacocoursey/next-themes) (Light/Dark mode)

## 🚀 Getting Started

### Prerequisites

Ensure you have the [Tauri prerequisites](https://tauri.app/v2/guides/getting-started/prerequisites) installed on your system.

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run in development mode:
   ```bash
   pnpm tauri dev
   ```

3. Build for production:
   ```bash
   pnpm tauri build
   ```

## 🏗️ Project Structure

- `src-tauri/`: Rust backend and Tauri configuration.
- `src/store/use-db-store.ts`: Centralized SurrealDB connection and state logic.
- `src/components/`: Reusable UI components powered by shadcn/ui.
- `src/routes/`: Page definitions using React Router 7.

