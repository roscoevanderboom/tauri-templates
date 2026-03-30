import { create } from "zustand"
import { Table } from "surrealdb"
import type { FSTree, FSMetadata } from "@/types/fs"
import { webcontainerInstance } from "@/lib/webcontainer"
import { db } from "@/lib/db"
import { emit } from "@tauri-apps/api/event"
import { isIgnored, metadataToTree, parseWebcontainerFS } from "@/utils/webcontainer-utils"
import { toast } from "sonner"

let listenersInitialized = false

export interface ServerState {
  port: number
  url: string
  status: "ready" | "disconnected"
}

interface WebContainerState {
  isInitialized: boolean
  allTrees: FSTree[]
  activeTree: FSTree | null
  server: ServerState

  setInitialized: (initialized: boolean) => void
  setAllTrees: (trees: FSTree[]) => void
  setActiveTree: (tree: FSTree | null) => void
  setServer: (server: Partial<ServerState>) => void
  initializeListeners: () => () => void
  init: () => Promise<void>
  clearFilesystem: () => Promise<void>
  reset: () => void
}

export const useWebContainerStore = create<WebContainerState>((set, get) => ({
  isInitialized: false,
  allTrees: [],
  activeTree: null,
  server: {
    port: 0,
    url: "",
    status: "disconnected",
  },

  setInitialized: (isInitialized) => set({ isInitialized }),
  setAllTrees: (allTrees) => set({ allTrees }),
  setActiveTree: (activeTree) => set({ activeTree }),
  setServer: (serverUpdate) =>
    set((state) => ({
      server: { ...state.server, ...serverUpdate },
    })),

  initializeListeners: () => {
    if (!webcontainerInstance) return () => {}
    if (listenersInitialized) return () => {}
    listenersInitialized = true

    let disconnectTimer: ReturnType<typeof setTimeout>

    const unsubPort = webcontainerInstance.on("port", (port, type, url) => {
      if (type === "open") {
        clearTimeout(disconnectTimer)
        if (get().server.port !== port || get().server.url !== url || get().server.status !== "ready") {
          get().setServer({ port, url, status: "ready" })
          emit("preview-url", { port, url })
        }
      } else if (type === "close") {
        if (get().server.port === port) {
          clearTimeout(disconnectTimer)
          disconnectTimer = setTimeout(() => {
            get().setServer({ port: 0, url: "", status: "disconnected" })
            emit("preview-disconnected")
          }, 1000)
        }
      }
    })

    const unsubServerReady = webcontainerInstance.on("server-ready", (port, url) => {
      clearTimeout(disconnectTimer)
      get().setServer({ port, url, status: "ready" })
      emit("preview-url", { port, url })
    })

    let debounceTimer: ReturnType<typeof setTimeout>
    const syncToDB = async () => {
      try {
        const activeTree = get().activeTree
        if (!activeTree) return
        const tree = await parseWebcontainerFS(webcontainerInstance)
        await db.update(activeTree.id).merge({ tree })
        set((state) => ({
          activeTree: state.activeTree ? { ...state.activeTree, tree } : null,
        }))
      } catch (error) {
        toast.error("Filesystem sync failed", {
          description: error instanceof Error ? error.message : String(error),
        })
      }
    }

    webcontainerInstance.fs.watch(
      "/",
      { persistent: true, recursive: true },
      async (_event, filePath) => {
        if (typeof filePath !== "string" || isIgnored(filePath)) return
        console.log("[watcher] change:", filePath)
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(syncToDB, 1500)
      }
    )

    return () => {
      unsubPort()
      unsubServerReady()
      clearTimeout(debounceTimer)
      clearTimeout(disconnectTimer)
      listenersInitialized = false
    }
  },

  clearFilesystem: async () => {
    try {
      const rootItems = await webcontainerInstance.fs.readdir("/", { withFileTypes: true })
      for (const item of rootItems) {
        await webcontainerInstance.fs.rm(item.name, { recursive: true })
      }
      set((state) => ({
        activeTree: state.activeTree ? { ...state.activeTree, tree: [] } : null,
      }))
    } catch (error) {
      toast.error("Failed to clear filesystem", {
        description: error instanceof Error ? error.message : String(error),
      })
    }
  },

  init: async () => {
    try {
      const trees = await db.select<FSTree>(new Table("filesystemtrees"))
      console.log("[init] trees from db:", trees)
      const activeTree = (trees as FSTree[]).find((t: FSTree) => t.loaded) ?? null
      console.log("[init] activeTree:", activeTree)

      set({ allTrees: trees as FSTree[], activeTree })

      if (activeTree) {
        const fsTree = metadataToTree(activeTree.tree || [])
        await webcontainerInstance.mount(fsTree)
      } else {
        await webcontainerInstance.mount({})
      }

      get().initializeListeners()
      set({ isInitialized: true })
      console.log("[init] done")
    } catch (error) {
      console.error("[init] error:", error)
      toast.error("Failed to initialize environment", {
        description: error instanceof Error ? error.message : String(error),
      })
      const now = new Date().toISOString()
      const created = await db.create<FSTree>(new Table("filesystemtrees")).content({
        name: "default-project",
        loaded: true,
        createdAt: now,
        tree: [] as FSMetadata[],
      })
      console.log("[init] fallback created:", created)
      const activeTree = (created as FSTree[])[0] ?? (created as unknown as FSTree)
      await webcontainerInstance.mount({})
      set({ activeTree, isInitialized: true })
      get().initializeListeners()
    }
  },

  reset: () => {
    listenersInitialized = false
    set({
      isInitialized: false,
      allTrees: [],
      activeTree: null,
      server: { port: 0, url: "", status: "disconnected" },
    })
  },
}))
