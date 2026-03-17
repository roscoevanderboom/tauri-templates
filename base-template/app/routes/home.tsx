import { Button } from "~/components/ui/button"
import { ModeToggle } from "~/components/mode-toggle"

export default function Home() {
  return (
    <div className="flex min-h-svh p-6 items-center justify-center">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project ready!</h1>
          <p className="text-muted-foreground mt-2">
            You may now add components and start building. Theme provider and mode toggle are set up.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button>Click me</Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
