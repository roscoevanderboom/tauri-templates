import { create } from "zustand"
import type { FSTree } from "@/types/fs"
import { webcontainerInstance } from "@/lib/webcontainer"
import { emit } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { isIgnored, metadataToTree, parseWebcontainerFS } from "@/utils/webcontainer-utils"
import { toast } from "sonner"

// Module-level flag — intentional. Zustand state is async-batched so using
// it as a synchronous guard causes races. This resets via reset() and on HMR
// via Vite's import.meta.hot dispose below.
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
      server: { ...state.server, ...serverUpdate } 
    })),
  
  initializeListeners: () => {
    if (!webcontainerInstance) return () => {}
    
    if (listenersInitialized) return () => {}
    listenersInitialized = true

    // Port events - manage server state with a small debounce on disconnects
    // to prevent flickering during fast server restarts (common in Vite/HMR)
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
          // Wait a bit before disconnecting to see if if it comes back up
          clearTimeout(disconnectTimer)
          disconnectTimer = setTimeout(() => {
            get().setServer({ port: 0, url: "", status: "disconnected" })
            emit("preview-disconnected")
          }, 1000)
        }
      }
    })

    // Filesystem watcher + DB Sync
    let debounceTimer: ReturnType<typeof setTimeout>
    const syncToDB = async () => {
      try {
        const activeTree = get().activeTree
        if (!activeTree) return

        const fsTree = await parseWebcontainerFS(webcontainerInstance)
        await invoke("update_fs_tree", {
          id: activeTree.id,
          tree: fsTree,
        })
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
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(syncToDB, 1500)
      }
    )

    return () => {
      unsubPort()
      clearTimeout(debounceTimer)
      clearTimeout(disconnectTimer)
      listenersInitialized = false
    }
  },

  clearFilesystem: async () => {
    try {
      const rootItems = await webcontainerInstance.fs.readdir("/", {
        withFileTypes: true,
      })
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
      const trees = await invoke<FSTree[]>("get_all_fs_trees")
      const activeTree = trees.find((t) => t.loaded) || null

      set({ allTrees: trees, activeTree })

      if (activeTree) {
        const fsTree = metadataToTree(activeTree.tree || [])
        await webcontainerInstance.mount(fsTree)
      } else {
        await webcontainerInstance.mount({})
      }

      get().initializeListeners()
      set({ isInitialized: true })
    } catch (error) {
      toast.error("Failed to initialize environment", {
        description: error instanceof Error ? error.message : String(error),
      })
      const activeTree = await invoke<FSTree>("create_fs_tree", {
        name: "default-project",
        tree: [],
      })
      await webcontainerInstance.mount({})
      set({ activeTree, isInitialized: true })
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
