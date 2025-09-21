'use client'

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportShareButtonProps {
  airQualityData: {
    aqi: number;
    category: string;
    dominantPollutant: string;
    location: string;
    timestamp: string;
  };
  className?: string;
}

export function ExportShareButton({ airQualityData, className = '' }: ExportShareButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExportPNG = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `atmowise-air-quality-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Export Successful",
            description: "Air quality card saved as PNG image",
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not export image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = `🌬️ Air Quality Report
📍 Location: ${airQualityData.location}
📊 AQI: ${airQualityData.aqi} (${airQualityData.category})
🔍 Dominant Pollutant: ${airQualityData.dominantPollutant}
⏰ Time: ${new Date(airQualityData.timestamp).toLocaleString()}

Track your air quality with AtmoWise!`;

      await navigator.clipboard.writeText(text);
      
      toast({
        title: "Copied to Clipboard",
        description: "Air quality data copied to clipboard",
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowOptions(false);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      // Fallback to copy to clipboard
      await handleCopyToClipboard();
      return;
    }

    setIsSharing(true);
    try {
      const shareData = {
        title: 'AtmoWise Air Quality Report',
        text: `Current air quality: AQI ${airQualityData.aqi} (${airQualityData.category}) in ${airQualityData.location}`,
        url: window.location.href,
      };

      await navigator.share(shareData);
      
      toast({
        title: "Shared Successfully",
        description: "Air quality data shared",
      });
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to copy to clipboard
      await handleCopyToClipboard();
    } finally {
      setIsSharing(false);
      setShowOptions(false);
    }
  };

  return (
    <div className={`fixed bottom-34 right-5 z-50 ${className}`}>
      {/* Floating Action Button */}
      <Button
        onClick={() => setShowOptions(!showOptions)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6200D9] to-[#BA5FFF] hover:from-[#4C00A8] hover:to-[#A855F7] text-white shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Export or Share"
      >
        <Share2 className="h-5 w-5" />
      </Button>

      {/* Options Panel */}
      {showOptions && (
        <div className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Export & Share
            </h3>
            
            <Button
              onClick={handleExportPNG}
              disabled={isExporting}
              variant="outline"
              className="w-full justify-start gap-3 h-10 text-sm"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6200D9]"></div>
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {isExporting ? 'Exporting...' : 'Save as PNG'}
            </Button>

            <Button
              onClick={handleShare}
              disabled={isSharing}
              variant="outline"
              className="w-full justify-start gap-3 h-10 text-sm"
            >
              {isSharing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6200D9]"></div>
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="w-full justify-start gap-3 h-10 text-sm"
            >
              <Copy className="h-4 w-4" />
              Copy Text
            </Button>
          </div>
        </div>
      )}

      {/* Hidden card for export (positioned off-screen) */}
      <div 
        ref={cardRef}
        className="fixed -top-[9999px] left-0 w-80 bg-white rounded-2xl shadow-xl p-6"
        style={{ transform: 'translateX(-9999px)' }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-[#6200D9]">
                {airQualityData.aqi}
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {airQualityData.category}
              </div>
              <div className="text-sm text-gray-600">
                {airQualityData.location}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(airQualityData.timestamp).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Dominant Pollutant: {airQualityData.dominantPollutant}
              </div>
              <div className="text-xs text-gray-400">
                Generated by AtmoWise
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

