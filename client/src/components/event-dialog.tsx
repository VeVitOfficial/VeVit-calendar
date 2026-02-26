import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Trash2 } from "lucide-react";
import { api } from "@shared/routes";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const colors = [
  { id: "primary", hex: "bg-primary" },
  { id: "blue", hex: "bg-blue-500" },
  { id: "green", hex: "bg-emerald-500" },
  { id: "orange", hex: "bg-orange-500" },
  { id: "pink", hex: "bg-pink-500" },
];

const formSchema = api.events.create.input.extend({
  date: z.date(),
  endDate: z.date().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any; // Existing event if editing
  defaultDate?: Date;
}

export function EventDialog({ open, onOpenChange, event, defaultDate }: EventDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const isEditing = !!event;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: defaultDate || new Date(),
      endDate: null,
      isAllDay: false,
      color: "primary",
    },
  });

  useEffect(() => {
    if (open) {
      if (event) {
        form.reset({
          title: event.title,
          description: event.description || "",
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : null,
          isAllDay: event.isAllDay,
          color: event.color,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          date: defaultDate || new Date(),
          endDate: null,
          isAllDay: false,
          color: "primary",
        });
      }
    }
  }, [open, event, defaultDate, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: event.id, ...data });
        toast({ title: "Event updated successfully" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Event created successfully" });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error saving event", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteMutation.mutateAsync(event.id);
      toast({ title: "Event deleted successfully" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error deleting event", description: err.message, variant: "destructive" });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-white/10 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <DialogTitle className="font-display text-2xl">
            {isEditing ? "Edit Event" : "New Event"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Event Title" 
                      className="text-lg font-medium border-0 border-b border-white/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-black/20 border-white/10 rounded-xl hover:bg-black/40",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass-panel border-white/10 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-transparent text-foreground"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAllDay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 mt-auto h-[42px]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <FormLabel className="text-sm cursor-pointer">All Day</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details..." 
                      className="resize-none bg-black/20 border-white/10 rounded-xl min-h-[100px] focus-visible:ring-primary/50"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Color Label</FormLabel>
                  <FormControl>
                    <div className="flex gap-3 mt-2">
                      {colors.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => field.onChange(c.id)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all duration-300 ring-offset-2 ring-offset-background",
                            c.hex,
                            field.value === c.id ? "ring-2 ring-white scale-110 shadow-lg shadow-white/20" : "opacity-70 hover:opacity-100 hover:scale-105"
                          )}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t border-white/5 flex items-center justify-between sm:justify-between w-full">
              {isEditing ? (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              ) : (
                <div /> // Spacer
              )}
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
