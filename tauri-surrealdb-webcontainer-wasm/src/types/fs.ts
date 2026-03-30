import type { RecordId } from "surrealdb";

export interface FSTree {
  id: RecordId;
  name: string;
  loaded: boolean;
  createdAt: string;
  tree: FSMetadata[];
  [x: string]: unknown;
}

export interface FSMetadata {
  id: string | RecordId;
  name: string;
  path: string;
  node_type: "file" | "directory";
  extension?: string;
  is_component?: boolean;
  timestamp: string;
  size?: number;
  line_count?: number;
  content?: string;
}
