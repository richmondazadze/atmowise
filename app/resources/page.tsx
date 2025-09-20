'use client'

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LifeBuoy, AlertTriangle, ExternalLink, Star, Shield, Award, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';

export default function ResourcesPage() {
  // Trusted sources - above the fold, visually distinct
  const trustedSources = [
    {
      title: 'MD Anderson Cancer Center',
      description: 'Expert advice on air quality and cancer prevention. Learn about lung cancer risk factors and prevention strategies.',
      url: 'https://www.mdanderson.org',
      type: 'external',
      category: 'Cancer Prevention',
      verified: true,
      priority: 'high',
      features: ['Air Pollution & Lung Cancer Risk', 'Patient Resources', 'Expert Research']
    },
    {
      title: 'American Lung Association',
      description: 'Practical tips for lung health, air pollution advice, and support for people with asthma, COPD, or other respiratory conditions.',
      url: 'https://www.lung.org',
      type: 'external',
      category: 'Lung Health',
      verified: true,
      priority: 'high',
      features: ['Air Quality Guidelines', 'Lung Health Tips', 'Patient Support']
    },
    {
      title: 'EPA Air Quality Index',
      description: 'Real-time air quality data and health recommendations from the Environmental Protection Agency.',
      url: 'https://www.airnow.gov',
      type: 'external',
      category: 'Government',
      verified: true,
      priority: 'high',
      features: ['Real-time Data', 'Health Recommendations', 'Official Standards']
    }
  ];

  // Additional resources
  const additionalResources = [
    {
      title: 'Symptom Tracker',
      description: 'Track your symptoms and air quality exposure patterns over time',
      url: '/timeline',
      type: 'internal',
      category: 'Personal Health',
      verified: false,
      priority: 'medium'
    }
  ];

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
        {/* Emergency Contacts - Simplified */}
        <div className="mb-8 lg:mb-12">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 border border-red-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-600">Emergency</h2>
                  <p className="text-sm text-red-500">Call 911 for medical emergencies</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-0 h-10 px-6 rounded-xl font-medium"
                onClick={() => window.open('tel:911')}
              >
                Call 911
              </Button>
            </div>
          </div>
        </div>

        {/* Trusted Sources - Above the Fold, Visually Distinct */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#0A1C40] tracking-tight">Trusted Sources</h2>
              <p className="text-sm text-[#64748B] font-medium">Verified medical and government resources</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {trustedSources.map((source, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0A1C40] tracking-tight">{source.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                            {source.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <ExternalLink className="h-4 w-4 text-[#64748B]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B] mb-4 leading-relaxed font-medium">
                    {source.description}
                  </p>
                  
                  {source.features && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {source.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="outline" className="text-xs border-blue-200 text-blue-600 px-2 py-1">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 h-10 px-6 rounded-xl font-medium group-hover:scale-105 transition-transform"
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      Visit Site
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <LifeBuoy className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#0A1C40] tracking-tight">Additional Resources</h2>
              <p className="text-sm text-[#64748B] font-medium">Personal health tools and features</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {additionalResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 group">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-bold text-[#0A1C40] tracking-tight">{resource.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#64748B] mb-4 leading-relaxed font-medium">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                      {resource.category}
                    </Badge>
                    {resource.url?.startsWith('/') ? (
                      <Link href={resource.url}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 h-9 px-4 rounded-xl font-medium"
                        >
                          View
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 h-9 px-4 rounded-xl font-medium"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        Visit
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </PageLayout>
  );
}