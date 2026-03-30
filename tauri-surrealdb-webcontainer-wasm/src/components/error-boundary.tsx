import { useRouteError, isRouteErrorResponse } from "react-router"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"

export const ErrorBoundary = () => {
  const error = useRouteError()

  let errorMessage = "An unexpected error occurred."
  let errorStatus = 500
  let errorData = null

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText || errorMessage
    errorStatus = error.status
    errorData = error.data
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  return (
    <div className="flex h-svh w-full items-center justify-center p-6 bg-background text-foreground selection:bg-red-500/10 selection:text-red-500">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/10 duration-[3000ms]" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-2xl shadow-red-500/10">
            <AlertCircle className="h-8 w-8" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              {errorMessage}
            </p>
          </div>
          {errorStatus !== 500 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground border">
              ERROR_{errorStatus}
            </span>
          )}
        </div>

        <div className="flex w-full items-center gap-3">
          <Button 
            className="flex-1 gap-2 shadow-lg shadow-primary/20"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2 border-border/50 bg-background/50 backdrop-blur-sm"
            onClick={() => window.location.assign("/")}
          >
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </div>

        {errorData && (
          <div className="w-full overflow-hidden rounded-xl border bg-muted/30 p-4 backdrop-blur-sm">
            <pre className="overflow-x-auto text-[10px] leading-relaxed text-muted-foreground font-mono">
              {JSON.stringify(errorData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorBoundary
