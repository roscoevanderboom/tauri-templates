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
  const shellStartedRef = useRef<boolean>(false)

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

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

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

    // Delay opening a tiny bit or just ensure fit after open
    term.open(terminalRef.current)

    // Fit needs a small delay sometimes to get the parent container size after mount
    setTimeout(() => {
      try {
        fitAddon.fit()
      } catch (e) {}
    }, 50)

    xtermRef.current = term

    const handleResize = () => {
      try {
        fitAddon.fit()
        if (shellProcessRef.current) {
          shellProcessRef.current.resize({
            cols: term.cols,
            rows: term.rows,
          })
        }
      } catch (e) {}
    }

    const resizeObserver = new ResizeObserver(() => {
      if (terminalRef.current?.offsetParent) {
        handleResize()
      }
    })

    resizeObserver.observe(terminalRef.current)
    window.addEventListener("resize", handleResize)

    return () => {
      term.dispose()
      resizeObserver.disconnect()
      window.removeEventListener("resize", handleResize)
      xtermRef.current = null
      shellStartedRef.current = false
      if (shellProcessRef.current) {
        shellProcessRef.current.kill()
        shellProcessRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = terminalTheme
    }
  }, [terminalTheme])

  useEffect(() => {
    if (webcontainerInstance && xtermRef.current && !shellStartedRef.current) {
      shellStartedRef.current = true
      startShell(xtermRef.current, webcontainerInstance).then((process) => {
        shellProcessRef.current = process
        if (fitAddonRef.current) {
          try {
            fitAddonRef.current.fit()
            process.resize({
              cols: xtermRef.current!.cols,
              rows: xtermRef.current!.rows,
            })
          } catch (e) {}
        }
      })
    }
  }, [webcontainerInstance])

  return (
    <div
      ref={terminalRef}
      className="h-full w-full p-2"
      style={{
        backgroundColor: terminalTheme.background,
      }}
    />
  )
}

async function startShell(terminal: XTerminal, instance: WebContainer) {
  const shellProcess = await instance.spawn("jsh", {
    terminal: {
      cols: terminal.cols,
      rows: terminal.rows,
    },
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
      // Enter pressed — check for custom command
      const resolved = resolveCustomCommand(lineBuffer)
      lineBuffer = ""
      if (resolved !== null) {
        // Ctrl+U erases the current jsh line, then write real command
        input.write(`\x15${resolved}\r`)
      } else {
        input.write(data)
      }
    } else if (data === "\x7f") {
      // Backspace
      if (lineBuffer.length > 0) lineBuffer = lineBuffer.slice(0, -1)
      input.write(data)
    } else if (data === "\x15") {
      // Ctrl+U — clear line
      lineBuffer = ""
      input.write(data)
    } else {
      lineBuffer += data
      input.write(data)
    }
  })

  // Synchronize size one more time after start
  setTimeout(() => {
    shellProcess.resize({
      cols: terminal.cols,
      rows: terminal.rows,
    })
  }, 100)

  return shellProcess
}
