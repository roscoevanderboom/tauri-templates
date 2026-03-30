import { TerminalIcon } from "lucide-react"
import { usePanelsStore } from "@/store/panels-store"
import { useWebContainerStore } from "@/store/webcontainer-store"

export default function Footer() {
  const terminalOpen = usePanelsStore((s) => s.terminalOpen)
  const toggleTerminal = usePanelsStore((s) => s.toggleTerminal)
  const isInitialized = useWebContainerStore((s) => s.isInitialized)
  const serverStatus = useWebContainerStore((s) => s.server.status)

  return (
    <footer className="flex h-6 w-full shrink-0 items-center justify-between border-t border-border bg-muted/40 px-3 text-xs select-none">
      <div className="flex items-center gap-2">
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
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${isInitialized ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}
          />
          <span className="text-muted-foreground">DB</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${isInitialized ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}
          />
          <span className="text-muted-foreground">WebContainer</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${serverStatus === "ready" ? "bg-green-500" : "bg-muted-foreground"}`}
          />
          <span className="text-muted-foreground">Server</span>
        </span>
      </div>
    </footer>
  )
}
