import { createHashRouter } from "react-router"
import { TerminalIcon } from "lucide-react"
import { lazy, Suspense } from "react"
import Root, { root_loader } from "@/routes/root"
import ErrorBoundary from "./components/error-boundary"
import HydrationElement from "./components/hydration-element"

const IDE = lazy(() => import("@/routes/ide"))

export const ui_routes = [
  {
    title: "IDE",
    path: "/ide",
    icon: <TerminalIcon size={14} />,
  },
]

export const router = createHashRouter([
  {
    path: "/",
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <HydrationElement />,
    element: <Root />,
    loader: root_loader,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<HydrationElement />}>
            <IDE />
          </Suspense>
        ),
      },
    ],
  },
])
