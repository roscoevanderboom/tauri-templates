import { WebContainer } from "@webcontainer/api"

export const webcontainerInstance = await WebContainer.boot({
  workdirName: "root",
})
