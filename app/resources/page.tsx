'use client'

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LifeBuoy, AlertTriangle, ExternalLink, Star, Shield, Award, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';
import { FloatingSettingsButton } from '@/components/FloatingSettingsButton';

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


  return (
    <PageLayout>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#6200D9] rounded-xl flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Health Resources</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expert guidance & support</p>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#6200D9] rounded-xl flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Resources</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expert guidance, research, and support for your health journey</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <div className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8">
        {/* Emergency Contacts */}
        <div className="mb-8 lg:mb-12">
          <Card className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Emergency</h2>
                    <p className="text-sm text-red-500 dark:text-red-300">Call 911 for medical emergencies</p>
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
            </CardContent>
          </Card>
        </div>

        {/* Trusted Sources */}
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#6200D9] rounded-xl flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trusted Sources</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified medical and government resources</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {trustedSources.map((source, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#6200D9] rounded-xl flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{source.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs px-2 py-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <Badge variant="outline" className="text-xs text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
                            {source.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {source.description}
                  </p>
                  
                  {source.features && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {source.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1">
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
                      className="bg-[#6200D9] hover:bg-[#4C00A8] text-white border-0 h-10 px-6 rounded-xl font-medium"
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

      </div>

      {/* Navigation */}
      <Navigation />
      
      {/* Floating Settings Button */}
      <FloatingSettingsButton />
    </PageLayout>
  );
}