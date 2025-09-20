import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Phone, MessageCircle, Hospital, Info } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-crisis">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl font-bold text-card-foreground">
            Emergency Support
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Get immediate help for health emergencies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <a
            href="tel:911"
            className="block w-full p-4 bg-destructive hover:bg-destructive/90 rounded-lg text-center text-destructive-foreground font-semibold transition-colors"
            data-testid="link-emergency-911"
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Emergency Services: 911
          </a>
          
          <a
            href="tel:555-012-3456"
            className="block w-full p-4 bg-primary hover:bg-primary/90 rounded-lg text-center text-primary-foreground font-medium transition-colors"
            data-testid="link-campus-health"
          >
            <Hospital className="h-4 w-4 inline mr-2" />
            Campus Health: (555) 012-3456
          </a>
          
          <a
            href="tel:988"
            className="block w-full p-4 bg-muted hover:bg-muted/80 rounded-lg text-center text-card-foreground font-medium transition-colors"
            data-testid="link-crisis-hotline"
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Crisis Hotline: 988
          </a>
        </div>

        <Alert className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">If experiencing:</p>
            <ul className="text-xs space-y-1">
              <li>• Severe difficulty breathing</li>
              <li>• Chest pain or pressure</li>
              <li>• Fainting or dizziness</li>
              <li>• Call emergency services immediately</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Button
          onClick={onClose}
          variant="secondary"
          className="w-full"
          data-testid="button-close-crisis"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
