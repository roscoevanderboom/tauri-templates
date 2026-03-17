# ⚡ React Router + shadcn/ui Tauri Template

A high-performance Tauri foundation built with React Router 7, Tailwind 4, and shadcn/ui.

## 🚀 Features

- **React Router 7:** Leverages the latest features for routing and data loading.
- **Tailwind CSS 4:** Modern, utility-first styling with the latest engine.
- **shadcn/ui:** Beautifully designed, accessible components.
- **Tauri 2.0:** Secure and lightweight desktop application framework.

## 🛠️ Usage

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm tauri dev
```

### Adding Components

To add new shadcn/ui components, use the following CLI command:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
```

### Importing Components

Components are located in `@/components/ui/`. Import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## 🏗️ Structure

- `app/`: React Router application source.
- `src-tauri/`: Rust source and Tauri configuration.
- `public/`: Static assets.
