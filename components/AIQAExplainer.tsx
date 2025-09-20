'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { AIQAModal } from './AIQAModal';

interface AIQAExplainerProps {
  currentAqi: number;
  dominantPollutant: string;
  category: string;
  userId: string;
}

export function AIQAExplainer({ currentAqi, dominantPollutant, category, userId }: AIQAExplainerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-[#6200D9]" />
            Ask AI About Air Quality
          </CardTitle>
          <p className="text-sm text-gray-600">
            Get personalized, health-aware explanations about your air quality data
          </p>
        </CardHeader>
        
        <CardContent>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start AI Chat
          </Button>
        </CardContent>
      </Card>

      <AIQAModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentAqi={currentAqi}
        dominantPollutant={dominantPollutant}
        category={category}
        userId={userId}
      />
    </>
  );
}
