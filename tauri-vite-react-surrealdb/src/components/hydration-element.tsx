import { Loader2 } from "lucide-react"

export const HydrationElement = () => {
  return (
    <div className="flex h-svh w-full items-center justify-center bg-background text-foreground animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <Loader2 className="h-full w-full animate-spin text-primary opacity-20" />
          <Loader2 className="absolute h-full w-full animate-spin text-primary [animation-duration:1.5s]" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-sm font-medium tracking-tight">Initializing Database</h2>
          <p className="text-xs text-muted-foreground">Please wait a moment...</p>
        </div>
      </div>
    </div>
  )
}

export default HydrationElement
