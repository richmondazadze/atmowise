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
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white border-2 border-red-200 shadow-2xl p-0" data-testid="modal-crisis" style={{ zIndex: 9999 }}>
        <DialogHeader className="text-center px-6 py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Emergency Support
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Get immediate help for health emergencies
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-3">
          <a
            href="tel:911"
            className="block w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg text-center text-white font-semibold transition-colors shadow-lg"
            data-testid="link-emergency-911"
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Emergency Services: 911
          </a>
          
          <a
            href="tel:555-012-3456"
            className="block w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-center text-white font-medium transition-colors shadow-lg"
            data-testid="link-campus-health"
          >
            <Hospital className="h-4 w-4 inline mr-2" />
            Campus Health: (555) 012-3456
          </a>
          
          <a
            href="tel:988"
            className="block w-full p-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-center text-white font-medium transition-colors shadow-lg"
            data-testid="link-crisis-hotline"
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Crisis Hotline: 988
          </a>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 mb-2">If experiencing:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Severe difficulty breathing</li>
                <li>• Chest pain or pressure</li>
                <li>• Fainting or dizziness</li>
                <li className="font-semibold">• Call emergency services immediately</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
          data-testid="button-close-crisis"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
