"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Brain,
  Users,
  ArrowRight,
  MapPin,
  Wind,
  Sun,
  Activity,
  BarChart3,
  ChevronRight,
  Heart,
  Zap,
  Globe,
  Star,
  AlertTriangle,
  Cloud,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Clinical-Grade AI Analysis",
      description:
        "Advanced machine learning algorithms analyze your health data against air quality patterns to provide evidence-based recommendations.",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
    {
      icon: Shield,
      title: "Multi-Source Air Quality Data",
      description:
        "Real-time monitoring from EPA, WHO, and international agencies with 99.9% accuracy and sub-hourly updates.",
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      icon: BarChart3,
      title: "Longitudinal Health Tracking",
      description:
        "Comprehensive analytics dashboard tracking symptom patterns, medication effectiveness, and environmental triggers.",
      color: "bg-purple-50 border-purple-200 text-purple-700",
    },
    {
      icon: Users,
      title: "Personal Health Insights",
      description:
        "AI-powered personalized recommendations based on your health profile, air quality exposure, and symptom patterns.",
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                <img src="/loading.svg" alt="" />
              </div>
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                AtmoWise
              </span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              {!user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/auth")}
                    className="text-gray-600 dark:text-gray-300 hover:text-[#6200D9] font-medium text-sm sm:text-base"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    className="bg-[#6200D9] hover:bg-[#4C00A8] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-[#6200D9] hover:bg-[#4C00A8] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <Badge className="mt-8 sm:mt-0 mb-6 sm:mb-8 bg-[#6200D9] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">
                  Clinical-Grade Air Quality Health Platform
                </span>
                <span className="xs:hidden">Clinical-Grade Platform</span>
              </Badge>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight max-w-5xl mx-auto px-2">
                Advanced Air Quality Health
                <span className="text-[#6200D9]"> Monitoring</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
                Clinical-grade air quality monitoring platform trusted by
                healthcare providers and patients worldwide. Real-time
                environmental health data with AI-powered insights for
                respiratory care management.
              </p>

              <div className="flex flex-col xs:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full xs:w-auto bg-[#6200D9] hover:bg-[#4C00A8] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-colors duration-200"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div
              className={`transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="relative max-w-6xl mx-auto px-2">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-200/60 dark:border-gray-700/60">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Air Quality Dashboard */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Current Air Quality
                        </h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">
                          Good
                        </Badge>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            45
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            AQI
                          </span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              PM2.5
                            </span>
                            <span className="font-medium">12 μg/m³</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              PM10
                            </span>
                            <span className="font-medium">18 μg/m³</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              O₃
                            </span>
                            <span className="font-medium">0.08 ppm</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health Insights */}
                    <div className="space-y-4 sm:space-y-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        AI Health Insights
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300">
                              Optimal conditions detected
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                              Safe for outdoor activities
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300">
                              Exercise Score: 87/100
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400">
                              Ideal for moderate exercise
                            </p>
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

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2">
              Clinical-Grade Platform Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-4">
              Built for healthcare professionals and patients, our platform
              combines advanced AI, real-time environmental data, and
              clinical-grade analytics for comprehensive respiratory health
              management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col xs:flex-row space-y-4 xs:space-y-0 xs:space-x-4 sm:space-x-6"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 mx-auto xs:mx-0`}
                >
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-center xs:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2">
            Ready to Transform Respiratory Care?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4">
            Join leading healthcare providers and patients who trust AtmoWise
            for clinical-grade air quality monitoring and respiratory health
            management.
          </p>
          <div className="flex flex-col xs:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full xs:w-auto bg-[#6200D9] hover:bg-[#4C00A8] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-colors duration-200"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                  <img src="/icon.svg" alt="" />
                </div>
                <span className="text-xl sm:text-2xl font-semibold">
                  AtmoWise
                </span>
              </div>
              <p className="text-gray-400 mb-6 sm:mb-8 max-w-md leading-relaxed text-sm sm:text-base">
                Clinical-grade air quality monitoring platform trusted by
                healthcare providers and patients worldwide for respiratory
                health management.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                Platform
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Clinical Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Healthcare Integration
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Data Analytics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                Support
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Clinical Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Technical Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm">
              &copy; 2024 AtmoWise. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <span className="text-gray-400 text-xs sm:text-sm">
                HIPAA Compliant
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">
                SOC 2 Certified
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
