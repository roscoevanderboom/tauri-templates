import { TerminalIcon } from "lucide-react"
import { usePanelsStore } from "@/store/panels-store"

export default function Footer() {
  const terminalOpen = usePanelsStore((s) => s.terminalOpen)
  const toggleTerminal = usePanelsStore((s) => s.toggleTerminal)

  return (
    <footer className="flex h-6 w-full shrink-0 items-center justify-between border-t border-border bg-muted/40 px-3 text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="text-foreground/80">Ready</span>
        <button
          onClick={toggleTerminal}
          className={`flex items-center gap-1.5 rounded-sm px-2 transition-colors hover:bg-accent hover:text-foreground ${
            terminalOpen ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <TerminalIcon size={12} />
          <span>Console</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">Tauri + React</span>
      </div>
    </footer>
  )
}
