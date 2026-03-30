import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

import { ThemeProvider } from "@/components/theme-provider.tsx"
import { RouterProvider } from "react-router"
import { router } from "./router"
import { useDBStore } from "./store/use-db-store"
import { Toaster } from "@/components/ui/sonner"

// Non-blocking initialization of DB
useDBStore
  .getState()
  .initialize({
    host: "ws://127.0.0.1:8081",
    namespace: "main",
    database: "main",
    user: "root",
    pass: "root"
  })
  .catch((err: Error) => {
    console.error("Critical DB initialization error:", err)
  })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </StrictMode>
)
