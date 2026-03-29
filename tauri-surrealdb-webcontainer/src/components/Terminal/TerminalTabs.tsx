import { useState, useId } from "react"
import { Terminal } from "@/components/Terminal"
import { PlusIcon, XIcon } from "lucide-react"

interface Tab {
  id: string
  label: string
}

const MAX_TABS = 5

export default function TerminalTabs() {
  const uid = useId()
  const [tabs, setTabs] = useState<Tab[]>([{ id: `${uid}-0`, label: "Terminal 1" }])
  const [activeId, setActiveId] = useState<string>(`${uid}-0`)

  const addTab = () => {
    if (tabs.length >= MAX_TABS) return
    const id = `${uid}-${Date.now()}`
    const label = `Terminal ${tabs.length + 1}`
    setTabs((prev) => [...prev, { id, label }])
    setActiveId(id)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return
    const idx = tabs.findIndex((t) => t.id === id)
    const next = tabs[idx === 0 ? 1 : idx - 1]
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeId === id) setActiveId(next.id)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Tab strip */}
      <div className="flex h-8 shrink-0 items-end gap-px overflow-x-auto border-b border-border/40 bg-muted/30 px-1 pt-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <div
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={`group flex h-full cursor-pointer select-none items-center gap-1.5 rounded-t px-3 text-[11px] transition-colors ${
                isActive
                  ? "bg-background text-foreground border-x border-t border-border/40"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                >
                  <XIcon size={9} />
                </button>
              )}
            </div>
          )
        })}

        {/* Add tab button */}
        {tabs.length < MAX_TABS && (
          <button
            onClick={addTab}
            title="New terminal"
            className="ml-0.5 flex h-full items-center px-1.5 text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <PlusIcon size={12} />
          </button>
        )}
      </div>

      {/* Terminal panels — all mounted, only active is visible */}
      <div className="relative flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: tab.id === activeId ? "block" : "none" }}
          >
            <Terminal />
          </div>
        ))}
      </div>
    </div>
  )
}
