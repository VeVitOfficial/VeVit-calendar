import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CalendarPage from "@/pages/calendar";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Enforce dark mode on the whole app per the VeVit design style */}
        <div className="dark min-h-screen bg-background text-foreground flex w-full">
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <CalendarPage />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
