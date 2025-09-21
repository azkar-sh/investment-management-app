"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { updateSettings, type SettingsState } from "@/lib/profile-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Globe, Shield, Sun, Save } from "lucide-react";

type InitialSettings = {
  theme?: string | null;
  compact_mode?: boolean | null;
  email_notifications?: boolean | null;
  price_alerts?: boolean | null;
  weekly_summary?: boolean | null;
  default_currency?: string | null;
  date_format?: string | null;
  session_timeout?: number | null;
};

export default function SettingsForm({
  initial,
}: {
  initial: InitialSettings;
}) {
  const initialState: SettingsState = {};
  const [state, formAction, pending] = useActionState(
    updateSettings,
    initialState
  );

  // next-themes
  const { setTheme: applyTheme, resolvedTheme } = useTheme();

  // mounted guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [theme, setThemeState] = useState(
    initial.theme ?? resolvedTheme ?? "system"
  );
  const [compactMode, setCompactMode] = useState(
    Boolean(initial.compact_mode ?? false)
  );
  const [emailNotifs, setEmailNotifs] = useState(
    Boolean(initial.email_notifications ?? true)
  );
  const [priceAlerts, setPriceAlerts] = useState(
    Boolean(initial.price_alerts ?? true)
  );
  const [weeklySummary, setWeeklySummary] = useState(
    Boolean(initial.weekly_summary ?? true)
  );
  const [currency, setCurrency] = useState(initial.default_currency ?? "USD");
  const [dateFormat, setDateFormat] = useState(
    initial.date_format ?? "MM/DD/YYYY"
  );
  const [sessionTimeout, setSessionTimeout] = useState(
    String(initial.session_timeout ?? 30)
  );

  if (!mounted) return null;

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs supaya nilai benar terkirim ke server action */}
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="compactMode" value={compactMode ? "on" : ""} />
      <input
        type="hidden"
        name="emailNotifications"
        value={emailNotifs ? "on" : ""}
      />
      <input type="hidden" name="priceAlerts" value={priceAlerts ? "on" : ""} />
      <input
        type="hidden"
        name="weeklySummary"
        value={weeklySummary ? "on" : ""}
      />
      <input type="hidden" name="defaultCurrency" value={currency} />
      <input type="hidden" name="dateFormat" value={dateFormat} />
      <input type="hidden" name="sessionTimeout" value={sessionTimeout} />

      {/* Banner status */}
      {state.success && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
          Settings saved!
        </div>
      )}
      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" /> Appearance
          </CardTitle>
          <CardDescription>
            Customize how the app looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={(v) => {
                applyTheme(v as "light" | "dark" | "system"); // next-themes
                setThemeState(v); // update hidden input
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use a more compact layout to fit more content
              </p>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive updates about your investments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your portfolio
              </p>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Price Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your investments hit target prices
              </p>
            </div>
            <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your portfolio performance
              </p>
            </div>
            <Switch
              checked={weeklySummary}
              onCheckedChange={setWeeklySummary}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Preferences
          </CardTitle>
          <CardDescription>
            Set your regional and display preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Default Currency</Label>
              <p className="text-sm text-muted-foreground">
                Currency used for new investments
              </p>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="IDR">IDR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Date Format</Label>
              <p className="text-sm text-muted-foreground">
                How dates are displayed throughout the app
              </p>
            </div>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </CardTitle>
          <CardDescription>
            Manage your account security and privacy settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sign out after inactivity
              </p>
            </div>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15m</SelectItem>
                <SelectItem value="30">30m</SelectItem>
                <SelectItem value="60">1h</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Enable
            </Button>
          </div>

          <Button type="button" variant="destructive" size="sm">
            Change Password
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={pending}
        >
          <Save className="mr-2 h-4 w-4" />
          {pending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
