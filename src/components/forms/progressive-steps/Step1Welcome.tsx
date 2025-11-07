import { Button } from '@/components/ui/button';
import { Shield, Lock, Clock } from 'lucide-react';

interface Step1WelcomeProps {
  onContinue: () => void;
  brandColor: string;
}

const Step1Welcome = ({ onContinue, brandColor }: Step1WelcomeProps) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="flex justify-center">
        <div
          className="p-6 rounded-full"
          style={{ backgroundColor: `${brandColor}15` }}
        >
          <Shield className="w-16 h-16" style={{ color: brandColor }} />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Submit a Confidential Report
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Your identity is protected. This secure form takes approximately 5 minutes to complete.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
        <div className="flex flex-col items-center text-center space-y-3 p-4">
          <div className="p-3 rounded-lg bg-green-50">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">100% Anonymous</h3>
          <p className="text-sm text-gray-600">
            Your identity remains completely confidential throughout the process
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 p-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Secure & Encrypted</h3>
          <p className="text-sm text-gray-600">
            All data is encrypted and stored securely with enterprise-grade protection
          </p>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 p-4">
          <div className="p-3 rounded-lg bg-purple-50">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">~5 Minutes</h3>
          <p className="text-sm text-gray-600">
            Quick and easy process with step-by-step guidance
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button
          size="lg"
          onClick={onContinue}
          style={{ backgroundColor: brandColor }}
          className="px-8 py-6 text-lg"
        >
          Let's Begin →
        </Button>
      </div>

      <p className="text-xs text-gray-500 max-w-md mx-auto">
        By continuing, you agree that the information you provide will be reviewed by authorized personnel.
      </p>
    </div>
  );
};

export default Step1Welcome;
