import React, { useState, useEffect } from "react"
import { webcontainerInstance } from "@/lib/webcontainer"
import { parseWebcontainerFS } from "@/utils/webcontainer-utils"
import {
  FolderIcon,
  FileIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FilesIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FSMetadata } from "@/types/fs"

interface FileNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileNode[]
}

const FileExplorer: React.FC = () => {
  const [tree, setTree] = useState<FileNode[]>([])
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["/"])
  )
  const [loading, setLoading] = useState(true)

  const refreshTree = async () => {
    if (!webcontainerInstance) return
    try {
      const metadata = await parseWebcontainerFS(webcontainerInstance)
      const nested = nestMetadata(metadata)
      setTree(nested)
    } catch (error) {
      console.error("Failed to refresh file tree:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTree()

    if (!webcontainerInstance) return

    // Watch for FS changes and refresh
    let debounceTimer: ReturnType<typeof setTimeout>
    webcontainerInstance.fs.watch("/", { recursive: true }, () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(refreshTree, 500)
    })

    return () => {
      clearTimeout(debounceTimer)
    }
  }, [])

  const toggleFolder = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedPaths.has(node.path)
    const isDirectory = node.type === "directory"

    return (
      <div key={node.path} className="flex flex-col">
        <div
          className={cn(
            "group flex cursor-pointer items-center gap-1.5 rounded-sm py-1 pr-2 transition-colors hover:bg-accent/50",
            level > 0 && "ml-3"
          )}
          onClick={() => isDirectory && toggleFolder(node.path)}
        >
          <div className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground/50">
            {isDirectory ? (
              isExpanded ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronRightIcon size={12} />
              )
            ) : null}
          </div>

          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {isDirectory ? (
              <FolderIcon
                size={14}
                className={cn(
                  "shrink-0",
                  isExpanded ? "text-primary/70" : "text-muted-foreground/60"
                )}
              />
            ) : (
              <FileIcon
                size={14}
                className="shrink-0 text-muted-foreground/40"
              />
            )}
            <span
              className={cn(
                "text-[12px] tracking-tight selection:bg-transparent",
                isDirectory
                  ? "font-medium text-foreground/80"
                  : "text-foreground/70"
              )}
            >
              {node.name}
            </span>
          </div>
        </div>

        {isDirectory && isExpanded && node.children && (
          <div className="ml-[11px] flex flex-col border-l border-border/40">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 flex h-full flex-col overflow-y-auto bg-background/30 px-2 py-4 select-none">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-muted-foreground/80">
          <FilesIcon size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Explorer
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex animate-pulse flex-col gap-2 px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-muted/20" />
          ))}
        </div>
      )}

      {!loading && tree.map((node) => renderNode(node))}

      {!loading && tree.length === 0 && (
        <div className="mt-10 px-4 text-center">
          <p className="text-[10px] leading-relaxed text-muted-foreground/40 italic">
            Empty project workspace
          </p>
        </div>
      )}
    </div>
  )
}

function nestMetadata(metadata: FSMetadata[]): FileNode[] {
  const map: Record<string, FileNode> = {}
  const root: FileNode[] = []

  // Create nodes for all metadata entries
  metadata.forEach((node) => {
    const newNode: FileNode = {
      name: node.name,
      path: node.path as string,
      type: node.node_type,
      children: node.node_type === "directory" ? [] : undefined,
    }
    map[node.path as string] = newNode
  })

  // Build the tree structure
  metadata.forEach((node) => {
    const parts = node.path.split("/").filter(Boolean)
    const newNode = map[node.path as string]

    if (parts.length === 1) {
      root.push(newNode)
    } else {
      const parentPath = "/" + parts.slice(0, -1).join("/")
      if (map[parentPath]) {
        map[parentPath].children?.push(newNode)
      } else {
        root.push(newNode)
      }
    }
  })

  // Sort function: Directories first, then files, then alphabetically
  const sortFunc = (a: FileNode, b: FileNode) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  }

  // Recursive sort helper
  const recursiveSort = (nodes: FileNode[]) => {
    nodes.sort(sortFunc)
    nodes.forEach((node) => {
      if (node.children) {
        recursiveSort(node.children)
      }
    })
  }

  recursiveSort(root)
  return root
}

export default FileExplorer
