import { useWebContainerStore } from "@/store/webcontainer-store"
import { Window } from "@tauri-apps/api/window"
import { emit } from "@tauri-apps/api/event"
import { ExternalLinkIcon, RefreshCwIcon, GlobeIcon } from "lucide-react"
import { useRef } from "react"

export default function Preview() {
  const server = useWebContainerStore((s) => s.server)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isReady = server.status === "ready" && !!server.url

  const handleRefresh = () => {
    const iframe = iframeRef.current
    if (!iframe) return
    // Force a reload by resetting src
    const currentUrl = server.url || (iframe.src !== "about:blank" ? iframe.src : "")
    if (!currentUrl) return
    
    iframe.src = "about:blank"
    setTimeout(() => {
      iframe.src = currentUrl
    }, 10)
  }

  const handleOpenExternal = async () => {
    const win = await Window.getByLabel("preview")
    if (win) {
      // Re-emit the URL just in case
      if (isReady) {
        emit("preview-url", { port: server.port, url: server.url })
      }
      await win.show()
      await win.setFocus()
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Browser bar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border/40 bg-muted/10 px-2">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={!isReady}
          title="Refresh"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <RefreshCwIcon size={12} />
        </button>

        {/* Address bar */}
        <div className="flex flex-1 items-center gap-2 overflow-hidden rounded border border-border/30 bg-background/40 px-2 py-0.5">
          <GlobeIcon size={10} className="shrink-0 text-muted-foreground/50" />
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {isReady ? server.url : "Waiting for server..."}
          </span>
        </div>

        {/* Open external */}
        <button
          onClick={handleOpenExternal}
          disabled={!isReady}
          title="Open in preview window"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ExternalLinkIcon size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden bg-white">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <span className="text-[11px] text-muted-foreground">
              Waiting for dev server...
            </span>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={isReady ? server.url : undefined}
          className="h-full w-full border-none"
          title="WebContainer Preview"
        />
      </div>
    </div>
  )
}
