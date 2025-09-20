import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Chart, registerables } from "chart.js";
import type { AirRead, Symptom } from "@shared/schema";

Chart.register(...registerables);

interface TimelineChartProps {
  userId: string;
  lat: number | null;
  lon: number | null;
}

export function TimelineChart({ userId, lat, lon }: TimelineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const { data: timelineData, isLoading } = useQuery<{
    airData: AirRead[];
    symptomData: Symptom[];
  }>({
    queryKey: ["/api/timeline", userId, lat, lon],
    queryFn: async () => {
      if (!lat || !lon) throw new Error("Location required");
      
      const response = await fetch(`/api/timeline/${userId}?lat=${lat}&lon=${lon}&days=7`);
      if (!response.ok) {
        throw new Error("Failed to fetch timeline data");
      }
      return response.json();
    },
    enabled: Boolean(userId && lat && lon),
  });

  useEffect(() => {
    if (!chartRef.current || !timelineData || isLoading) {
      return;
    }

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Process data for the last 7 days
    const now = new Date();
    const labels = [];
    const pm25Data = [];
    const symptomData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      labels.push(dayLabel);

      // Find air data for this day
      const dayAirData = timelineData.airData.find((air) => {
        if (!air.timestamp) return false;
        const airDate = new Date(air.timestamp);
        return airDate.toDateString() === date.toDateString();
      });
      pm25Data.push(dayAirData?.pm25 || null);

      // Find symptom data for this day (average severity)
      const daySymptoms = timelineData.symptomData.filter((symptom) => {
        if (!symptom.timestamp) return false;
        const symptomDate = new Date(symptom.timestamp);
        return symptomDate.toDateString() === date.toDateString();
      });
      
      const avgSeverity = daySymptoms.length > 0
        ? daySymptoms.reduce((sum, s) => sum + (s.severity || 0), 0) / daySymptoms.length
        : null;
      symptomData.push(avgSeverity);
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: "PM2.5 (μg/m³)",
          data: pm25Data,
          borderColor: "hsl(203.8863 88.2845% 53.1373%)",
          backgroundColor: "hsl(203.8863 88.2845% 53.1373% / 0.1)",
          tension: 0.4,
          type: "line" as const,
          yAxisID: "y",
          spanGaps: true,
        },
        {
          label: "Symptom Severity",
          data: symptomData,
          backgroundColor: "hsl(356.3033 90.5579% 54.3137%)",
          borderColor: "hsl(356.3033 90.5579% 54.3137%)",
          type: "bar" as const,
          yAxisID: "y1",
        },
      ],
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            grid: {
              color: "hsl(210 5.2632% 14.9020% / 0.1)",
            },
            ticks: {
              color: "hsl(210 3.3898% 46.2745%)",
              font: {
                size: 10,
              },
            },
            title: {
              display: true,
              text: "PM2.5 (μg/m³)",
              color: "hsl(210 3.3898% 46.2745%)",
              font: {
                size: 10,
              },
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            max: 5,
            min: 0,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: "hsl(210 3.3898% 46.2745%)",
              font: {
                size: 10,
              },
              stepSize: 1,
            },
            title: {
              display: true,
              text: "Symptom Severity",
              color: "hsl(210 3.3898% 46.2745%)",
              font: {
                size: 10,
              },
            },
          },
          x: {
            grid: {
              color: "hsl(210 5.2632% 14.9020% / 0.1)",
            },
            ticks: {
              color: "hsl(210 3.3898% 46.2745%)",
              font: {
                size: 10,
              },
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [timelineData, isLoading]);

  if (isLoading) {
    return (
      <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-timeline-loading">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">7-Day Timeline</h3>
          <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-timeline">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">7-Day Timeline</h3>
        <div className="h-64 relative">
          <canvas ref={chartRef} className="w-full h-full" data-testid="canvas-timeline" />
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-chart-1"></div>
            <span className="text-muted-foreground">PM2.5 Levels</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded"></div>
            <span className="text-muted-foreground">Symptom Severity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
