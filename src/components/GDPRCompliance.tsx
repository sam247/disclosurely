
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGDPRCompliance } from '@/hooks/useGDPRCompliance';
import { Shield, Download, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const GDPRCompliance = () => {
  const {
    retentionPolicies,
    exportRequests,
    erasureRequests,
    loading,
    updateRetentionPolicy,
    createExportRequest,
    createErasureRequest,
    reviewErasureRequest,
  } = useGDPRCompliance();

  const [exportEmail, setExportEmail] = useState('');
  const [exportType, setExportType] = useState<'full_export' | 'report_data' | 'personal_data'>('personal_data');
  const [erasureEmail, setErasureEmail] = useState('');
  const [erasureType, setErasureType] = useState<'full_erasure' | 'anonymize_reports' | 'delete_personal_data'>('delete_personal_data');
  const [erasureReason, setErasureReason] = useState('');

  const handleExportRequest = async () => {
    if (!exportEmail) return;
    await createExportRequest(exportEmail, exportType);
    setExportEmail('');
  };

  const handleErasureRequest = async () => {
    if (!erasureEmail) return;
    await createErasureRequest(erasureEmail, erasureType, erasureReason);
    setErasureEmail('');
    setErasureReason('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      reviewing: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">GDPR Compliance</h2>
      </div>

      <Tabs defaultValue="retention" className="space-y-4">
        <TabsList>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="erasure">Data Erasure</TabsTrigger>
        </TabsList>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policies</CardTitle>
              <CardDescription>
                Configure how long different types of data are retained in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{policy.data_type.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-500">
                        Retained for {policy.retention_period_months} months
                        {policy.auto_purge_enabled && ' (Auto-purge enabled)'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={policy.retention_period_months}
                        onChange={(e) => updateRetentionPolicy(policy.id, {
                          retention_period_months: parseInt(e.target.value)
                        })}
                        className="w-20"
                        min="1"
                        max="120"
                      />
                      <span className="text-sm text-gray-500">months</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Data Export</CardTitle>
              <CardDescription>
                Users can request to export their personal data in compliance with GDPR Article 20.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="export-email">Email Address</Label>
                  <Input
                    id="export-email"
                    type="email"
                    value={exportEmail}
                    onChange={(e) => setExportEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="export-type">Export Type</Label>
                  <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_data">Personal Data Only</SelectItem>
                      <SelectItem value="report_data">Reports & Messages</SelectItem>
                      <SelectItem value="full_export">Complete Data Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleExportRequest} 
                loading={loading}
                loadingText="Creating..."
                disabled={!exportEmail}
              >
                <Download className="w-4 h-4 mr-2" />
                Create Export Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Requests</CardTitle>
              <CardDescription>Recent data export requests and their status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No export requests found.</p>
                ) : (
                  exportRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{request.email_address}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.request_type.replace('_', ' ')} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {request.export_file_url && request.status === 'completed' && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={request.export_file_url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erasure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Data Erasure</CardTitle>
              <CardDescription>
                Users can request deletion of their personal data under GDPR Article 17 (Right to be Forgotten).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="erasure-email">Email Address</Label>
                  <Input
                    id="erasure-email"
                    type="email"
                    value={erasureEmail}
                    onChange={(e) => setErasureEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="erasure-type">Erasure Type</Label>
                  <Select value={erasureType} onValueChange={(value: any) => setErasureType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delete_personal_data">Delete Personal Data</SelectItem>
                      <SelectItem value="anonymize_reports">Anonymize Reports</SelectItem>
                      <SelectItem value="full_erasure">Complete Data Erasure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="erasure-reason">Reason (Optional)</Label>
                <Textarea
                  id="erasure-reason"
                  value={erasureReason}
                  onChange={(e) => setErasureReason(e.target.value)}
                  placeholder="Please provide a reason for this erasure request..."
                />
              </div>
              <Button 
                onClick={handleErasureRequest} 
                loading={loading}
                loadingText="Creating..."
                disabled={!erasureEmail}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Create Erasure Request
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Erasure Requests</CardTitle>
              <CardDescription>Manage data erasure requests requiring review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {erasureRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No erasure requests found.</p>
                ) : (
                  erasureRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{request.email_address}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {request.erasure_type.replace('_', ' ')} • {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reviewErasureRequest(request.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => reviewErasureRequest(request.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                      {request.reason && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium">Reason:</p>
                            <p className="text-sm text-gray-600">{request.reason}</p>
                          </div>
                        </>
                      )}
                      {request.review_notes && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium">Review Notes:</p>
                            <p className="text-sm text-gray-600">{request.review_notes}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GDPRCompliance;
