import { createContext, useContext, useEffect, useState } from "react"
import { setTheme } from "@tauri-apps/api/app"
import { getCurrentWindow } from "@tauri-apps/api/window"

type Theme = "dark" | "light" | "system"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(
    () => (typeof window !== "undefined" ? (localStorage.getItem(storageKey) as Theme) : defaultTheme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    const applyTheme = async (currentTheme: Theme) => {
      if (currentTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"

        root.classList.add(systemTheme)
        await setTheme(null)
        return
      }

      root.classList.add(currentTheme)
      await setTheme(currentTheme)
    }

    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault()
        setThemeState((prevTheme) => {
          const currentTheme =
            prevTheme === "system"
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
              : prevTheme
          const nextTheme = currentTheme === "dark" ? "light" : "dark"
          localStorage.setItem(storageKey, nextTheme)
          return nextTheme
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [storageKey])

  useEffect(() => {
    let unlisten: (() => void) | undefined

    if (theme === "system") {
      const setup = async () => {
        unlisten = await getCurrentWindow().onThemeChanged(({ payload: newTheme }) => {
          const root = window.document.documentElement
          root.classList.remove("light", "dark")
          root.classList.add(newTheme)
        })
      }
      setup()
    }

    return () => {
      if (unlisten) unlisten()
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setThemeState(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
