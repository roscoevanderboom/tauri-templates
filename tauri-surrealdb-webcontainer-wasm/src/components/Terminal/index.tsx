import React, { useEffect, useRef, useMemo } from "react"
import { Terminal as XTerminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { WebContainer, type WebContainerProcess } from "@webcontainer/api"
import { useTheme } from "@/components/theme-provider"
import { webcontainerInstance } from "@/lib/webcontainer"
import { resolveCustomCommand } from "./commands"

export const Terminal: React.FC = () => {
  const { theme } = useTheme()
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const shellProcessRef = useRef<WebContainerProcess | null>(null)

  const effectiveTheme = useMemo(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }
    return theme
  }, [theme])

  const terminalTheme = useMemo(() => {
    return effectiveTheme === "dark"
      ? {
          background: "#09090b",
          foreground: "#e4e4e7",
          cursor: "#e4e4e7",
          selectionBackground: "#3f3f46",
          selectionForeground: "#ffffff",
        }
      : {
          background: "#ffffff",
          foreground: "#09090b",
          cursor: "#09090b",
          selectionBackground: "#e4e4e7",
          selectionForeground: "#000000",
          cursorAccent: "#ffffff",
        }
  }, [effectiveTheme])

  // Initialize xterm and start the shell in a single effect so they are
  // sequenced — no race between two separate effects on the same mount cycle.
  // webcontainerInstance is a module-level singleton (never changes), so the
  // dep array is intentionally empty.
  useEffect(() => {
    if (!terminalRef.current) return

    const term = new XTerminal({
      cursorBlink: true,
      theme: terminalTheme,
      fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      convertEol: true,
      allowProposedApi: true,
      cursorStyle: "bar",
      drawBoldTextInBrightColors: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddonRef.current = fitAddon
    term.open(terminalRef.current)

    // Fit needs a brief delay to read the parent container's rendered size.
    const fitTimer = setTimeout(() => {
      try {
        fitAddon.fit()
      } catch (err) {
        console.warn("[Terminal] Initial fit failed:", err)
      }
    }, 50)

    xtermRef.current = term

    const handleResize = () => {
      try {
        fitAddon.fit()
        shellProcessRef.current?.resize({ cols: term.cols, rows: term.rows })
      } catch (err) {
        console.warn("[Terminal] Resize failed:", err)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (terminalRef.current?.offsetParent) handleResize()
    })
    resizeObserver.observe(terminalRef.current)
    window.addEventListener("resize", handleResize)

    // Start the shell immediately after xterm is ready — same effect, no race.
    startShell(term, webcontainerInstance)
      .then((process) => {
        shellProcessRef.current = process
        try {
          fitAddon.fit()
          process.resize({ cols: term.cols, rows: term.rows })
        } catch (err) {
          console.warn("[Terminal] Post-shell fit failed:", err)
        }
      })
      .catch((err) => {
        console.error("[Terminal] Failed to start shell:", err)
        term.writeln("\r\n\x1b[31mFailed to start shell. Is the WebContainer running?\x1b[0m")
      })

    return () => {
      clearTimeout(fitTimer)
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
      shellProcessRef.current?.kill()
      shellProcessRef.current = null
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = terminalTheme
    }
  }, [terminalTheme])

  return (
    <div
      ref={terminalRef}
      className="h-full w-full p-2"
      style={{ backgroundColor: terminalTheme.background }}
    />
  )
}

async function startShell(terminal: XTerminal, instance: WebContainer) {
  const shellProcess = await instance.spawn("jsh", {
    terminal: { cols: terminal.cols, rows: terminal.rows },
  })

  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data)
      },
    })
  )

  const input = shellProcess.input.getWriter()

  let lineBuffer = ""
  terminal.onData((data) => {
    if (data === "\r") {
      // Enter — check for custom command aliases before passing to jsh
      const resolved = resolveCustomCommand(lineBuffer)
      lineBuffer = ""
      if (resolved !== null) {
        // Ctrl+U clears the current jsh input line, then write the real command
        input.write(`\x15${resolved}\r`)
      } else {
        input.write(data)
      }
    } else if (data === "\x7f") {
      // Backspace
      if (lineBuffer.length > 0) lineBuffer = lineBuffer.slice(0, -1)
      input.write(data)
    } else if (data === "\x15") {
      // Ctrl+U — clear line buffer to stay in sync with jsh
      lineBuffer = ""
      input.write(data)
    } else {
      lineBuffer += data
      input.write(data)
    }
  })

  // Final size sync after jsh has fully initialized
  setTimeout(() => {
    shellProcess.resize({ cols: terminal.cols, rows: terminal.rows })
  }, 100)

  return shellProcess
}
