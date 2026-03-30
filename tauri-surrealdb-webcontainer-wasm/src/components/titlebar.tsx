import { getCurrentWindow } from "@tauri-apps/api/window"
import { exit } from "@tauri-apps/plugin-process"
import TitlebarMenu from "./titlebar-menu"
import { useTheme } from "@/components/theme-provider"
import { useWebContainerStore } from "@/store/webcontainer-store"
import { MessageSquareIcon } from "lucide-react"
import { usePanelsStore } from "@/store/panels-store"

const appWindow = getCurrentWindow()

export default function Titlebar() {
  const { theme, setTheme } = useTheme()
  const activeTree = useWebContainerStore((state) => state.activeTree)
  const chatOpen = usePanelsStore((s) => s.chatOpen)
  const toggleChat = usePanelsStore((s) => s.toggleChat)

  const handleMinimize = () => appWindow.minimize()
  const handleMaximize = () => appWindow.toggleMaximize()
  const handleHide = () => appWindow.hide()
  const handleClose = () => exit(0)

  const switchTheme = async () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <div
      className="relative z-50 flex h-8 w-full shrink-0 items-center justify-between border-b border-border/50 bg-border/40 backdrop-blur-sm select-none"
      data-tauri-drag-region
    >
      <TitlebarMenu />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 font-mono text-[12px] tracking-tighter text-muted-foreground">
          {activeTree?.name || "No Project"}
        </div>
      </div>
      <div className="flex h-8">
        <button
          className={`flex h-8 w-[36px] items-center justify-center border-r border-border/30 transition-colors hover:bg-accent/50 hover:text-foreground ${chatOpen ? "text-foreground" : "text-muted-foreground"}`}
          onClick={toggleChat}
          title="Toggle chat"
        >
          <MessageSquareIcon size={14} />
        </button>
        <button
          className="flex h-8 items-center justify-center border-r border-border/30 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          onClick={switchTheme}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <button
          onClick={handleMinimize}
          className="flex h-8 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          title="minimize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13H5v-2h14z" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="flex h-8 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          title="maximize"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M4 4h16v16H4zm2 4v10h12V8z" />
          </svg>
        </button>
        <button
          onClick={handleHide}
          className="flex h-8 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          title="hide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"
            />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="hover:text-destructive-foreground flex h-8 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-foreground"
          title="close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
