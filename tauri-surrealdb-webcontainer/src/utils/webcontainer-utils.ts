import type { FSMetadata } from "@/types/fs"
import { type FileSystemTree, WebContainer } from "@webcontainer/api"

export const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  ".DS_Store",
  "target",
  "build",
  "dist",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  ".next",
]

export const isIgnored = (name: string) => {
  return IGNORED_DIRECTORIES.some((dir) => name === dir || name.includes(dir))
}

/**
 * Converts a flattened array of FSMetadata into a nested FileSystemTree for WebContainer
 */
export function metadataToTree(metadata: FSMetadata[]): FileSystemTree {
  const tree: FileSystemTree = {}

  const sorted = [...metadata].sort(
    (a, b) => a.path.split("/").length - b.path.split("/").length
  )

  for (const node of sorted) {
    const parts = node.path.split("/").filter(Boolean)
    let current: FileSystemTree = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1

      if (isLast) {
        if (node.node_type === "file") {
          current[part] = { file: { contents: node.content || "" } }
        } else {
          current[part] = { directory: {} }
        }
      } else {
        if (!current[part]) {
          current[part] = { directory: {} }
        }
        current = (current[part] as { directory: FileSystemTree }).directory
      }
    }
  }

  return tree
}


/**
 * Recursively reads the WebContainer filesystem and converts it to FSMetadata[]
 */
export async function parseWebcontainerFS(
  wc: WebContainer,
  dir: string = "/"
): Promise<FSMetadata[]> {
  const metadata: FSMetadata[] = []
  const entries = await wc.fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const path = dir === "/" ? `/${entry.name}` : `${dir}/${entry.name}`

    // Skip ignored files/directories
    if (isIgnored(entry.name)) continue

    if (entry.isDirectory()) {
      metadata.push({
        id: path,
        name: entry.name,
        path,
        node_type: "directory",
        extension: "",
        is_component: false,
        timestamp: new Date().toISOString(),
        size: 0,
        line_count: 0,
        content: "",
      })
      const children = await parseWebcontainerFS(wc, path)
      metadata.push(...children)
    } else {
      const content = await wc.fs.readFile(path, "utf-8")
      const ext = entry.name.includes(".") ? entry.name.split(".").pop()! : ""
      metadata.push({
        id: path,
        name: entry.name,
        path,
        node_type: "file",
        extension: ext,
        is_component:
          (ext === "tsx" || ext === "jsx" || ext === "js") &&
          entry.name[0] === entry.name[0].toUpperCase(),
        timestamp: new Date().toISOString(),
        size: content.length,
        line_count: content.split("\n").length,
        content,
      })
    }
  }

  return metadata
}
