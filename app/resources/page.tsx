'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LifeBuoy, Search, ExternalLink, Phone, Globe, FileText, AlertTriangle, Heart, Shield, BookOpen, Wind, Stethoscope, Users, Award, ChevronRight, Star, MapPin, Calendar } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { PageLayout } from '@/components/PageLayout';

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const resourceCategories = [
    {
      title: 'Emergency & Crisis Support',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      resources: [
        {
          title: 'Emergency Services',
          description: 'Call 911 for immediate medical emergencies and life-threatening situations',
          phone: '911',
          type: 'phone',
          priority: 'high'
        },
        {
          title: 'National Suicide Prevention Lifeline',
          description: '24/7 crisis support and suicide prevention services',
          phone: '988',
          type: 'phone',
          priority: 'high'
        }
      ]
    },
    {
      title: 'Cancer Prevention & Research',
      icon: Stethoscope,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      resources: [
        {
          title: 'MD Anderson Cancer Center',
          description: 'Expert advice on air quality and cancer prevention. Learn about lung cancer risk factors, prevention strategies, and patient support from the nation\'s top cancer hospital.',
          url: 'https://www.mdanderson.org',
          type: 'external',
          priority: 'high',
          sponsor: true,
          features: ['Air Pollution & Lung Cancer Risk', 'Patient Resources', 'Expert Research']
        },
        {
          title: 'American Cancer Society',
          description: 'Comprehensive cancer prevention information and air quality guidelines for reducing cancer risk',
          url: 'https://www.cancer.org',
          type: 'external',
          priority: 'medium'
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
          description: 'Get practical tips for lung health, air pollution advice, and support for people with asthma, COPD, or other respiratory conditions.',
          url: 'https://www.lung.org',
          type: 'external',
          priority: 'high',
          sponsor: true,
          features: ['Air Quality Guidelines', 'Lung Health Tips', 'Patient Support']
        },
        {
          title: 'Asthma and Allergy Foundation',
          description: 'Specialized resources for managing asthma and allergies in relation to air quality',
          url: 'https://www.aafa.org',
          type: 'external',
          priority: 'medium'
        }
      ]
    },
    {
      title: 'Air Quality & Environmental Health',
      icon: Wind,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      resources: [
        {
          title: 'EPA Air Quality Index',
          description: 'Real-time air quality data and health recommendations from the Environmental Protection Agency',
          url: 'https://www.airnow.gov',
          type: 'external',
          priority: 'high'
        },
        {
          title: 'Air Quality Health Guide',
          description: 'Comprehensive guide to understanding air quality impacts on health and how to protect yourself',
          url: '/timeline',
          type: 'internal',
          priority: 'medium'
        }
      ]
    },
    {
      title: 'Personal Health Management',
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      resources: [
        {
          title: 'Symptom Tracker',
          description: 'Track your symptoms and air quality exposure patterns over time',
          url: '/timeline',
          type: 'internal',
          priority: 'high'
        },
        {
          title: 'Health Profile Setup',
          description: 'Personalize your health profile for better air quality recommendations',
          url: '/profile',
          type: 'internal',
          priority: 'medium'
        },
        {
          title: 'Air Quality Alerts',
          description: 'Get personalized notifications about poor air quality in your area',
          url: '/profile',
          type: 'internal',
          priority: 'medium'
        }
      ]
    }
  ];

  const emergencyContacts = [
    {
      title: 'Medical Emergency',
      phone: '911',
      description: 'Life-threatening situations requiring immediate medical attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Poison Control',
      phone: '1-800-222-1222',
      description: '24/7 assistance for toxic exposure and poisoning emergencies',
      icon: Phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: '24/7 crisis support via text message',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
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

        {/* Emergency Contacts - Always Visible */}
        <div className="mb-8 lg:mb-12">
          <div className="bg-gradient-to-br from-red-50 via-red-100/50 to-red-50 rounded-2xl p-6 lg:p-8 border border-red-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <AlertTriangle className="h-6 w-6 text-red-600 drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-red-600 tracking-tight">Emergency Contacts</h2>
                <p className="text-sm text-red-500">Available 24/7 for immediate assistance</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className={`p-4 bg-white rounded-xl border ${contact.bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 ${contact.bgColor} rounded-lg flex items-center justify-center`}>
                      <contact.icon className={`h-4 w-4 ${contact.color}`} />
                    </div>
                    <h3 className="font-bold text-gray-900">{contact.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{contact.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-0 h-9 rounded-lg font-medium"
                    onClick={() => contact.phone.includes('Text') ? 
                      navigator.clipboard.writeText(contact.phone) : 
                      window.open(`tel:${contact.phone}`)
                    }
                  >
                    {contact.phone.includes('Text') ? 'Copy Text' : 'Call Now'}
                    <Phone className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Categories - Mobile Optimized */}
        <div className="space-y-8 lg:space-y-12">
          {resourceCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <div className={`w-12 h-12 ${category.bgColor} rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
                  <category.icon className={`h-6 w-6 ${category.color} drop-shadow-sm`} />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{category.title}</h2>
                  <p className="text-sm text-gray-500">Expert resources and guidance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {category.resources.map((resource, resourceIndex) => (
                  <Card key={resourceIndex} className={`hover:shadow-lg transition-all duration-300 shadow-sm border ${category.borderColor} group`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg lg:text-xl font-bold text-[#0A1C40] tracking-tight">{resource.title}</h3>
                          {resource.sponsor && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-1">
                              <Award className="h-3 w-3 mr-1" />
                              Sponsored
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.priority === 'high' && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {resource.type === 'phone' && <Phone className="h-4 w-4 text-[#64748B]" />}
                          {resource.type === 'external' && <ExternalLink className="h-4 w-4 text-[#64748B]" />}
                          {resource.type === 'internal' && <FileText className="h-4 w-4 text-[#64748B]" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm lg:text-base text-[#64748B] mb-4 leading-relaxed font-medium">
                        {resource.description}
                      </p>
                      
                      {resource.features && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {resource.features.map((feature, featureIndex) => (
                              <Badge key={featureIndex} variant="outline" className="text-xs border-gray-200 text-gray-600 px-2 py-1">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-xs border ${category.borderColor} ${category.color} px-2 py-1`}>
                          {category.title}
                        </Badge>
                        {resource.phone ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 group hover:scale-105 transition-transform h-9 px-4 rounded-xl font-medium"
                            onClick={() => window.open(`tel:${resource.phone}`)}
                          >
                            Call
                            <Phone className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        ) : resource.url?.startsWith('/') ? (
                          <Link href={resource.url}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 group hover:scale-105 transition-transform h-9 px-4 rounded-xl font-medium"
                            >
                              View
                              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-[#6200D9] to-[#7C3AED] hover:from-[#4C00A8] hover:to-[#6200D9] text-white border-0 group hover:scale-105 transition-transform h-9 px-4 rounded-xl font-medium"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            Visit
                            <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
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

        {/* Quick Actions */}
        <div className="mt-12 lg:mt-16">
          <h2 className="text-lg lg:text-xl font-bold text-[#0A1C40] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Link href="/timeline">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-200 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">View Timeline</h3>
                    <p className="text-sm text-gray-600">Track your health data</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                </div>
              </Card>
            </Link>
            
            <Link href="/profile">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-200 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Health Profile</h3>
                    <p className="text-sm text-gray-600">Personalize settings</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
                </div>
              </Card>
            </Link>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-200 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Health Tips</h3>
                  <p className="text-sm text-gray-600">AI-powered insights</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform ml-auto" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation />
    </PageLayout>
  );
}