'use client'

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
  userId?: string;
  profile?: Profile | null;
  airData?: AirRead | null;
  onSymptomLogged?: (response: any) => void;
  onEmergency?: () => void;
  embedded?: boolean; // when true, render without outer Card/header for mobile embedding
}

export function SymptomForm({ userId = "", profile = null, airData = null, onSymptomLogged, onEmergency, embedded = false }: SymptomFormProps) {
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState([2]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSymptomMutation = useMutation({
    mutationFn: async (symptomData: any) => {
      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptomData)
      });
      if (!response.ok) throw new Error('Failed to create symptom');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Symptom created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['symptoms', userId] });
      toast({
        title: "Symptom logged",
        description: "Your symptom has been recorded successfully.",
      });
    },
    onError: (error) => {
      console.error('Symptom creation failed:', error);
    },
  });

  const llmReflectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/llm/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to get AI reflection');
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

      // Then get LLM reflection with comprehensive data
      const reflectionData = {
        note: note.trim(),
        pm25: airData?.pm25 || null,
        pm10: airData?.pm10 || null,
        o3: airData?.o3 || null,
        no2: airData?.no2 || null,
        aqi: airData?.aqi || null,
        category: airData?.category || null,
        dominantPollutant: airData?.dominantPollutant || null,
        severity: severity[0],
        sensitivity: profile?.sensitivity || {},
        userId: userId,
        location: airData ? `${airData.lat}, ${airData.lon}` : null,
        timestamp: new Date().toISOString(),
      };

      const reflection = await llmReflectionMutation.mutateAsync(reflectionData);

      // Update the symptom with AI analysis
      const updateResponse = await fetch(`/api/symptoms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomId: symptom.id,
          aiSummary: reflection.summary,
          aiAction: reflection.action,
          aiSeverity: reflection.severity,
        })
      });

      // Check for emergency
      if (reflection.severity === 'high' || reflection.emergency) {
        onEmergency?.();
      }

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

  const FormFields = (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-symptom">
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          How are you feeling?
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe any respiratory symptoms, fatigue, eye irritation, etc."
          className="w-full resize-none placeholder:text-gray-400"
          rows={4}
          disabled={isLoading}
          data-testid="input-symptom-note"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0A1C40] mb-3">
          Severity Level
        </label>
        <div className="space-y-3">
          <Slider
            value={severity}
            onValueChange={setSeverity}
            max={5}
            min={1}
            step={1}
            className="w-full [&>span:first-child]:h-3 [&>span:first-child]:bg-[#E2E8F0] [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-[#6200D9] [&>span:first-child>span]:to-[#4C00A8]"
            thumbClassName="h-6 w-6 bg-white border-2 border-[#6200D9] shadow-lg"
            disabled={isLoading}
            data-testid="slider-severity"
          />
          <div className="flex justify-between text-xs font-medium text-[#64748B] px-1">
            <span className="text-green-600">Mild</span>
            <span className="text-yellow-600">Moderate</span>
            <span className="text-red-600">Severe</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <Badge 
            variant="outline" 
            className={`text-sm font-semibold px-4 py-2 ${
              severity[0] <= 2 ? 'bg-green-50 text-green-700 border-green-200' :
              severity[0] <= 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-red-50 text-red-700 border-red-200'
            }`} 
            data-testid="badge-severity"
          >
            Level {severity[0]} - {severity[0] <= 2 ? 'Mild' : severity[0] <= 3 ? 'Moderate' : 'Severe'}
          </Badge>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
        disabled={isLoading || !note.trim()}
        data-testid="button-submit-symptom"
      >
        {isLoading ? "Processing..." : "Log Symptom"}
      </Button>
    </form>
  );

  if (embedded) {
    // Render without outer Card and header for mobile embedding
    return <div className="p-0">{FormFields}</div>;
  }

  return (
    <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-symptom-form">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Log Symptoms</h3>
        {FormFields}
      </CardContent>
    </Card>
  );
}
