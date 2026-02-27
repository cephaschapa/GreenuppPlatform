/**
 * Admin Alerts (Ingestion) page: ingestion data, processes, last ingested.
 * Uses GET /api/alerts/admin/ingestion-status and POST /api/alerts/run-ingestion.
 */

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  RefreshCw,
  Database,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Rss,
  Server,
} from "lucide-react";

interface IngestionStatus {
  eventCounts: {
    total: number;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
  };
  lastIngestedBySource: Record<string, string | null>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    hazardClass: string;
    severity: number;
    headline: string;
    status: string;
    sourceName: string;
    province: string | null;
    startAt: string | null;
    endAt: string | null;
    lastSeenAt: string;
    updatedAt: string;
  }>;
  scheduler: {
    ingestIntervalMin: number;
    deliveryIntervalMin: number;
    description: string;
  };
}

interface RunIngestionResponse {
  ok: boolean;
  message: string;
  results: Array<{
    source: string;
    newCount: number;
    updatedCount: number;
    skipped: number;
    error?: string;
  }>;
  summary: { totalNew: number; totalUpdated: number };
}

export default function AdminAlertsPage() {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<IngestionStatus>({
    queryKey: ["alerts-admin-ingestion-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/alerts/admin/ingestion-status");
      if (!res.ok) throw new Error("Failed to fetch ingestion status");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const runIngestionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/alerts/run-ingestion");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.details || "Ingestion failed");
      }
      return res.json() as Promise<RunIngestionResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["alerts-admin-ingestion-status"] });
      toast({
        title: "Ingestion complete",
        description: `New: ${data.summary.totalNew}, Updated: ${data.summary.totalUpdated}. ${data.results.map((r) => r.error ? `${r.source}: ${r.error}` : "").filter(Boolean).join(" ") || "All sources OK."}`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Ingestion failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <AdminLayout
      title="Alerts & Ingestion"
      description="Hazard and pest alert ingestion data, processes, and last run times"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["alerts-admin-ingestion-status"] })}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => runIngestionMutation.mutate()}
            disabled={runIngestionMutation.isPending}
          >
            {runIngestionMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rss className="h-4 w-4 mr-2" />
            )}
            Run ingestion now
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {/* Ingestion process & last ingested */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Ingestion process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {status?.scheduler?.description ?? "Ingestion runs on a schedule (see server config)."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Ingest: every {status?.scheduler?.ingestIntervalMin ?? 15} min
                    </Badge>
                    <Badge variant="secondary">
                      Delivery: every {status?.scheduler?.deliveryIntervalMin ?? 15} min
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sources: GDACS, ReliefWeb. Use &quot;Run ingestion now&quot; to trigger manually.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last ingested (by source)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {status?.lastIngestedBySource && Object.keys(status.lastIngestedBySource).length > 0 ? (
                    <ul className="space-y-1.5 text-sm">
                      {Object.entries(status.lastIngestedBySource).map(([source, iso]) => (
                        <li key={source} className="flex justify-between gap-2">
                          <span className="font-medium">{source}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {formatDate(iso)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No events yet. Run ingestion to populate.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Ingestion data (counts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status?.eventCounts?.total ?? 0}</div>
                  <p className="text-xs text-muted-foreground">Total events in store</p>
                  {status?.eventCounts?.bySource && Object.keys(status.eventCounts.bySource).length > 0 && (
                    <div className="mt-2 space-y-1 text-sm">
                      {Object.entries(status.eventCounts.bySource).map(([source, count]) => (
                        <div key={source} className="flex justify-between">
                          <span>{source}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {status?.eventCounts?.byStatus && Object.keys(status.eventCounts.byStatus).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(status.eventCounts.byStatus).map(([s, n]) => (
                        <Badge key={s} variant={s === "active" ? "default" : "secondary"}>
                          {s}: {n}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent events table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent alert events
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last 50 events by updated time (ingested from GDACS, ReliefWeb, or derived).
                </p>
              </CardHeader>
              <CardContent>
                {!status?.recentEvents?.length ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No events. Run ingestion to fetch hazard/pest alerts.
                  </p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Updated</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Headline</TableHead>
                          <TableHead>Province</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {status.recentEvents.map((ev) => (
                          <TableRow key={ev.id}>
                            <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                              {formatDate(ev.updatedAt)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{ev.sourceName}</Badge>
                            </TableCell>
                            <TableCell className="capitalize">{ev.eventType}</TableCell>
                            <TableCell>
                              {ev.severity >= 4 ? (
                                <AlertTriangle className="h-4 w-4 text-amber-500 inline" />
                              ) : ev.severity >= 2 ? (
                                <Activity className="h-4 w-4 text-blue-500 inline" />
                              ) : null}
                              {ev.severity}
                            </TableCell>
                            <TableCell>
                              <Badge variant={ev.status === "active" ? "default" : "secondary"}>
                                {ev.status === "active" ? (
                                  <CheckCircle className="h-3 w-3 mr-1 inline" />
                                ) : null}
                                {ev.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[280px] truncate" title={ev.headline}>
                              {ev.headline}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{ev.province ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
