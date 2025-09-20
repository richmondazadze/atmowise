'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Lightbulb, Heart, Shield, Activity, User, Search, Filter, Calendar, Clock, ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface Tip {
  id: string;
  content: string;
  tag?: string;
  createdAt: string;
}

interface TipsCardProps {
  tips: Tip[];
  className?: string;
  onTipInteraction?: (tipId: string, type: 'helpful' | 'not_helpful') => void;
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

const getTimeCategory = (createdAt: string) => {
  const now = new Date();
  const tipDate = new Date(createdAt);
  const diffInHours = (now.getTime() - tipDate.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) return 'today';
  if (diffInHours < 168) return 'week'; // 7 days
  if (diffInHours < 720) return 'month'; // 30 days
  return 'older';
};

const categoryIcons = {
  immediate: Activity,
  prevention: Shield,
  lifestyle: Heart,
  medical: User,
  general: Lightbulb,
};

const categoryColors = {
  immediate: 'bg-red-50 text-red-700 border-red-200',
  prevention: 'bg-blue-50 text-blue-700 border-blue-200',
  lifestyle: 'bg-green-50 text-green-700 border-green-200',
  medical: 'bg-purple-50 text-purple-700 border-purple-200',
  general: 'bg-gray-50 text-gray-700 border-gray-200',
};

const categoryIconsBg = {
  immediate: 'bg-red-100',
  prevention: 'bg-blue-100',
  lifestyle: 'bg-green-100',
  medical: 'bg-purple-100',
  general: 'bg-gray-100',
};

export function TipsCard({ tips, className = '', onTipInteraction }: TipsCardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'category'>('newest');
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Enhanced filtering and sorting logic
  const filteredAndSortedTips = useMemo(() => {
    let filtered = tips.filter(tip => {
      // Search filter
      if (searchQuery && !tip.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all') {
        const category = getCategoryFromTag(tip.tag);
        if (category !== categoryFilter) return false;
      }
      
      // Time filter
      if (timeFilter !== 'all') {
        const timeCategory = getTimeCategory(tip.createdAt);
        if (timeCategory !== timeFilter) return false;
      }
      
      return true;
    });

    // Sort tips
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'category':
          const categoryA = getCategoryFromTag(a.tag);
          const categoryB = getCategoryFromTag(b.tag);
          if (categoryA !== categoryB) {
            return categoryA.localeCompare(categoryB);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [tips, searchQuery, categoryFilter, timeFilter, sortBy]);

  const handleTipClick = (tip: Tip) => {
    setSelectedTip(tip);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTip(null);
  };

  if (!tips || tips.length === 0) {
    return (
      <Card className={`bg-white shadow-sm border-0 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tips Available</h3>
          <p className="text-gray-500 text-sm">Log a symptom to get personalized health tips based on your air quality and health profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`bg-white shadow-sm border-0 ${className}`}>
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-blue-600" />
              </div>
              <span>Health Tips</span>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
              {filteredAndSortedTips.length}
            </Badge>
          </CardTitle>
          
          {/* Mobile-Optimized Filtering UI */}
          <div className="space-y-3 mt-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            
            {/* Filter Controls - Mobile Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 text-sm border-gray-200 focus:border-blue-300">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="truncate">
                      {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="prevention">Prevention</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="h-10 text-sm border-gray-200 focus:border-blue-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="truncate">
                      {timeFilter === 'all' ? 'All Time' : timeFilter}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="older">Older</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-10 text-sm border-gray-200 focus:border-blue-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="truncate">{sortBy}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          {/* Scrollable Tips Container */}
          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {filteredAndSortedTips.length === 0 ? (
              <div className="text-center py-8 px-6">
                <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">No tips found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAndSortedTips.map((tip) => {
                  const category = getCategoryFromTag(tip.tag);
                  const timeCategory = getTimeCategory(tip.createdAt);
                  const IconComponent = categoryIcons[category];
                  const categoryColor = categoryColors[category];
                  const iconBg = categoryIconsBg[category];
                  
                  // Extract title from content (first line) and description (rest)
                  const contentLines = tip.content.split('\n');
                  const title = contentLines[0] || 'Health Tip';
                  const description = contentLines.slice(1).join('\n').trim() || tip.content;

                  return (
                    <div
                      key={tip.id}
                      className="mx-4 mb-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleTipClick(tip)}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header with title and badges */}
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                                {title}
                              </h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {onTipInteraction && (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTipInteraction(tip.id, 'helpful');
                                      }}
                                      className="h-6 w-6 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTipInteraction(tip.id, 'not_helpful');
                                      }}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Badges and date */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-2 py-1 ${categoryColor} border-current font-medium`}
                              >
                                {category}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-2 py-1 text-gray-600 border-gray-300">
                                {timeCategory === 'today' ? 'Today' : 
                                 timeCategory === 'week' ? 'This Week' :
                                 timeCategory === 'month' ? 'This Month' : 'Older'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(tip.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                              {description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Responsive Tip Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 sm:w-full rounded-3xl">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-3">
              {selectedTip && (
                <>
                  {(() => {
                    const category = getCategoryFromTag(selectedTip.tag);
                    const IconComponent = categoryIcons[category];
                    const iconBg = categoryIconsBg[category];
                    return (
                      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                    );
                  })()}
                  <span className="text-lg font-semibold">Health Tip</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTip && (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {/* Tip Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-sm px-3 py-1 ${categoryColors[getCategoryFromTag(selectedTip.tag)]} border-current font-medium`}
                  >
                    {getCategoryFromTag(selectedTip.tag)}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1 text-gray-600 border-gray-300">
                    {getTimeCategory(selectedTip.createdAt) === 'today' ? 'Today' : 
                     getTimeCategory(selectedTip.createdAt) === 'week' ? 'This Week' :
                     getTimeCategory(selectedTip.createdAt) === 'month' ? 'This Month' : 'Older'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedTip.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Tip Content */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                    {selectedTip.content}
                  </div>
                </div>

                {/* Interaction Buttons */}
                {onTipInteraction && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTipInteraction(selectedTip.id, 'helpful')}
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50 h-10"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTipInteraction(selectedTip.id, 'not_helpful')}
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-10"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Not Helpful
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}