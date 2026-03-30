import { Surreal, createRemoteEngines } from "surrealdb"
import { createWasmEngines } from "@surrealdb/wasm"

export const db = new Surreal({
  engines: {
    ...createRemoteEngines(),
    ...createWasmEngines(),
  },
})
