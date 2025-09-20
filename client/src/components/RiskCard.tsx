import { Card, CardContent } from "@/components/ui/card";
import { useAirQuality, getAirQualityStatus } from "@/hooks/useAirQuality";
import { Badge } from "@/components/ui/badge";
import { Wind, RefreshCw } from "lucide-react";
import type { Profile } from "@shared/schema";

interface RiskCardProps {
  lat: number | null;
  lon: number | null;
  profile: Profile | null;
  onRefresh?: () => void;
}

export function RiskCard({ lat, lon, profile, onRefresh }: RiskCardProps) {
  const { data: airData, isLoading, error, refetch } = useAirQuality(lat, lon);

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-risk-loading">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded mb-4"></div>
            <div className="h-20 bg-muted rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !airData) {
    return (
      <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-risk-error">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Wind className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Unable to Load Air Quality</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Failed to fetch air quality data"}
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-retry"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getAirQualityStatus(airData.pm25, airData.aqi, profile?.sensitivity);
  const lastUpdated = airData.timestamp ? new Date(airData.timestamp).toLocaleTimeString() : "Unknown";

  return (
    <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-risk">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Air Quality Now</h2>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-accent rounded-full pulse-animation"></div>
            <span data-testid="text-updated">{lastUpdated}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`${status.className} rounded-xl p-4 mb-4`} data-testid="status-badge">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-xl" data-testid="text-status">
                {status.statusText}
              </div>
              <div className="text-white/90 text-sm" data-testid="text-rationale">
                {status.rationale}
              </div>
            </div>
            <div className="text-white/80">
              <Wind className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Pollutant Grid */}
        <div className="grid grid-cols-2 gap-3" data-testid="pollutant-grid">
          <div className="bg-muted/50 rounded-lg p-3" data-testid="card-pm25">
            <div className="text-xs text-muted-foreground mb-1">PM2.5</div>
            <div className="text-lg font-bold text-card-foreground">
              {airData.pm25 ? `${Math.round(airData.pm25)}` : "—"}{" "}
              <span className="text-xs font-normal">μg/m³</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3" data-testid="card-pm10">
            <div className="text-xs text-muted-foreground mb-1">PM10</div>
            <div className="text-lg font-bold text-card-foreground">
              {airData.pm10 ? `${Math.round(airData.pm10)}` : "—"}{" "}
              <span className="text-xs font-normal">μg/m³</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3" data-testid="card-o3">
            <div className="text-xs text-muted-foreground mb-1">O₃</div>
            <div className="text-lg font-bold text-card-foreground">
              {airData.o3 ? `${Math.round(airData.o3)}` : "—"}{" "}
              <span className="text-xs font-normal">μg/m³</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3" data-testid="card-no2">
            <div className="text-xs text-muted-foreground mb-1">NO₂</div>
            <div className="text-lg font-bold text-card-foreground">
              {airData.no2 ? `${Math.round(airData.no2)}` : "—"}{" "}
              <span className="text-xs font-normal">μg/m³</span>
            </div>
          </div>
        </div>

        {/* AQI Display */}
        {airData.aqi && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg" data-testid="aqi-display">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Air Quality Index</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                <span className="font-bold text-card-foreground" data-testid="text-aqi">
                  {airData.aqi}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleRefresh}
          className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4 mx-auto" />
        </button>
      </CardContent>
    </Card>
  );
}
