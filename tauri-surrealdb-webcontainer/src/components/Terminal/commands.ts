/**
 * Custom terminal command definitions.
 * Each command exports a `match` regex/function and a `resolve` function
 * that returns the actual shell command string to execute.
 */

interface CustomCommand {
  match: (line: string) => string | null
}

const COMMANDS: CustomCommand[] = [
  {
    // delete {path}  →  rm -rf {path}
    match: (line) => {
      const m = line.match(/^delete\s+(.+)$/)
      return m ? `rm -rf ${m[1]}` : null
    },
  },
]

/**
 * If `line` matches a custom command, returns the shell equivalent.
 * Otherwise returns null.
 */
export function resolveCustomCommand(line: string): string | null {
  for (const cmd of COMMANDS) {
    const resolved = cmd.match(line.trim())
    if (resolved !== null) return resolved
  }
  return null
}
