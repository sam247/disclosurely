
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Search, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import BrandedFormLayout from './BrandedFormLayout';

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
  organizations: {
    name: string;
    brand_color: string;
    custom_logo_url?: string;
  };
}

interface OrganizationBranding {
  name: string;
  logo_url?: string;
  custom_logo_url?: string;
  brand_color: string;
}

interface Message {
  id: string;
  sender_type: string;
  encrypted_message: string;
  created_at: string;
  is_read: boolean;
}

const ReportStatus = () => {
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [organizationBranding, setOrganizationBranding] = useState<OrganizationBranding | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract the link token from URL if present
    const path = window.location.pathname;
    const match = path.match(/\/secure\/tool\/submit\/([^\/]+)\/status/);
    if (match) {
      setLinkToken(match[1]);
      fetchOrganizationBranding(match[1]);
    }
  }, []);

  const fetchOrganizationBranding = async (token: string) => {
    try {
      const { data: linkInfo } = await supabase
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
        .eq('link_token', token)
        .eq('is_active', true)
        .single();

      if (linkInfo) {
        setOrganizationBranding({
          name: linkInfo.organizations.name,
          logo_url: linkInfo.organizations.logo_url,
          custom_logo_url: linkInfo.organizations.custom_logo_url,
          brand_color: linkInfo.organizations.brand_color
        });
      }
    } catch (error) {
      console.error('Error fetching organization branding:', error);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Looking up report with tracking ID:", trackingId.trim());

      // Look up report by tracking ID only - no access key validation needed
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(`
          *,
          organizations!inner (name, brand_color)
        `)
        .eq("tracking_id", trackingId.trim())
        .single();

      if (reportError || !reportData) {
        console.error("Report lookup error:", reportError);
        toast.error("Report not found. Please check your tracking ID.");
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

  return (
    <BrandedFormLayout
      title={organizationBranding?.name || 'Report Status Portal'}
      description="Track and manage your secure report submissions"
      organizationName={organizationBranding?.name}
      logoUrl={organizationBranding?.custom_logo_url}
      brandColor={organizationBranding?.brand_color}
    >
      <div className="space-y-6">
                {/* Lookup Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="h-5 w-5 text-blue-600" />
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
                      <Button type="submit" disabled={isLoading}>
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
                              Submitted to {report.organizations?.name} on{" "}
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
                          <MessageSquare className="h-5 w-5 text-blue-600" />
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
                                    ? "bg-blue-50 ml-8"
                                    : "bg-gray-50 mr-8"
                                }`}
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
                          <Button type="submit" disabled={isSubmittingMessage || !newMessage.trim()}>
                            {isSubmittingMessage ? "Sending..." : "Send Message"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
      </div>
    </BrandedFormLayout>
  );
};

export default ReportStatus;
