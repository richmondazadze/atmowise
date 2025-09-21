'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface SponsorSectionProps {
  className?: string;
}

export function SponsorSection({ className = '' }: SponsorSectionProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.7 }}
      className={className}
    >
      <Card className="shadow-sm border-red-200 bg-gradient-to-r from-gray-900 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Heart className="h-5 w-5 text-red-500" />
            Challenge Sponsored by
          </CardTitle>
          <p className="text-sm text-white/80">
            Supporting air quality awareness and health innovation
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Sponsor Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="relative"
            >
              {/* Fallback red line design if no logo is provided */}
              <div className="w-48 h-12 flex items-center justify-center">
                <div className="w-32 h-1 bg-red-500 rounded-full relative overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                  />
                </div>
              </div>
              
              {/* Uncomment and use when sponsor logo is available */}
              {/* 
              <Image
                src="/sponsors/logo.wepb"
                alt="Sponsor Logo"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
                priority
              />
              */}
            </motion.div>
            
            {/* Sponsor Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="text-center"
            >
              <h3 className="text-lg font-semibold text-white mb-1">
                Our Sponsor
              </h3>
              <p className="text-sm text-white/70 mb-3">
                Dedicated to improving air quality and public health
              </p>
              
              {/* Sponsor Link Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
