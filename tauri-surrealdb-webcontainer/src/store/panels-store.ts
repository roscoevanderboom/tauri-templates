import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PanelsState {
  terminalOpen: boolean
  explorerOpen: boolean
  chatOpen: boolean
  toggleTerminal: () => void
  setTerminalOpen: (open: boolean) => void
  toggleExplorer: () => void
  toggleChat: () => void
}

export const usePanelsStore = create<PanelsState>()(
  persist(
    (set) => ({
      terminalOpen: true,
      explorerOpen: true,
      chatOpen: true,
      toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
      setTerminalOpen: (open) => set({ terminalOpen: open }),
      toggleExplorer: () => set((s) => ({ explorerOpen: !s.explorerOpen })),
      toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
    }),
    { name: "panels" }
  )
)
