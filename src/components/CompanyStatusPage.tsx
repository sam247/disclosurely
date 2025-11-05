
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Search, MessageSquare, Clock } from "lucide-react";
import disclosurelyIcon from "@/assets/logos/disclosurely-icon.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "react-router-dom";
import { auditLogger } from "@/utils/auditLogger";

interface Report {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  priority: number;
  report_type: string;
  encrypted_content: string;
  encryption_key_hash: string;
  organization_id: string;
  organizations: {
    name: string;
    brand_color: string;
  };
}

interface Message {
  id: string;
  sender_type: string;
  encrypted_message: string;
  decrypted_message?: string;
  created_at: string;
  is_read: boolean;
}

interface OrganizationBranding {
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color?: string;
}

const CompanyStatusPage = () => {
  const { linkToken } = useParams();
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(null);
  const [loadingBranding, setLoadingBranding] = useState(true);

  useEffect(() => {
    fetchOrganizationBranding();
  }, [linkToken]);

  const fetchOrganizationBranding = async () => {
    if (!linkToken) {
      setLoadingBranding(false);
      return;
    }

    try {
      console.log('Fetching organization branding for link token:', linkToken);

      const { data: linkInfo, error: linkError } = await supabase
        .from('organization_links')
        .select(`
          organization_id,
          organizations!inner(
            name,
            logo_url,
            custom_logo_url,
            brand_color
          )
        `)
        .eq('link_token', linkToken)
        .eq('is_active', true)
        .maybeSingle();

      if (linkError) {
        console.error('Organization link error:', linkError);
        setLoadingBranding(false);
        return;
      }

      if (!linkInfo) {
        console.error('Organization link not found for token:', linkToken);
        setLoadingBranding(false);
        return;
      }

      console.log('Organization link found:', linkInfo);

      setOrganizationBranding({
        name: linkInfo.organizations.name,
        logo_url: linkInfo.organizations.logo_url,
        custom_logo_url: linkInfo.organizations.custom_logo_url,
        brand_color: linkInfo.organizations.brand_color
      });
    } catch (error) {
      console.error('Error fetching organization branding:', error);
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    if (!linkToken) {
      toast.error("Invalid access link");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Looking up report with tracking ID:", trackingId.trim());

      // Get the organization ID from the link token first
      const { data: linkInfo, error: linkError } = await supabase
        .from('organization_links')
        .select('organization_id')
        .eq('link_token', linkToken)
        .maybeSingle();

      if (linkError || !linkInfo) {
        console.error('Link validation error:', linkError);
        toast.error("Invalid access link");
        return;
      }

      console.log('Link validated, organization ID:', linkInfo.organization_id);

      // Look up report by tracking ID and organization ID to ensure security
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(`
          *,
          organizations!inner (name, brand_color)
        `)
        .eq("tracking_id", trackingId.trim())
        .eq("organization_id", linkInfo.organization_id)
        .maybeSingle();

      if (reportError) {
        console.error("Report lookup error:", reportError);
        toast.error("Error looking up report. Please try again.");
        return;
      }

      if (!reportData) {
        console.log("Report not found for tracking ID:", trackingId.trim());
        toast.error("Report not found. Please check your tracking ID.");
        return;
      }

      // Check if report is archived - don't show to whistleblowers
      if (reportData.status === 'archived') {
        console.log("Report is archived, not showing to whistleblower");
        toast.error("Case Not Found. Your case was either resolved or removed. Please submit a new case or check your case ID.");
        return;
      }

      console.log("Report found:", reportData);
      setReport(reportData);

      // Fetch messages for this report
      const { data: messagesData, error: messagesError } = await supabase
        .from("report_messages")
        .select("*")
        .eq("report_id", reportData.id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Messages fetch error:", messagesError);
      } else {
        console.log("Messages fetched:", messagesData?.length || 0);
        setMessages(messagesData || []);
      }

      toast.success("Report found successfully!");

    } catch (error) {
      console.error("Error looking up report:", error);
      toast.error("Failed to look up report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!report) {
      toast.error("No report selected");
      return;
    }

    setIsSubmittingMessage(true);

    try {
      console.log("Sending message for report:", report.id);

      const { error } = await supabase
        .from("report_messages")
        .insert({
          report_id: report.id,
          sender_type: "whistleblower",
          encrypted_message: newMessage.trim(),
        });

      if (error) {
        console.error("Message send error:", error);
        throw error;
      }

      // Refresh messages
      const { data: messagesData } = await supabase
        .from("report_messages")
        .select("*")
        .eq("report_id", report.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);
      setNewMessage("");
      
      // Log message to audit trail
      if (report.organization_id) {
        await auditLogger.log({
          eventType: 'report.message_sent',
          category: 'case_management',
          action: 'Whistleblower sent message',
          severity: 'low',
          actorType: 'user',
          actorEmail: 'whistleblower',
          targetType: 'report',
          targetId: report.id,
          targetName: report.tracking_id,
          summary: `Message sent on report ${report.tracking_id} via company status page`,
          description: 'Message sent via company status page interface',
          metadata: {
            message_length: newMessage.trim().length,
            sender_type: 'whistleblower',
            report_status: report.status,
          },
          organizationId: report.organization_id,
        });
      }
      
      toast.success("Message sent successfully!");

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "in_review": return "bg-yellow-100 text-yellow-800";
      case "investigating": return "bg-orange-100 text-orange-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getLogoUrl = () => {
    return organizationBranding?.custom_logo_url || organizationBranding?.logo_url;
  };

  const getBrandColor = () => {
    return organizationBranding?.brand_color || '#2563eb';
  };

  const getOrganizationName = () => {
    return organizationBranding?.name || 'Organization';
  };

  if (loadingBranding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const logoUrl = organizationBranding?.custom_logo_url || organizationBranding?.logo_url;
  const brandColor = organizationBranding?.brand_color || '#2563eb';
  const organizationName = organizationBranding?.name || 'Organization';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Organization Branding */}
      <header className="bg-white shadow-sm border-t-4 w-full" style={{ borderTopColor: brandColor }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center justify-center mr-4">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={`${organizationName} logo`}
                    className="w-10 h-10 object-contain cursor-pointer"
                    onClick={() => linkToken ? window.location.href = `/secure/tool/submit/${linkToken}` : window.location.href = '/secure/tool/status'}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <img 
                    src={disclosurelyIcon} 
                    alt="Disclosurely logo"
                    className="w-10 h-10 object-contain cursor-pointer"
                    onClick={() => linkToken ? window.location.href = `/secure/tool/submit/${linkToken}` : window.location.href = '/secure/tool/status'}
                  />
                )}
                {logoUrl && (
                  <img 
                    src={disclosurelyIcon} 
                    alt="Disclosurely logo"
                    className="w-10 h-10 object-contain cursor-pointer hidden"
                    onClick={() => linkToken ? window.location.href = `/secure/tool/submit/${linkToken}` : window.location.href = '/secure/tool/status'}
                  />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{organizationName}</h1>
                <p className="text-sm text-gray-600">Report Status Portal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Lookup Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" style={{ color: brandColor }} />
                <span>Check Report Status</span>
              </CardTitle>
              <CardDescription>
                Enter your tracking ID to view your report status and communicate securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <Label htmlFor="trackingId">Tracking ID</Label>
                  <Input
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="WB-XXXXXXXX"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use the tracking ID provided when you submitted your report
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ backgroundColor: brandColor }}
                  className="hover:opacity-90"
                >
                  {isLoading ? "Looking up..." : "Check Status"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Report Details */}
          {report && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription>
                        Submitted to {organizationName} on{" "}
                        {new Date(report.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(report.status)}>
                      {formatStatus(report.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tracking ID</p>
                      <p className="font-mono">{report.tracking_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Priority</p>
                      <p>Level {report.priority}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Report Type</p>
                      <p className="capitalize">{report.report_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p>{new Date(report.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" style={{ color: brandColor }} />
                    <span>Secure Communication</span>
                  </CardTitle>
                  <CardDescription>
                    Communicate securely with the case handler assigned to your report.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Your case handler will respond soon.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg ${
                            message.sender_type === "whistleblower"
                              ? "ml-8"
                              : "mr-8"
                          }`}
                          style={{
                            backgroundColor: message.sender_type === "whistleblower"
                              ? `${brandColor}15`
                              : "#f3f4f6"
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium">
                              {message.sender_type === "whistleblower" ? "You" : "Case Handler"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.encrypted_message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Send Message Form */}
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <Label htmlFor="newMessage">Send a message</Label>
                      <Textarea
                        id="newMessage"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmittingMessage || !newMessage.trim()}
                      style={{ backgroundColor: brandColor }}
                      className="hover:opacity-90"
                    >
                      {isSubmittingMessage ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Back to Submission Portal Link */}
      <div className="text-center py-6">
        <a 
          href="/secure/tool/submit" 
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          ← Back to Secure Submission Portal
        </a>
      </div>
    </div>
  );
};

export default CompanyStatusPage;
