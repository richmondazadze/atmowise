import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Heart, Baby, Clock } from "lucide-react";
import type { Profile } from "@shared/schema";

interface ProfileTogglesProps {
  profile: Profile | null;
  onUpdate: (updates: Partial<Profile>) => void;
}

export function ProfileToggles({ profile, onUpdate }: ProfileTogglesProps) {
  const sensitivity = profile?.sensitivity || {};

  const handleToggle = (key: string, value: boolean | string) => {
    const updatedSensitivity = {
      ...sensitivity,
      [key]: value,
    };
    onUpdate({
      sensitivity: updatedSensitivity,
    });
  };

  return (
    <Card className="bg-card rounded-2xl shadow-sm border border-border" data-testid="card-profile">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Personal Sensitivity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <span className="text-card-foreground">Asthma</span>
            </div>
            <Switch
              checked={sensitivity.asthma || false}
              onCheckedChange={(checked) => handleToggle("asthma", checked)}
              data-testid="toggle-asthma"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Baby className="h-5 w-5 text-muted-foreground" />
              <span className="text-card-foreground">Pregnancy</span>
            </div>
            <Switch
              checked={sensitivity.pregnant || false}
              onCheckedChange={(checked) => handleToggle("pregnant", checked)}
              data-testid="toggle-pregnancy"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-card-foreground">Older Adult (65+)</span>
            </div>
            <Switch
              checked={sensitivity.ageGroup === "elderly"}
              onCheckedChange={(checked) => handleToggle("ageGroup", checked ? "elderly" : "adult")}
              data-testid="toggle-senior"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
