import { Moon, Sun } from "lucide-react"
import { useTheme } from "../providers/theme-provider"
import { Button } from "./ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative size-10 rounded-full border-2 transition-all duration-500 hover:scale-110 active:scale-95 bg-background shadow-sm overflow-hidden"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 dark:translate-y-10">
        <Sun className="h-5 w-5 text-orange-500 fill-orange-200" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 -translate-y-10 dark:translate-y-0">
        <Moon className="h-5 w-5 text-blue-400 fill-blue-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
