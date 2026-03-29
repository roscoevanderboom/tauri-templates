import { TerminalIcon } from "lucide-react"
export default function Footer() {
  return (
    <footer className="flex h-6 w-full shrink-0 items-center justify-between border-t border-border bg-muted/40 px-3 text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="text-foreground/80">Ready</span>
        <button className="flex items-center gap-1.5 rounded-sm px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
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
