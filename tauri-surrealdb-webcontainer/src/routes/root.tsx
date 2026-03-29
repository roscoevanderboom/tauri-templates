import { Outlet } from "react-router"
import Titlebar from "@/components/Titlebar"
import Footer from "@/components/Footer"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useWebContainerStore } from "@/store/webcontainer-store"

const currentWindow = getCurrentWindow()

export const root_loader = async () => {
  await currentWindow.show()
  await currentWindow.maximize()
  await currentWindow.setFocus()
  await useWebContainerStore.getState().init()
}

function Root() {
  const isInitialized = useWebContainerStore((state) => state.isInitialized)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <Titlebar />
      <div className="relative flex-1 overflow-hidden bg-background">
        {!isInitialized && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="animate-pulse text-sm text-muted-foreground">
                Booting WebContainer environment...
              </p>
            </div>
          </div>
        )}
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default Root
