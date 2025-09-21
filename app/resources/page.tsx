'use client'

import { PageLayout } from '@/components/PageLayout'
import { Navigation } from '@/components/Navigation'
import { FloatingSettingsButton } from '@/components/FloatingSettingsButton'
import { SponsorSection } from '@/components/SponsorSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LifeBuoy, ExternalLink, BookOpen, Shield, Heart, Users, Globe, Phone, Mail, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResourcesPage() {
  // Trusted sources - above the fold, visually distinct
  const trustedSources = [
    {
      name: 'World Health Organization (WHO)',
      description: 'Global air quality guidelines and health recommendations',
      url: 'https://www.who.int/health-topics/air-pollution',
      category: 'Official Guidelines',
      icon: Globe,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      name: 'EPA Air Quality Index',
      description: 'US Environmental Protection Agency air quality standards',
      url: 'https://www.airnow.gov/aqi/aqi-basics/',
      category: 'Official Standards',
      icon: Shield,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      name: 'American Lung Association',
      description: 'Respiratory health and air pollution research',
      url: 'https://www.lung.org/clean-air',
      category: 'Health Research',
      icon: Heart,
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      name: 'CDC Air Quality & Health',
      description: 'Centers for Disease Control health guidance',
      url: 'https://www.cdc.gov/air/',
      category: 'Health Guidance',
      icon: Users,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];


  // Emergency contacts and support
  const emergencyContacts = [
    {
      name: 'Poison Control Center',
      phone: '1-800-222-1222',
      description: '24/7 emergency hotline for poisoning and chemical exposure',
      icon: Phone,
      color: 'text-red-600'
    },
    {
      name: 'National Asthma Council',
      phone: '1-800-7ASTHMA',
      description: 'Asthma support and emergency guidance',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      name: 'EPA Environmental Hotline',
      phone: '1-800-424-8802',
      description: 'Report environmental emergencies and get guidance',
      icon: Shield,
      color: 'text-green-600'
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Mobile Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 py-4 mb-6"
        >
          <div className="px-4">
            <div className="flex items-center space-x-3">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-10 h-10 bg-[#6200D9] rounded-xl flex items-center justify-center"
              >
                <LifeBuoy className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Health Resources</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expert guidance & support</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Desktop Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="hidden lg:block sticky top-0 z-30 header-premium"
        >
          <div className="px-8 py-4">
            <div className="flex items-center space-x-3">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-10 h-10 bg-[#6200D9] rounded-xl flex items-center justify-center"
              >
                <LifeBuoy className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Resources</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expert guidance, research, and support for your health journey</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-4 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-8"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Trusted Sources */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#6200D9]" />
                    Trusted Sources
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Official guidelines and research from leading health organizations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trustedSources.map((source, index) => {
                      const Icon = source.icon;
                      return (
                        <motion.div
                          key={source.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                          className="group"
                        >
                          <Card className="hover:shadow-md transition-all duration-300 hover:scale-105">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${source.color}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{source.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {source.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="group-hover:bg-[#6200D9] group-hover:text-white transition-all duration-200"
                                    onClick={() => window.open(source.url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Visit Source
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>


            {/* Emergency Contacts */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="shadow-sm border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <Phone className="h-5 w-5" />
                    Emergency Contacts
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Important phone numbers for air quality emergencies
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {emergencyContacts.map((contact, index) => {
                      const Icon = contact.icon;
                      return (
                        <motion.div
                          key={contact.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.9 + (index * 0.1) }}
                          className="group"
                        >
                          <Card className="hover:shadow-md transition-all duration-300 hover:scale-105 border-red-100">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-red-50">
                                  <Icon className={`h-5 w-5 ${contact.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 mb-1">{contact.name}</h4>
                                  <p className="text-lg font-mono text-red-600 mb-2">{contact.phone}</p>
                                  <p className="text-sm text-gray-600">{contact.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Local Resources */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#6200D9]" />
                    Local Resources
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Find air quality information and health services in your area
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Local Air Quality</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Check your local air quality index daily</li>
                        <li>• Sign up for air quality alerts</li>
                        <li>• Find clean air shelters in your area</li>
                        <li>• Report air quality concerns to local authorities</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Health Services</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Find pulmonologists and allergists</li>
                        <li>• Locate emergency medical services</li>
                        <li>• Connect with local health departments</li>
                        <li>• Access community health programs</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sponsor Section */}
            <SponsorSection />
          </div>
        </motion.div>

        {/* Navigation */}
        <Navigation />
        
        {/* Floating Settings Button */}
        <FloatingSettingsButton />
      </div>
    </PageLayout>
  );
}