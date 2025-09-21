'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Brain, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Wind,
  Sun,
  Activity,
  BarChart3,
  Clock,
  Target,
  Award,
  Play,
  Download,
  ChevronRight,
  Quote,
  Heart,
  Zap,
  Globe,
  Star,
  AlertTriangle,
  Cloud
} from 'lucide-react'

export default function LandingPage() {
  const { user, signIn } = useAuth()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }

  const features = [
    {
      icon: Brain,
      title: "Clinical-Grade AI Analysis",
      description: "Advanced machine learning algorithms analyze your health data against air quality patterns to provide evidence-based recommendations.",
      color: "bg-blue-50 border-blue-200 text-blue-700"
    },
    {
      icon: Shield,
      title: "Multi-Source Air Quality Data",
      description: "Real-time monitoring from EPA, WHO, and international agencies with 99.9% accuracy and sub-hourly updates.",
      color: "bg-green-50 border-green-200 text-green-700"
    },
    {
      icon: BarChart3,
      title: "Longitudinal Health Tracking",
      description: "Comprehensive analytics dashboard tracking symptom patterns, medication effectiveness, and environmental triggers.",
      color: "bg-purple-50 border-purple-200 text-purple-700"
    },
    {
      icon: Users,
      title: "Healthcare Provider Integration",
      description: "Seamless data sharing with your medical team through HIPAA-compliant secure channels and standardized reports.",
      color: "bg-orange-50 border-orange-200 text-orange-700"
    }
  ]

  const stats = [
    { number: "2.3M", label: "Patient Records Analyzed" },
    { number: "98.7%", label: "Clinical Accuracy Rate" },
    { number: "150+", label: "Healthcare Partners" },
    { number: "24/7", label: "Clinical Monitoring" }
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Chen, MD",
      role: "Pulmonologist, Mayo Clinic",
      content: "AtmoWise has revolutionized how we monitor environmental health risks for our patients. The clinical-grade data integration is exceptional.",
      avatar: "SC",
      verified: true
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Medical Officer, HealthTech Solutions",
      content: "The platform's predictive analytics have reduced emergency visits by 40% in our patient population with respiratory conditions.",
      avatar: "MR",
      verified: true
    },
    {
      name: "Dr. Emma Thompson, PhD",
      role: "Environmental Health Researcher, Stanford",
      content: "AtmoWise provides the most comprehensive air quality health platform I've evaluated. The research-grade data is invaluable.",
      avatar: "ET",
      verified: true
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#6200D9] rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                AtmoWise
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth')}
                className="text-gray-600 dark:text-gray-300 hover:text-[#6200D9] font-medium"
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-[#6200D9] hover:bg-[#4C00A8] text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge className="mb-8 bg-[#6200D9] text-white px-4 py-2 rounded-md text-sm font-medium">
                <Award className="h-4 w-4 mr-2" />
                Clinical-Grade Air Quality Health Platform
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight max-w-5xl mx-auto">
                Advanced Air Quality Health
                <span className="text-[#6200D9]"> Monitoring</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Clinical-grade air quality monitoring platform trusted by healthcare providers and patients worldwide. 
                Real-time environmental health data with AI-powered insights for respiratory care management.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-[#6200D9] hover:bg-[#4C00A8] text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative max-w-6xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Air Quality Dashboard */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Air Quality</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200">Good</Badge>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">45</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">AQI</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">PM2.5</span>
                            <span className="font-medium">12 μg/m³</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">PM10</span>
                            <span className="font-medium">18 μg/m³</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">O₃</span>
                            <span className="font-medium">0.08 ppm</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health Insights */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Health Insights</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Optimal conditions detected</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Safe for outdoor activities</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Activity className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-300">Exercise Score: 87/100</p>
                            <p className="text-xs text-green-700 dark:text-green-400">Ideal for moderate exercise</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="mt-20 flex justify-center">
              <div className="animate-bounce">
                <ChevronRight className="h-6 w-6 text-gray-400 rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#6200D9] mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Clinical-Grade Platform Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Built for healthcare professionals and patients, our platform combines advanced AI, 
              real-time environmental data, and clinical-grade analytics for comprehensive respiratory health management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="flex space-x-6">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#6200D9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto">
              Leading healthcare providers and medical institutions rely on AtmoWise for 
              clinical-grade air quality monitoring and patient care management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 hover:bg-white/15 transition-colors duration-200">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-white/80 text-sm">{testimonial.role}</p>
                    {testimonial.verified && (
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-4 w-4 text-white/60 mr-1" />
                        <span className="text-white/60 text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                <Quote className="h-5 w-5 text-white/40 mb-4" />
                <p className="text-white/90 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Respiratory Care?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Join leading healthcare providers and patients who trust AtmoWise for 
            clinical-grade air quality monitoring and respiratory health management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-[#6200D9] hover:bg-[#4C00A8] text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Download className="mr-2 h-5 w-5" />
              Download App
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button
          onClick={handleGetStarted}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#6200D9] to-[#4C00A8] hover:from-[#4C00A8] hover:to-[#6200D9] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse-glow"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-[#6200D9] rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-semibold">AtmoWise</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                Clinical-grade air quality monitoring platform trusted by healthcare providers 
                and patients worldwide for respiratory health management.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Clinical Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Healthcare Integration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Analytics</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Clinical Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technical Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2024 AtmoWise. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">HIPAA Compliant</span>
              <span className="text-gray-400 text-sm">SOC 2 Certified</span>
              <span className="text-gray-400 text-sm">ISO 27001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}