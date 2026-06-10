"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLiveMetrics } from "@/actions/operations.actions";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Radio, Scale, ServerCrash, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { AppCard } from "@/components/admin/app-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/formatters";

export function DashboardContent() {
  const [chartData, setChartData] = useState<
    { time: string; latency: number; failed: number; compensating: number }[]
  >([]);

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ["liveMetrics"],
    queryFn: getLiveMetrics,
    refetchInterval: 5000, // Poll every 5 seconds
    retry: false,
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChartData((prev) => {
        const newData = [
          ...prev,
          {
            time: format(new Date(), "HH:mm:ss"),
            latency: data.walletSagaLatency,
            failed: data.transferFailedTotal,
            compensating: data.transferCompensatingTotal,
          },
        ];
        // Keep last 20 data points
        if (newData.length > 20) {
          return newData.slice(newData.length - 20);
        }
        return newData;
      });
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operations and system metrics."
        actions={
          isError ? (
            <Badge variant="outline" className="h-7 rounded-md border-destructive/30 bg-destructive/10 text-destructive">
              <Radio className="h-3 w-3" aria-hidden="true" />
              Unavailable
            </Badge>
          ) : (
            <Badge variant="outline" className="h-7 rounded-md border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300">
              <span className="relative flex h-3 w-3">
                {isFetching && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Polling (5s)
            </Badge>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Failed Transfers"
          value={isError ? "Unavailable" : formatNumber(data?.transferFailedTotal ?? 0)}
          icon={AlertTriangle}
          tone="danger"
          isLoading={isLoading}
        />
        <StatCard
          label="Compensating"
          value={isError ? "Unavailable" : formatNumber(data?.transferCompensatingTotal ?? 0)}
          icon={Activity}
          tone="warning"
          isLoading={isLoading}
        />
        <StatCard
          label="DLQ Depth"
          value={isError ? "Unavailable" : formatNumber(data?.walletDlqDepth ?? 0)}
          icon={ServerCrash}
          tone="danger"
          isLoading={isLoading}
        />
        <StatCard
          label="Reconciliation Drift"
          value={isError ? "Unavailable" : formatNumber(data?.reconciliationDrift ?? 0)}
          icon={Scale}
          tone={data?.reconciliationDrift && data.reconciliationDrift > 0 ? "danger" : "success"}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AppCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Saga Latency (ms)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "var(--muted-foreground)" }}
                    />
                    <YAxis 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}ms`}
                      tick={{ fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                {isError ? (
                  <Badge variant="outline" className="rounded-md border-destructive/30 bg-destructive/10 text-destructive">Metrics Unavailable</Badge>
                ) : (
                  <div className="w-full space-y-3 px-6">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-44 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </AppCard>

        <AppCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Failure Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="time"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                      }}
                    />
                    <Line type="monotone" dataKey="failed" stroke="var(--destructive)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="compensating" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-md border bg-muted/20 text-muted-foreground">
                {isError ? "Failure metrics unavailable" : "Collecting failure data..."}
              </div>
            )}
          </CardContent>
        </AppCard>
      </div>

      <AppCard>
        <CardHeader>
          <CardTitle>Consumer Lag</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <div className="numbers font-mono text-4xl font-semibold text-primary">
              {isError ? "--" : isLoading ? <Skeleton className="h-10 w-24" /> : formatNumber(data?.walletConsumerLag ?? 0)}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">events behind</p>
          </div>
          <Badge variant="outline" className="rounded-md">
            Kafka consumer
          </Badge>
        </CardContent>
      </AppCard>
    </div>
  );
}
