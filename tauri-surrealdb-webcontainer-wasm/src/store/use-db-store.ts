import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { db } from "@/lib/db"
import { toast } from "sonner"

export type DBStatus = "disconnected" | "connecting" | "connected" | "error"

export interface DBConfig {
  host: string
  namespace: string
  database: string
  user?: string
  pass?: string
}

export interface DBProfile extends DBConfig {
  id: string
  name: string
}

export interface DBStore {
  profiles: DBProfile[]
  activeProfileId: string | null
  status: DBStatus
  error: string | null
  
  // Actions
  addProfile: (profile: Omit<DBProfile, "id">) => string
  updateProfile: (id: string, profile: Partial<Omit<DBProfile, "id">>) => void
  removeProfile: (id: string) => void
  selectProfile: (id: string) => Promise<void>
  
  initialize: (config: DBConfig) => Promise<void>
  connect: (config: DBConfig) => Promise<void>
  disconnect: () => Promise<void>
}

export const useDBStore = create<DBStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      status: "disconnected",
      error: null,

      addProfile: (profile) => {
        const id = crypto.randomUUID()
        set((state) => ({
          profiles: [...state.profiles, { ...profile, id }],
        }))
        return id
      },

      updateProfile: (id, updatedFields) => {
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
        }))
      },

      removeProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        }))
      },

      selectProfile: async (id) => {
        const profile = get().profiles.find((p) => p.id === id)
        if (!profile) return

        set({ activeProfileId: id })
        await get().connect(profile)
      },

      initialize: async (config) => {
        set({ status: "connecting", error: null })
        try {
          await get().connect(config)
        } catch (err) {
          set({ status: "error", error: err instanceof Error ? err.message : "Failed to initialize" })
        }
      },

      connect: async (config) => {
        set({ status: "connecting", error: null })
        
        try {
          await db.connect(config.host)

          if (config.user && config.pass) {
            await db.signin({
              username: config.user,
              password: config.pass,
            })
          }

          await db.use({ namespace: config.namespace, database: config.database })
          
          set({ status: "connected" })
          toast.success("Connected to database")
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error connecting to database"
          set({ status: "error", error: message })
          toast.error(message)
          throw err
        }
      },

      disconnect: async () => {
        try {
          await db.close()
          set({ status: "disconnected", activeProfileId: null })
        } catch (err) {
          console.error("Error disconnecting:", err)
        }
      },
    }),
    {
      name: "surreal-connection-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
    }
  )
)

// Helper to wait for the connection to be established (useful in loaders)
export const waitForConnection = async (): Promise<boolean> => {
  const store = useDBStore.getState()
  
  if (store.status === "connected") return true
  if (store.status === "error") throw new Error(store.error || "Connection failed")

  return new Promise((resolve, reject) => {
    const unsubscribe = useDBStore.subscribe((state) => {
      if (state.status === "connected") {
        unsubscribe()
        resolve(true)
      } else if (state.status === "error") {
        unsubscribe()
        reject(new Error(state.error || "Connection failed"))
      }
    })
  })
}
