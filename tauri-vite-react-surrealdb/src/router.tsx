import { createHashRouter } from "react-router"
import Root, { root_loader } from "./routes/root"
import Home, { home_loader } from "./routes/home"
import { HydrationElement } from "./components/hydration-element"
import { ErrorBoundary } from "./components/error-boundary"

export const router = createHashRouter([
  {
    path: "/",
    id: "root",
    loader: root_loader,
    element: <Root />,
    hydrateFallbackElement: <HydrationElement />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        id: "home",
        index: true,
        element: <Home />,
        loader: home_loader,
      },
    ],
  },
])
