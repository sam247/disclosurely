import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LinkGenerator from '@/components/LinkGenerator';
import { useTranslation } from 'react-i18next';
import { Shield, Link as LinkIcon, Check } from 'lucide-react';

const SecureLinkView = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Secure Report Link</h2>
        <p className="text-muted-foreground mt-2">
          Manage your secure submission portal and share it with your stakeholders
        </p>
      </div>

      <LinkGenerator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Security Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">End-to-end encryption for all submissions</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Anonymous reporting capability</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Secure two-way messaging</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">GDPR compliant data handling</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">How to Share</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 text-primary font-semibold h-6 w-6 flex items-center justify-center text-xs flex-shrink-0">1</div>
              <p className="text-sm text-muted-foreground">Copy your secure link using the button above</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 text-primary font-semibold h-6 w-6 flex items-center justify-center text-xs flex-shrink-0">2</div>
              <p className="text-sm text-muted-foreground">Share it via email, intranet, or display it in your workplace</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 text-primary font-semibold h-6 w-6 flex items-center justify-center text-xs flex-shrink-0">3</div>
              <p className="text-sm text-muted-foreground">Whistleblowers can submit reports anonymously 24/7</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 text-primary font-semibold h-6 w-6 flex items-center justify-center text-xs flex-shrink-0">4</div>
              <p className="text-sm text-muted-foreground">You'll receive notifications for new submissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg">Best Practices</CardTitle>
          <CardDescription>Tips for maximizing engagement and trust</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Promote the link prominently in your internal communications</p>
          <p>• Include it in employee handbooks and onboarding materials</p>
          <p>• Display QR codes linking to the portal in common areas</p>
          <p>• Reassure employees that all reports are handled confidentially</p>
          <p>• Regularly remind staff about the availability of the reporting channel</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureLinkView;
