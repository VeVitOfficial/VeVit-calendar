import { Settings as SettingsIcon, Bell, Shield, Paintbrush, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="flex-1 overflow-auto bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8 mt-4">
        
        <header>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and application settings.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Nav for Settings */}
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10 font-medium">
              <SettingsIcon className="w-4 h-4 mr-3" />
              General
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Paintbrush className="w-4 h-4 mr-3" />
              Appearance
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4 mr-3" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Shield className="w-4 h-4 mr-3" />
              Privacy & Security
            </Button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 space-y-6">
            
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold font-display">Theme Preferences</h3>
                <p className="text-sm text-muted-foreground mt-1">Customize the look and feel of your calendar.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Dark Mode</div>
                    <div className="text-sm text-muted-foreground">Enable dark mode for the entire application.</div>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Compact View</div>
                    <div className="text-sm text-muted-foreground">Show more events per day in the calendar grid.</div>
                  </div>
                  <Switch checked={false} />
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold font-display">Calendar Defaults</h3>
                <p className="text-sm text-muted-foreground mt-1">Set your standard preferences for new events.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Default Duration</div>
                    <div className="text-sm text-muted-foreground">Standard length for new meetings.</div>
                  </div>
                  <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>30 minutes</option>
                    <option selected>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Start of Week</div>
                    <div className="text-sm text-muted-foreground">Which day should the calendar start on.</div>
                  </div>
                  <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option selected>Sunday</option>
                    <option>Monday</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                Save Preferences
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
