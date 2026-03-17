import { ThemeProvider } from "~/providers/theme-provider";

export function SplashScreen() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse font-sans">
            Initializing app...
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
}
