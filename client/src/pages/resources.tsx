import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { CrisisModal } from "@/components/CrisisModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LifeBuoy, Phone, ExternalLink, Hospital, MessageCircle, BookOpen, MapPin } from "lucide-react";
import type { Resource } from "@shared/schema";

export default function Resources() {
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
    queryFn: async () => {
      const response = await fetch("/api/resources");
      if (!response.ok) throw new Error("Failed to fetch resources");
      return response.json();
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "clinic":
      case "hospital":
        return Hospital;
      case "emergency":
        return Phone;
      case "hotline":
        return MessageCircle;
      case "education":
        return BookOpen;
      default:
        return LifeBuoy;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-destructive text-destructive-foreground";
      case "clinic":
      case "hospital":
        return "bg-primary text-primary-foreground";
      case "hotline":
        return "bg-chart-2 text-white";
      case "education":
        return "bg-chart-3 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LifeBuoy className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Resources</h1>
          </div>
        </header>
        
        <main className="pb-20 px-4 space-y-4">
          <div className="mt-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-pulse">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </main>
        
        <BottomNav onCrisis={() => setShowCrisisModal(true)} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LifeBuoy className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Resources</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4 space-y-4">
        {/* Quick Access Grid */}
        <div className="mt-4">
          <Card className="bg-card rounded-2xl shadow-sm border border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCrisisModal(true)}
                  className="p-4 bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors text-left"
                  data-testid="button-emergency"
                >
                  <Phone className="h-6 w-6 text-destructive mb-2" />
                  <div className="text-sm font-medium text-card-foreground">Emergency</div>
                  <div className="text-xs text-muted-foreground">Immediate help</div>
                </button>
                
                <a
                  href="tel:555-012-3456"
                  className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left"
                  data-testid="link-campus-clinic"
                >
                  <Hospital className="h-6 w-6 text-primary mb-2" />
                  <div className="text-sm font-medium text-card-foreground">Campus Clinic</div>
                  <div className="text-xs text-muted-foreground">Health services</div>
                </a>
                
                <a
                  href="https://www.airnow.gov/aqi/aqi-basics/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-chart-3/10 hover:bg-chart-3/20 rounded-lg transition-colors text-left"
                  data-testid="link-air-quality-tips"
                >
                  <BookOpen className="h-6 w-6 text-chart-3 mb-2" />
                  <div className="text-sm font-medium text-card-foreground">Air Quality Tips</div>
                  <div className="text-xs text-muted-foreground">Learn more</div>
                </a>
                
                <button
                  className="p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-left"
                  data-testid="button-saved-places"
                >
                  <MapPin className="h-6 w-6 text-muted-foreground mb-2" />
                  <div className="text-sm font-medium text-card-foreground">Saved Places</div>
                  <div className="text-xs text-muted-foreground">Quick check</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Resources */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-card-foreground px-2">All Resources</h3>
          
          {resources?.map((resource) => {
            const Icon = getResourceIcon(resource.type || "");
            const colorClass = getResourceColor(resource.type || "");
            
            return (
              <Card key={resource.id} className="bg-card rounded-2xl shadow-sm border border-border">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-card-foreground mb-1">
                        {resource.title}
                      </h4>
                      
                      <div className="space-y-2">
                        {resource.phone && (
                          <a
                            href={`tel:${resource.phone}`}
                            className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                            data-testid={`link-phone-${resource.id}`}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            {resource.phone}
                          </a>
                        )}
                        
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                            data-testid={`link-url-${resource.id}`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Website
                          </a>
                        )}
                      </div>
                      
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-muted/50 text-xs text-muted-foreground rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Health Disclaimer */}
        <Card className="bg-muted/30 rounded-2xl shadow-sm border border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Important:</strong> This app is for educational purposes only. 
              Always consult qualified healthcare professionals for medical advice and emergency situations.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCrisis={() => setShowCrisisModal(true)} />

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />
    </div>
  );
}
