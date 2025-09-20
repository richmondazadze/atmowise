'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Lightbulb, Heart, Shield, Activity, User } from 'lucide-react';

interface Tip {
  id: string;
  content: string;
  tag?: string;
  createdAt: string;
}

interface TipsCardProps {
  tips: Tip[];
  className?: string;
}

const getCategoryFromTag = (tag?: string) => {
  if (!tag) return 'general';
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('immediate') || lowerTag.includes('urgent')) return 'immediate';
  if (lowerTag.includes('prevention') || lowerTag.includes('prevent')) return 'prevention';
  if (lowerTag.includes('lifestyle') || lowerTag.includes('daily')) return 'lifestyle';
  if (lowerTag.includes('medical') || lowerTag.includes('health')) return 'medical';
  return 'general';
};

const categoryIcons = {
  immediate: Activity,
  prevention: Shield,
  lifestyle: Heart,
  medical: User,
  general: Lightbulb,
};

const categoryColors = {
  immediate: 'bg-red-100 text-red-800 border-red-200',
  prevention: 'bg-blue-100 text-blue-800 border-blue-200',
  lifestyle: 'bg-green-100 text-green-800 border-green-200',
  medical: 'bg-purple-100 text-purple-800 border-purple-200',
  general: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function TipsCard({ tips, className = '' }: TipsCardProps) {
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());

  if (!tips || tips.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <Lightbulb className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tips Available</h3>
          <p className="text-gray-500">Log a symptom to get personalized health tips based on your air quality and health profile.</p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpanded = (tipId: string) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId);
    } else {
      newExpanded.add(tipId);
    }
    setExpandedTips(newExpanded);
  };

  // Sort tips by creation date (newest first)
  const sortedTips = [...tips].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          Personalized Health Tips
          <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
            {tips.length} tip{tips.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedTips.map((tip) => {
          const category = getCategoryFromTag(tip.tag);
          const IconComponent = categoryIcons[category];
          const isExpanded = expandedTips.has(tip.id);
          const categoryColor = categoryColors[category];
          
          // Extract title from content (first line) and description (rest)
          const contentLines = tip.content.split('\n');
          const title = contentLines[0] || 'Health Tip';
          const description = contentLines.slice(1).join('\n').trim() || tip.content;

          return (
            <div
              key={tip.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpanded(tip.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${categoryColor}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${categoryColor} border-current`}
                        >
                          {category}
                        </Badge>
                      </div>
                      {isExpanded && (
                        <p className="text-gray-700 text-sm leading-relaxed mt-2">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
