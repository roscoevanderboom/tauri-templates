import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import FileExplorer from "@/components/FileExplorer"
import Preview from "@/components/Preview"
import { MessageSquareIcon } from "lucide-react"
import { lazy, Suspense } from "react"
import { usePanelsStore } from "@/store/panels-store"

const TerminalTabs = lazy(() => import("@/components/Terminal/TerminalTabs"))

const IDE = () => {
  const terminalOpen = usePanelsStore((s) => s.terminalOpen)
  const explorerOpen = usePanelsStore((s) => s.explorerOpen)
  const chatOpen = usePanelsStore((s) => s.chatOpen)

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={20} hidden={!explorerOpen} className="bg-muted/10 backdrop-blur-sm">
          <FileExplorer />
        </ResizablePanel>

        <ResizableHandle hidden={!explorerOpen} className="bg-border/50 transition-colors hover:bg-primary/50" />

        {/* Center - Preview + Terminal */}
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={70}>
              <Preview />
            </ResizablePanel>

            <ResizableHandle
              hidden={!terminalOpen}
              className="bg-border/30 transition-colors hover:bg-primary/50"
            />

            <ResizablePanel defaultSize={30} hidden={!terminalOpen}>
              <div className="h-full w-full bg-background/50">
                <Suspense>
                  <TerminalTabs />
                </Suspense>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle hidden={!chatOpen} className="bg-border/50 transition-colors hover:bg-primary/50" />

        {/* Right panel — opinionated VS Code-style layout. Replace or remove this panel freely.
            TODO: implement a right-hand panel (e.g. AI chat, outline, extensions, database explorer). */}
        <ResizablePanel defaultSize={20} hidden={!chatOpen} className="bg-muted/20 backdrop-blur-sm">
          <div className="flex h-full flex-col px-4 py-3">
            <div className="mb-6 flex items-center gap-2 text-muted-foreground/80">
              <MessageSquareIcon size={14} />
              {/* TODO: replace with your panel's title and icon */}
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Chat
              </span>
            </div>
            {/* TODO: replace this placeholder with your panel's content */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-background/30 p-6 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageSquareIcon size={16} className="text-primary/40" />
              </div>
              <span className="text-[10px] leading-relaxed text-muted-foreground/40 italic">
                Ask me anything about your project...
              </span>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default IDE
