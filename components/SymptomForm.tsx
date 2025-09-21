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
import { AIInsightsModal } from "@/components/AIInsightsModal";
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
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [symptomData, setSymptomData] = useState<any>(null);
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

      // Prepare data for AI Insights Modal
      const insightsData = {
        note: note.trim(),
        severity: severity[0],
        airQuality: airData,
        location: airData ? `${airData.lat}, ${airData.lon}` : null,
        timestamp: new Date(),
        userProfile: profile,
      };

      setSymptomData(insightsData);
      setShowAIInsights(true);

      // Reset form
      setNote("");
      setSeverity([2]);

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
        <label className="block text-sm font-semibold text-[#0A1C40] dark:text-white mb-4">
          Severity Level
        </label>
        
        {/* Modern Severity Slider */}
        <div className="space-y-4">
          {/* Slider Container */}
          <div className="severity-slider relative px-2">
            <Slider
              value={severity}
              onValueChange={setSeverity}
              max={5}
              min={1}
              step={1}
              className="w-full [&>span:first-child]:h-2 [&>span:first-child]:bg-gray-200 dark:[&>span:first-child]:bg-gray-700 [&>span:first-child]:rounded-full [&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-[#6200D9] [&>span:first-child>span]:to-[#4C00A8] [&>span:first-child>span]:rounded-full [&>span:first-child>span]:shadow-lg"
              disabled={isLoading}
              data-testid="slider-severity"
            />
            
            {/* Severity Dots */}
            <div className="absolute top-0 left-2 right-2 flex justify-between pointer-events-none">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`severity-dot ${
                    severity[0] >= level ? 'active' : 'inactive'
                  }`}
                  style={{ transform: 'translateY(-2px)' }}
                />
              ))}
            </div>
          </div>
          
          {/* Severity Labels */}
          <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 px-1">
            <span className="text-green-600 dark:text-green-400">Mild</span>
            <span className="text-yellow-600 dark:text-yellow-400">Moderate</span>
            <span className="text-red-600 dark:text-red-400">Severe</span>
          </div>
          
          {/* Current Level Display */}
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              severity[0] <= 2 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
                : severity[0] <= 3 
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                severity[0] <= 2 ? 'bg-green-500' : severity[0] <= 3 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              Level {severity[0]} - {severity[0] <= 2 ? 'Mild' : severity[0] <= 3 ? 'Moderate' : 'Severe'}
            </div>
          </div>
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
    return (
      <div className="p-0">
        {FormFields}
        {symptomData && (
          <AIInsightsModal
            isOpen={showAIInsights}
            onClose={() => setShowAIInsights(false)}
            symptomData={symptomData}
            userId={userId}
            onInsightsSaved={() => {
              onSymptomLogged?.({ message: "AI insights generated and saved" });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-symptom-form">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Log Symptoms</h3>
          {FormFields}
        </CardContent>
      </Card>
      
      {symptomData && (
        <AIInsightsModal
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
          symptomData={symptomData}
          userId={userId}
          onInsightsSaved={() => {
            onSymptomLogged?.({ message: "AI insights generated and saved" });
          }}
        />
      )}
    </>
  );
}
