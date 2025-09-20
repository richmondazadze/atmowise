'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, Search, ExternalLink, Phone, FileText, AlertTriangle, Heart, Wind, Stethoscope } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const resourceCategories = [
    {
      title: 'Cancer Prevention & Research',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      resources: [
        {
          title: 'MD Anderson Cancer Center',
          description: 'Expert advice on air quality and cancer prevention. Learn about lung cancer risk factors and prevention strategies.',
          url: 'https://www.mdanderson.org',
          type: 'external'
        }
      ]
    },
    {
      title: 'Lung Health & Respiratory Care',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      resources: [
        {
          title: 'American Lung Association',
          description: 'Practical tips for lung health, air pollution advice, and support for people with asthma, COPD, or other respiratory conditions.',
          url: 'https://www.lung.org',
          type: 'external'
        }
      ]
    },
    {
      title: 'Air Quality & Health',
      icon: Wind,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      resources: [
        {
          title: 'EPA Air Quality Index',
          description: 'Real-time air quality data and health recommendations from the Environmental Protection Agency',
          url: 'https://www.airnow.gov',
          type: 'external'
        },
        {
          title: 'Symptom Tracker',
          description: 'Track your symptoms and air quality exposure patterns over time',
          url: '/timeline',
          type: 'internal'
        }
      ]
    }
  ];


  const filteredResources = resourceCategories.flatMap(category => 
    category.resources.filter(resource =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                <h1 className="text-xl font-bold text-[#0A1C40] tracking-tight">Health Resources</h1>
                <p className="text-xs text-[#64748B] font-medium">Expert guidance & support</p>
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
              <h1 className="heading-1 text-[#0A1C40]">Health Resources</h1>
              <p className="body-large text-[#64748B]">Expert guidance, research, and support for your health journey</p>
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

        {/* Emergency Contacts - Simplified */}
        <div className="mb-8 lg:mb-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 border border-red-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-600">Emergency</h2>
                <p className="text-sm text-red-500">Call 911 for medical emergencies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Categories - Mobile Optimized */}
        <div className="space-y-8 lg:space-y-12">
          {resourceCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="mb-6 lg:mb-8">
                <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{category.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {category.resources.map((resource, resourceIndex) => (
                  <Card key={resourceIndex} className={`hover:shadow-lg transition-all duration-300 shadow-sm border ${category.borderColor} group`}>
                    <CardHeader className="pb-4">
                      <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{resource.title}</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm lg:text-base text-[#64748B] mb-4 leading-relaxed font-medium">
                        {resource.description}
                      </p>
                      
                      <div className="flex justify-end">
                        {resource.phone ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 h-9 px-4 rounded-xl font-medium"
                            onClick={() => window.open(`tel:${resource.phone}`)}
                          >
                            Call
                          </Button>
                        ) : resource.url?.startsWith('/') ? (
                          <Link href={resource.url}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 h-9 px-4 rounded-xl font-medium"
                            >
                              View
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 h-9 px-4 rounded-xl font-medium"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            Visit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Navigation */}
      <Navigation />
    </PageLayout>
  );
}