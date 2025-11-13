import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignmentRulesList } from '@/components/dashboard/workflows/AssignmentRulesList';
import { SLAPoliciesList } from '@/components/dashboard/workflows/SLAPoliciesList';
import { WorkflowHistory } from '@/components/dashboard/workflows/WorkflowHistory';

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Workflow Automation</h1>
        <p className="text-muted-foreground">
          Automate report assignment and track SLA compliance
        </p>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Assignment Rules</TabsTrigger>
          <TabsTrigger value="sla">SLA Policies</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <AssignmentRulesList />
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <SLAPoliciesList />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <WorkflowHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
