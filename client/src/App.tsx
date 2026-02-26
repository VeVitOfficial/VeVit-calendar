import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";

import { AppSidebar } from "@/components/app-sidebar";
import Home from "@/pages/home";
import CalendarPage from "@/pages/calendar";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Enforce dark mode on the whole app per the VeVit design style */}
        <div className="dark min-h-screen bg-background text-foreground flex w-full">
          <SidebarProvider style={style}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Router />
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
