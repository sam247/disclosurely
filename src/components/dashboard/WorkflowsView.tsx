import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Clock, History } from 'lucide-react';

const WorkflowsView = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">Automate case assignment and SLA management</p>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">
              <Settings className="h-4 w-4 mr-2" />
              Assignment Rules
            </TabsTrigger>
            <TabsTrigger value="sla">
              <Clock className="h-4 w-4 mr-2" />
              SLA Policies
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Workflow History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assignment Rules</CardTitle>
                    <CardDescription>
                      Configure automatic case assignment based on category, urgency, and keywords
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assignment rules configured yet.</p>
                  <p className="text-sm mt-2">Create your first rule to automate case assignment.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SLA Policies</CardTitle>
                    <CardDescription>
                      Set response time targets for different priority levels
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No SLA policies configured yet.</p>
                  <p className="text-sm mt-2">Create your first policy to track response times.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow History</CardTitle>
                <CardDescription>
                  View audit log of all workflow automation events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workflow history yet.</p>
                  <p className="text-sm mt-2">Workflow events will appear here once automation is active.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkflowsView;

