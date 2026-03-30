import { useEffect, useRef, useState } from "react"
import { exit } from "@tauri-apps/plugin-process"
import { useNavigate } from "react-router"
import { ui_routes } from "@/router"
import { FilesIcon } from "lucide-react"
import { usePanelsStore } from "@/store/panels-store"

export default function TitlebarMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const explorerOpen = usePanelsStore((s) => s.explorerOpen)
  const toggleExplorer = usePanelsStore((s) => s.toggleExplorer)

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickAway)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickAway)
    }
  }, [isOpen])

  const handleQuit = async () => {
    try {
      await exit(0)
    } catch (error) {
      console.error("Failed to quit:", error)
    }
  }

  return (
    <div className="relative flex h-8 items-center" ref={menuRef}>
      <button
        className="flex h-8 w-[46px] items-center justify-center text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        title="Application menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>

      <button
        className={`flex h-8 w-[36px] items-center justify-center border-r border-border/30 transition-colors hover:bg-accent/50 hover:text-foreground ${explorerOpen ? "text-foreground" : "text-muted-foreground"}`}
        onClick={toggleExplorer}
        title="Toggle explorer"
      >
        <FilesIcon size={14} />
      </button>

      {isOpen && (
        <div className="absolute top-8 left-0 z-[1001] min-w-[150px] rounded-md border border-border bg-popover p-1 shadow-md">
          {ui_routes.map((route) => (
            <button
              key={route.path}
              className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                navigate(route.path)
                setIsOpen(false)
              }}
            >
              {route.icon}
              {route.title}
            </button>
          ))}
          <div className="my-1 h-[1px] bg-border" />
          <button
            className="flex h-8 w-full items-center rounded-sm px-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={handleQuit}
          >
            Quit
          </button>
        </div>
      )}
    </div>
  )
}
