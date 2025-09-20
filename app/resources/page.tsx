'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, Search, ExternalLink, Phone, Globe, FileText, AlertTriangle, Heart, Shield, BookOpen, Wind } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const resourceCategories = [
    {
      title: 'Emergency',
      icon: AlertTriangle,
      color: 'text-[#EF4444]',
      bgColor: 'bg-[#EF4444]/10',
      resources: [
        {
          title: 'Emergency Hotline',
          description: '24/7 air quality emergency support',
          phone: '1-800-AIR-HELP',
          type: 'phone'
        },
        {
          title: 'Poison Control',
          description: 'Immediate toxic exposure assistance',
          phone: '1-800-222-1222',
          type: 'phone'
        }
      ]
    },
    {
      title: 'Health',
      icon: Heart,
      color: 'text-[#71E07E]',
      bgColor: 'bg-[#71E07E]/10',
      resources: [
        {
          title: 'Air Quality Health Guide',
          description: 'Understanding air quality impacts on health',
          url: 'https://www.epa.gov/air-quality',
          type: 'guide'
        },
        {
          title: 'Symptom Tracker',
          description: 'Track your symptoms and air quality exposure',
          url: '/timeline',
          type: 'guide'
        }
      ]
    },
    {
      title: 'Protection',
      icon: Shield,
      color: 'text-[#6200D9]',
      bgColor: 'bg-[#6200D9]/10',
      resources: [
        {
          title: 'Air Quality Alerts',
          description: 'Get notified about poor air quality',
          url: '/profile',
          type: 'guide'
        },
        {
          title: 'Protection Tips',
          description: 'How to protect yourself from poor air quality',
          url: 'https://www.airnow.gov/air-quality-and-health/',
          type: 'article'
        }
      ]
    }
  ];

  const filteredResources = resourceCategories.flatMap(category => 
    category.resources.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <PageLayout>
      {/* Mobile Header - Premium Design */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-[#6200D9] via-[#7C3AED] to-[#4C00A8] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <LifeBuoy className="h-5 w-5 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight">Resources</h1>
                <p className="text-xs text-[#64748B] font-medium">Health & safety info</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-30 header-premium">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 text-[#0A1C40]">Resources</h1>
              <p className="body-large text-[#64748B]">Essential health and safety information</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <div className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8">
        {/* Search - Mobile Optimized */}
        <div className="mb-6 lg:mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 border-gray-200 focus:border-[#6200D9] focus:ring-[#6200D9] rounded-xl text-base touch-target"
            />
          </div>
        </div>

        {/* Resource Categories - Mobile Optimized */}
        <div className="space-y-6 lg:space-y-8">
          {resourceCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-4 mb-4 lg:mb-6">
                <div className={`w-12 h-12 ${category.bgColor} rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
                  <category.icon className={`h-6 w-6 ${category.color} drop-shadow-sm`} />
                </div>
                <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{category.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {category.resources.map((resource, resourceIndex) => (
                  <div key={resourceIndex} className="bg-white rounded-2xl p-5 lg:p-6 hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-100/50 touch-target">
                    <div className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{resource.title}</h3>
                        <div className="flex items-center gap-2">
                          {resource.type === 'phone' && <Phone className="h-4 w-4 text-[#64748B]" />}
                          {resource.type === 'guide' && <FileText className="h-4 w-4 text-[#64748B]" />}
                          {resource.type === 'article' && <Globe className="h-4 w-4 text-[#64748B]" />}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm lg:text-base text-[#64748B] mb-5 lg:mb-6 leading-relaxed font-medium">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs border-gray-200 text-[#64748B] px-2 py-1 rounded-full font-medium">
                          {category.title}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 group hover:scale-105 transition-transform h-9 px-4 rounded-xl font-medium touch-target"
                          onClick={() => {
                            if (resource.phone) {
                              window.open(`tel:${resource.phone}`);
                            } else if (resource.url) {
                              if (resource.url.startsWith('/')) {
                                window.location.href = resource.url;
                              } else {
                                window.open(resource.url, '_blank');
                              }
                            }
                          }}
                        >
                          {resource.phone ? 'Call' : 'View'}
                          <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contact Card - Mobile Optimized */}
        <div className="mt-8 lg:mt-12">
          <div className="bg-gradient-to-br from-[#EF4444]/5 via-[#EF4444]/10 to-[#EF4444]/5 rounded-2xl p-5 lg:p-8 border border-[#EF4444]/20 shadow-sm">
            <div className="flex items-center gap-4 mb-5 lg:mb-6">
              <div className="w-12 h-12 bg-[#EF4444]/10 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <AlertTriangle className="h-6 w-6 text-[#EF4444] drop-shadow-sm" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-[#EF4444] tracking-tight">Emergency Contacts</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="p-4 bg-white rounded-xl border border-[#EF4444]/20 shadow-sm">
                <h4 className="text-base lg:text-lg font-bold text-[#EF4444] mb-2">Medical Emergency</h4>
                <p className="text-sm lg:text-base text-[#64748B] font-medium">Call 911 immediately for life-threatening situations</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#EF4444]/20 shadow-sm">
                <h4 className="text-base lg:text-lg font-bold text-[#EF4444] mb-2">Poison Control</h4>
                <p className="text-sm lg:text-base text-[#64748B] font-medium">1-800-222-1222 (24/7)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </PageLayout>
  );
}