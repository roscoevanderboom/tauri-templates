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

## ⚖️ SurrealDB WASM: Benefits & Tradeoffs

This template uses `@surrealdb/wasm` to provide a fully functional SurrealDB engine embedded within the frontend.

### Benefits
- **Ultra-Small Footprint:** Only ~11 MB installed and a ~5-6 MB Windows package file.
- **Embedded Engine:** No separate database server process required.
- **Extreme Performance:** Local in-memory or indexedDB access with zero network latency.

### Tradeoffs
- **Backend Limitations:** No SurrealKV support in the WASM build.
- **Platform Bugs:** `indxdb://` storage can be unreliable on Windows due to persistent WebView2 storage bugs (see [Tauri #9222](https://github.com/tauri-apps/tauri/issues/9222) and [SurrealDB #3610](https://github.com/surrealdb/surrealdb/issues/3610)). `mem://` storage is recommended for Windows environments until these upstream issues are fully resolved.



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

