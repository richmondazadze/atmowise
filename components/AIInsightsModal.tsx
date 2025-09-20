'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Brain, Lightbulb, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptomData: {
    note: string;
    severity: number;
    airQuality?: any;
    location?: string;
    timestamp: Date;
  };
  userId: string;
  onInsightsSaved?: () => void;
}

interface AIResponse {
  summary: string;
  action: string;
  severity: string;
  tips: Array<{
    title: string;
    content: string;
    category: string;
    priority: number;
  }>;
}

export function AIInsightsModal({ 
  isOpen, 
  onClose, 
  symptomData, 
  userId, 
  onInsightsSaved 
}: AIInsightsModalProps) {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Generate AI insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/llm/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: symptomData.note,
          pm25: symptomData.airQuality?.pm25 || null,
          pm10: symptomData.airQuality?.pm10 || null,
          o3: symptomData.airQuality?.o3 || null,
          no2: symptomData.airQuality?.no2 || null,
          aqi: symptomData.airQuality?.aqi || null,
          category: symptomData.airQuality?.category || null,
          dominantPollutant: symptomData.airQuality?.dominantPollutant || null,
          severity: symptomData.severity,
          sensitivity: null, // Will be fetched by the API
          userId: userId,
          location: symptomData.location,
          timestamp: symptomData.timestamp.toISOString()
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to generate insights: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('AI generation successful:', data);
      setAiResponse(data);
      simulateStreaming(data);
    },
    onError: (error) => {
      console.error('AI generation error:', error);
      setIsGenerating(false);
      toast({
        title: "Failed to generate insights",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Save insights mutation
  const saveInsightsMutation = useMutation({
    mutationFn: async (insights: AIResponse) => {
      // Save each tip to the database
      const tipPromises = insights.tips.map(tip => 
        fetch('/api/tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            content: `${tip.title}\n\n${tip.content}`,
            tag: tip.category,
            priority: getPriorityLabel(tip.priority)
          })
        })
      );
      
      await Promise.all(tipPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-interactions', userId] });
      toast({
        title: "Insights Saved!",
        description: "Your AI insights and tips have been saved to your profile.",
      });
      onInsightsSaved?.();
      onClose();
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Failed to save insights",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Simulate streaming effect for AI response
  const simulateStreaming = (data: AIResponse) => {
    setIsStreaming(true);
    setStreamingText('');
    setCurrentTipIndex(0);
    
    const fullText = `${data.summary}\n\n${data.action}\n\nSeverity: ${data.severity}`;
    let index = 0;
    
    const streamInterval = setInterval(() => {
      if (index < fullText.length) {
        setStreamingText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 30); // 30ms delay for smooth streaming
  };

  // Generate insights when modal opens
  useEffect(() => {
    if (isOpen && !aiResponse && !isGenerating) {
      console.log('Opening AI Insights Modal with data:', symptomData);
      setIsGenerating(true);
      generateInsightsMutation.mutate();
    }
  }, [isOpen]);

  // Reset generating state when AI response is received
  useEffect(() => {
    if (aiResponse && isGenerating) {
      setIsGenerating(false);
    }
  }, [aiResponse, isGenerating]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAiResponse(null);
      setStreamingText('');
      setIsGenerating(false);
      setIsStreaming(false);
      setCurrentTipIndex(0);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (aiResponse) {
      saveInsightsMutation.mutate(aiResponse);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 4) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (priority >= 2) {
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'high';
    if (priority >= 2) return 'medium';
    return 'low';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] rounded-2xl flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#6200D9]" />
            AI Health Insights & Tips
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-6">
          {/* Loading State */}
          {isGenerating && !aiResponse && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#6200D9] mx-auto mb-3" />
                <p className="text-gray-600">Analyzing your symptoms and generating personalized insights...</p>
              </div>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <>
              {/* Summary and Action - Fixed Height */}
              <div className="space-y-4 flex-shrink-0">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </h4>
                  <div className="text-sm text-blue-800 whitespace-pre-line">
                    {isStreaming ? streamingText : `${aiResponse.summary}\n\n${aiResponse.action}`}
                    {isStreaming && <span className="animate-pulse">|</span>}
                  </div>
                </div>

                {/* Severity Assessment */}
                <div className={`p-3 rounded-2xl border ${getSeverityColor(aiResponse.severity)}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Severity Level: {aiResponse.severity}</span>
                  </div>
                </div>
              </div>

              {/* Tips Section - Scrollable */}
              <div className="flex-1 flex flex-col space-y-4 min-h-0">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-[#6200D9]" />
                  Personalized Health Tips
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {aiResponse.tips.map((tip, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all duration-200 ${
                        index === currentTipIndex 
                          ? 'border-[#6200D9] bg-[#6200D9]/5' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getPriorityIcon(tip.priority)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              {tip.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              getPriorityLabel(tip.priority) === 'high' ? 'bg-red-100 text-red-700' :
                              getPriorityLabel(tip.priority) === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {getPriorityLabel(tip.priority)}
                            </span>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-2">{tip.title}</h5>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {tip.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons - Fixed at Bottom */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 touch-target order-2 sm:order-1 text-sm sm:text-base rounded-2xl"
            >
              Close
            </Button>
            <Button
              onClick={handleSave}
              disabled={!aiResponse || saveInsightsMutation.isPending || isStreaming}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white font-semibold touch-target order-1 sm:order-2 text-sm sm:text-base rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveInsightsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Insights
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
