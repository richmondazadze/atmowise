import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Profile, AirRead } from "@shared/schema";

interface SymptomFormProps {
  userId: string;
  profile: Profile | null;
  airData: AirRead | null;
  onSymptomLogged?: (response: any) => void;
}

export function SymptomForm({ userId, profile, airData, onSymptomLogged }: SymptomFormProps) {
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState([2]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSymptomMutation = useMutation({
    mutationFn: async (symptomData: any) => {
      const response = await apiRequest("POST", "/api/symptoms", symptomData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms", userId] });
    },
  });

  const llmReflectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/llm/reflection", data);
      return response.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "Enter some details about how you're feeling.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First create the symptom record
      const symptomData = {
        userId,
        note: note.trim(),
        severity: severity[0],
        linkedAirId: airData?.id || null,
      };

      const symptom = await createSymptomMutation.mutateAsync(symptomData);

      // Then get LLM reflection
      const reflectionData = {
        note: note.trim(),
        pm25: airData?.pm25 || null,
        aqi: airData?.aqi || null,
        sensitivity: profile?.sensitivity || {},
      };

      const reflection = await llmReflectionMutation.mutateAsync(reflectionData);

      // Update the symptom with AI analysis
      await apiRequest("PUT", `/api/symptoms/${symptom.id}`, {
        aiSummary: reflection.summary,
        aiAction: reflection.action,
        aiSeverity: reflection.severity,
      });

      onSymptomLogged?.(reflection);

      // Reset form
      setNote("");
      setSeverity([2]);

      toast({
        title: "Symptom logged successfully",
        description: "AI analysis has been generated for your symptoms.",
      });

    } catch (error) {
      console.error("Symptom submission error:", error);
      toast({
        title: "Failed to log symptom",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createSymptomMutation.isPending || llmReflectionMutation.isPending;

  return (
    <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-symptom-form">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Log Symptoms</h3>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-symptom">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              How are you feeling?
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe any respiratory symptoms, fatigue, eye irritation, etc."
              className="w-full resize-none"
              rows={3}
              disabled={isLoading}
              data-testid="input-symptom-note"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Severity Level
            </label>
            <div className="space-y-2">
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={5}
                min={1}
                step={1}
                className="w-full"
                disabled={isLoading}
                data-testid="slider-severity"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <Badge variant="outline" className="text-sm" data-testid="badge-severity">
                Level {severity[0]}
              </Badge>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !note.trim()}
            data-testid="button-submit-symptom"
          >
            {isLoading ? "Processing..." : "Log Symptom"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
