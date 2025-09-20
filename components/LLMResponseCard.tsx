import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Lightbulb, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LLMResponse {
  summary: string;
  action: string;
  severity: "low" | "moderate" | "high";
  explainers?: string;
}

interface LLMResponseCardProps {
  response: LLMResponse | null;
  isVisible: boolean;
  onEmergency?: () => void;
}

export function LLMResponseCard({ response, isVisible, onEmergency }: LLMResponseCardProps) {
  if (!response || !isVisible) {
    return null;
  }

  // Check for high severity
  if (response.severity === "high" && onEmergency) {
    onEmergency();
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-chart-2/10 text-chart-2";
      case "moderate":
        return "bg-chart-3/10 text-chart-3";
      case "high":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-ai-response">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-card-foreground mb-2">AI Health Reflection</h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-card-foreground" data-testid="text-ai-summary">
                  {response.summary}
                </p>
              </div>
              
              {response.severity === "high" && (
                <Alert className="border-destructive/50 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    High severity symptoms detected. Please seek immediate medical attention if experiencing difficulty breathing, chest pain, or other emergency symptoms.
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-accent mb-1">Recommended Action</div>
                    <p className="text-sm text-card-foreground" data-testid="text-ai-action">
                      {response.action}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>AI Analysis</span>
                <Badge 
                  variant="outline"
                  className={getSeverityColor(response.severity)}
                  data-testid="badge-ai-severity"
                >
                  Severity: {response.severity}
                </Badge>
              </div>

              {response.explainers && (
                <p className="text-xs text-muted-foreground italic" data-testid="text-ai-explainers">
                  {response.explainers}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
