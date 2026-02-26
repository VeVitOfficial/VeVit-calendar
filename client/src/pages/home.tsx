import { format, isAfter, isToday } from "date-fns";
import { CalendarIcon, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";

const colorMap: Record<string, string> = {
  primary: "bg-primary text-white",
  blue: "bg-blue-500 text-white",
  green: "bg-emerald-500 text-white",
  orange: "bg-orange-500 text-white",
  pink: "bg-pink-500 text-white",
};

export default function Home() {
  const { data: events = [], isLoading } = useEvents();

  const upcomingEvents = events
    .filter(e => isAfter(new Date(e.date), new Date()) || isToday(new Date(e.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-8">
      <div className="max-w-5xl mx-auto space-y-12 mt-8">
        
        {/* Hero Section */}
        <section className="space-y-4 relative">
          <div className="absolute top-0 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight">
            Good morning, <br/>
            <span className="text-gradient">Ready to plan your day?</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Manage your schedule, track important meetings, and stay organized with VeVit calendar.
          </p>
          <div className="pt-4 flex gap-4">
            <Link href="/calendar">
              <Button className="rounded-xl px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                Open Calendar
              </Button>
            </Link>
            <Button variant="outline" className="rounded-xl px-8 py-6 text-lg border-white/10 hover:bg-white/5 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 mr-2" />
              Quick Actions
            </Button>
          </div>
        </section>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Upcoming Events Card */}
          <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Upcoming Events
              </h2>
              <Link href="/calendar" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />
                ))
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5 border-dashed">
                  <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">No upcoming events found.</p>
                </div>
              ) : (
                upcomingEvents.map(event => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  >
                    <div className="flex-none text-center px-4 border-r border-white/10">
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        {format(new Date(event.date), "MMM")}
                      </div>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {format(new Date(event.date), "dd")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        {!event.isAllDay && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.date), "h:mm a")}
                          </span>
                        )}
                        {event.isAllDay && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs">All Day</span>
                        )}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full shadow-md flex-none ${colorMap[event.color] || colorMap.primary}`} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats / Info Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
            <h2 className="font-display text-xl font-bold mb-6">Overview</h2>
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="text-3xl font-display font-bold text-primary mb-1">
                  {events.filter(e => isToday(new Date(e.date))).length}
                </div>
                <div className="text-sm font-medium text-primary/80">Events Today</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-3xl font-display font-bold text-foreground mb-1">
                  {upcomingEvents.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Upcoming this week</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
