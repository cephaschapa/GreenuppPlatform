/**
 * Hazard & Pest Alerts: list active alerts (with filters) and subscription settings.
 * Data from alert_events table via GET /api/alerts/me and GET /api/alerts/events.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, Droplets, Flame, Wind, Bug, CloudRain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const EVENT_TYPES = [
  "flood",
  "drought",
  "storm",
  "heat",
  "extreme_rain",
  "pest_outbreak",
  "disease_risk",
  "advisory",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

interface AlertEvent {
  id: string;
  eventType: string;
  hazardClass: string;
  severity: number;
  headline: string;
  summary: string | null;
  province: string | null;
  district: string | null;
  startAt: string | null;
  endAt: string | null;
  recommendedActions: string[] | null;
  sourceName: string;
  status: string;
}

interface AlertSubscription {
  id: number;
  scope: string;
  eventTypes: string[];
  minSeverity: number;
  digestMode: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  enabled: boolean;
}

interface AlertsMeResponse {
  subscription: AlertSubscription | null;
  events: AlertEvent[];
}

function eventIcon(eventType: string) {
  switch (eventType) {
    case "flood":
    case "extreme_rain":
      return <Droplets className="h-4 w-4" />;
    case "heat":
      return <Flame className="h-4 w-4" />;
    case "storm":
      return <Wind className="h-4 w-4" />;
    case "pest_outbreak":
    case "disease_risk":
      return <Bug className="h-4 w-4" />;
    default:
      return <CloudRain className="h-4 w-4" />;
  }
}

function severityLabel(severity: number) {
  if (severity >= 4) return "High";
  if (severity >= 3) return "Medium";
  return "Low";
}

function severityColor(severity: number) {
  if (severity >= 4) return "destructive";
  if (severity >= 3) return "default";
  return "secondary";
}

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("");
  const [filterMinSeverity, setFilterMinSeverity] = useState(1);

  const { data, isLoading, error } = useQuery<AlertsMeResponse>({
    queryKey: ["/api/alerts/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/alerts/me");
      return res.json();
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async (payload: Partial<AlertSubscription>) => {
      const res = await apiRequest("POST", "/api/alerts/subscriptions", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/me"] });
    },
  });

  const patchSubscription = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/alerts/subscriptions/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/me"] });
    },
  });

  const sub = data?.subscription ?? null;
  let events = data?.events ?? [];
  if (filterType) events = events.filter((e) => e.eventType === filterType);
  events = events.filter((e) => e.severity >= filterMinSeverity);

  const isSaving = updateSubscription.isPending || patchSubscription.isPending;

  const saveSubscription = (updates: Partial<AlertSubscription>) => {
    if (sub) {
      patchSubscription.mutate({ id: sub.id, payload: updates });
    } else {
      updateSubscription.mutate(updates);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-7 w-7" />
            Hazard & Pest Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Weather, climate, and pest alerts for your location. Manage what you receive below.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription settings */}
          <Card>
            <CardHeader>
              <CardTitle>Alert settings</CardTitle>
              <CardDescription>Control which alerts you receive and when.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="alerts-enabled">Alerts enabled</Label>
                <div className="flex items-center gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <Switch
                    id="alerts-enabled"
                    checked={sub?.enabled ?? true}
                    onCheckedChange={(checked) => saveSubscription({ enabled: checked })}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div>
                <Label>Minimum severity (1–5)</Label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Button
                      key={s}
                      variant={sub?.minSeverity === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => saveSubscription({ minSeverity: s })}
                      disabled={isSaving}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Only alerts at or above this level will be sent.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Quiet hours start (0–23)</Label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="w-full mt-1 rounded border px-2 py-1 text-sm"
                    placeholder="e.g. 22"
                    value={sub?.quietHoursStart ?? ""}
                    onChange={(e) =>
                      saveSubscription({
                        quietHoursStart: e.target.value === "" ? null : parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Quiet hours end (0–23)</Label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    className="w-full mt-1 rounded border px-2 py-1 text-sm"
                    placeholder="e.g. 6"
                    value={sub?.quietHoursEnd ?? ""}
                    onChange={(e) =>
                      saveSubscription({
                        quietHoursEnd: e.target.value === "" ? null : parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Quiet hours use Africa/Lusaka time. No push during this window.
              </p>
            </CardContent>
          </Card>

          {/* Filters for list */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter the list below by type and severity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label>Type</Label>
                <select
                  className="w-full mt-1 rounded border px-2 py-1.5 text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All types</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Min severity</Label>
                <select
                  className="w-full mt-1 rounded border px-2 py-1.5 text-sm"
                  value={filterMinSeverity}
                  onChange={(e) => setFilterMinSeverity(parseInt(e.target.value, 10))}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>
                      {s} – {severityLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert list */}
        <Card>
          <CardHeader>
            <CardTitle>Active alerts</CardTitle>
            <CardDescription>
              Alerts relevant to your fields and location. New events are added by the system every 15 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <p className="text-destructive py-4">Failed to load alerts. Try again later.</p>
            )}
            {!isLoading && !error && events.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                No active alerts match your filters. Alerts appear here when hazards or pest risks are reported for your area.
              </p>
            )}
            {!isLoading && !error && events.length > 0 && (
              <ul className="space-y-3">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="mt-0.5 text-muted-foreground">{eventIcon(ev.eventType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{ev.headline}</span>
                        <Badge variant={severityColor(ev.severity) as "default" | "secondary" | "destructive"}>
                          {severityLabel(ev.severity)}
                        </Badge>
                        {(ev.province || ev.district) && (
                          <span className="text-xs text-muted-foreground">
                            {[ev.district, ev.province].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                      {ev.summary && (
                        <p className="text-sm text-muted-foreground mt-1">{ev.summary}</p>
                      )}
                      {ev.recommendedActions && ev.recommendedActions.length > 0 && (
                        <p className="text-xs mt-2">
                          <span className="font-medium">Actions: </span>
                          {ev.recommendedActions.slice(0, 3).join("; ")}
                        </p>
                      )}
                      {ev.startAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          From {new Date(ev.startAt).toLocaleDateString()}
                          {ev.endAt && ` – ${new Date(ev.endAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
