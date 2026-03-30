import { useState } from "react"
import { useDBStore } from "@/store/use-db-store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Database,
  Settings2,
  Server,
  User,
  Key,
  Terminal,
  ChevronRight,
  Activity,
  Globe,
} from "lucide-react"

export const home_loader = async () => null

const Home = () => {
  const {
    profiles,
    activeProfileId,
    status,
    addProfile,
    removeProfile,
    selectProfile,
  } = useDBStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newProfile, setNewProfile] = useState({
    name: "",
    host: "ws://localhost:8000/rpc",
    namespace: "main",
    database: "main",
    user: "",
    pass: "",
  })

  // Start with memory profile if none exists
  const isDefaultMem = activeProfileId === null && status === "connected"

  const handleAdd = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!newProfile.name || !newProfile.host) {
      toast.error("Please fill in Name and URL")
      return
    }
    addProfile(newProfile)
    setIsAdding(false)
    setNewProfile({
      name: "",
      host: "ws://localhost:8000/rpc",
      namespace: "main",
      database: "main",
      user: "",
      pass: "",
    })
    toast.success("Connection profile added")
  }

  return (
    <div className="flex min-h-svh bg-background/50 p-6 selection:bg-primary/20">
      <div className="mx-auto w-full max-w-4xl animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-4">
        {/* Header section */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Database className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">
              SurrealManager
            </h1>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Manage your local and remote SurrealDB nodes from a unified
            interface.
          </p>
        </header>

        {/* Connection Status Card */}
        <section className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-2xl shadow-primary/5">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="h-40 w-40 stroke-[1px]" />
          </div>

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 animate-pulse rounded-full ${
                    status === "connected"
                      ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                      : status === "connecting"
                        ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                        : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                  }`}
                />
                <span className="text-sm font-medium tracking-wide capitalize">
                  {status}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Active Node
                </p>
                <h2 className="max-w-[300px] truncate font-mono text-3xl font-bold tracking-tight">
                  {isDefaultMem
                    ? "In-Memory Instance"
                    : profiles.find((p) => p.id === activeProfileId)?.name ||
                      "Not Connected"}
                </h2>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="lg"
                className="group relative gap-2 overflow-hidden rounded-2xl shadow-xl shadow-primary/20"
                onClick={() => setIsAdding(true)}
              >
                <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
                <Plus className="h-4 w-4" />
                Add Connection
              </Button>
            </div>
          </div>
        </section>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`group relative flex flex-col gap-4 rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                activeProfileId === profile.id
                  ? "border-primary/50 bg-primary/[0.03]"
                  : "bg-card/50 hover:border-border/80 hover:bg-card"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/10">
                  <Server
                    className={`h-6 w-6 ${activeProfileId === profile.id ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeProfile(profile.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg leading-tight font-bold tracking-tight">
                  {profile.name}
                </h3>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {profile.host}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 pt-4">
                <div className="flex gap-1">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tracking-tighter uppercase">
                    {profile.namespace}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tracking-tighter uppercase opacity-60">
                    {profile.database}
                  </span>
                </div>
                <Button
                  variant={
                    activeProfileId === profile.id ? "secondary" : "outline"
                  }
                  size="sm"
                  className="gap-1 rounded-xl font-bold transition-all"
                  onClick={() => selectProfile(profile.id)}
                  disabled={status === "connecting"}
                >
                  {status === "connecting" && activeProfileId === profile.id ? (
                    <Activity className="h-3 w-3 animate-spin" />
                  ) : activeProfileId === profile.id ? (
                    "Activated"
                  ) : (
                    "Connect"
                  )}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Placeholder */}
          {!isAdding && profiles.length === 0 && (
            <div
              className="group flex h-[240px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed p-8 text-center transition-all hover:bg-muted/30"
              onClick={() => setIsAdding(true)}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                <Plus className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">No saved connections</p>
                <p className="text-xs text-muted-foreground">
                  Add your first SurrealDB node
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Overlay for Adding */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-background/80 p-6 backdrop-blur-xl duration-300 fade-in">
            <div className="shadow-3xl w-full max-w-xl animate-in space-y-8 rounded-[40px] border bg-card p-10 duration-500 zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Add Connection
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configure your database node details below.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full p-0"
                  onClick={() => setIsAdding(false)}
                >
                  ×
                </Button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      <Settings2 className="h-3 w-3" /> Profile Name
                    </label>
                    <input
                      type="text"
                      placeholder="Local Cluster"
                      className="w-full rounded-2xl border bg-muted/30 p-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={newProfile.name}
                      onChange={(e) =>
                        setNewProfile({ ...newProfile, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* URL field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      <Globe className="h-3 w-3" /> Connection URL
                    </label>
                    <input
                      type="text"
                      placeholder="ws://localhost:8000/rpc"
                      className="w-full rounded-2xl border bg-muted/30 p-4 font-mono text-sm transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={newProfile.host}
                      onChange={(e) =>
                        setNewProfile({ ...newProfile, host: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      <Terminal className="h-3 w-3" /> Namespace
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border bg-muted/30 p-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={newProfile.namespace}
                      onChange={(e) =>
                        setNewProfile({
                          ...newProfile,
                          namespace: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      <Database className="h-3 w-3" /> Database Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border bg-muted/30 p-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={newProfile.database}
                      onChange={(e) =>
                        setNewProfile({
                          ...newProfile,
                          database: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      <User className="h-3 w-3" /> Username
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="w-full rounded-2xl border bg-muted/30 p-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={newProfile.user}
                      onChange={(e) =>
                        setNewProfile({ ...newProfile, user: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                      <Key className="h-3 w-3" /> Password
                    </label>
                    <input
                      type="password"
                      placeholder="Optional"
                      className="w-full rounded-2xl border bg-muted/30 p-4 font-medium transition-all focus:ring-2 focus:ring-primary/50 focus:outline-none"
                      value={newProfile.pass}
                      onChange={(e) =>
                        setNewProfile({ ...newProfile, pass: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="h-14 flex-1 rounded-2xl font-bold shadow-2xl shadow-primary/20"
                  >
                    Save Connection Profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 rounded-2xl border-border/50 bg-background/50 px-8 font-bold backdrop-blur"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
