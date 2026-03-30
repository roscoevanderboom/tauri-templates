/**
 * Custom terminal command definitions.
 * Each command has a `match` function that receives the raw input line
 * and returns the shell command string to execute, or null if it doesn't match.
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
