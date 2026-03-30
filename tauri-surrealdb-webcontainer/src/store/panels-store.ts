import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PanelsState {
  terminalOpen: boolean
  toggleTerminal: () => void
  setTerminalOpen: (open: boolean) => void
}

export const usePanelsStore = create<PanelsState>()(
  persist(
    (set) => ({
      terminalOpen: true,
      toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
      setTerminalOpen: (open) => set({ terminalOpen: open }),
    }),
    { name: "panels" }
  )
)
