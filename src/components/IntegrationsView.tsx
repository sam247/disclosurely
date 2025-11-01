import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Webhook, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const IntegrationsView: React.FC = () => {
  const integrations = [
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect Disclosurely with 5,000+ apps to automate workflows',
      icon: Zap,
      status: 'coming-soon',
      features: [
        'Auto-create cases from form submissions',
        'Send notifications to Slack/Teams',
        'Update CRM records automatically',
        'Trigger email sequences'
      ],
      estimatedRelease: 'Q2 2024'
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      description: 'Real-time notifications when cases are created or updated',
      icon: Webhook,
      status: 'coming-soon',
      features: [
        'Instant case creation notifications',
        'Status change alerts',
        'Custom payload formatting',
        'Retry logic and error handling'
      ],
      estimatedRelease: 'Q2 2024'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'coming-soon':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Coming Soon
          </Badge>
        );
      case 'available':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Available
          </Badge>
        );
      case 'beta':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Beta
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect Disclosurely with your favorite tools to streamline your compliance workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{integration.name}</CardTitle>
                      {getStatusBadge(integration.status)}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {integration.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Estimated Release:</span> {integration.estimatedRelease}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                      className="flex items-center gap-2"
                    >
                      <span>Coming Soon</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>

              {/* Coming Soon Overlay */}
              {integration.status === 'coming-soon' && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
                    <p className="text-xs text-muted-foreground">{integration.estimatedRelease}</p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Want to request an integration?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're constantly adding new integrations based on user feedback. 
              Let us know which tools you'd like to connect with Disclosurely.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <a 
                  href="mailto:support@disclosurely.com?subject=Integration Request" 
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Request Integration
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="mailto:support@disclosurely.com" 
                  className="flex items-center gap-2"
                >
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsView;
