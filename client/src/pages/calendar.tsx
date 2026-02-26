import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/event-dialog";
import { useEvents } from "@/hooks/use-events";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  primary: "bg-primary/20 text-primary border-primary/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events = [], isLoading } = useEvents();

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* Header */}
      <header className="flex-none px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-1 bg-black/20 rounded-xl p-1 border border-white/5">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={today} className="h-8 px-4 rounded-lg hover:bg-white/10 font-medium">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg hover:bg-white/10">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedEvent(null);
            setIsDialogOpen(true);
          }}
          className="rounded-xl px-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Event
        </Button>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden">
            {daysInMonth.map((day, idx) => {
              const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[100px] p-2 border-r border-b border-white/5 transition-colors cursor-pointer group",
                    !isCurrentMonth && "bg-black/20 opacity-50",
                    "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all",
                        isTodayDate 
                          ? "bg-primary text-white shadow-md shadow-primary/30" 
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[80px] pr-1">
                    {isLoading ? (
                      <div className="h-6 w-full animate-pulse bg-white/5 rounded-md" />
                    ) : (
                      dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(e, event)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-md truncate font-medium border cursor-pointer hover:opacity-80 transition-opacity",
                            colorMap[event.color] || colorMap.primary
                          )}
                        >
                          {!event.isAllDay && (
                            <span className="mr-1 opacity-70">{format(new Date(event.date), "HH:mm")}</span>
                          )}
                          {event.title}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EventDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        event={selectedEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}
