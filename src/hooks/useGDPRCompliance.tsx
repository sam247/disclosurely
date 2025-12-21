
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import type { DataRetentionPolicy, DataExportRequest, DataErasureRequest } from '@/types/gdpr';

export const useGDPRCompliance = () => {
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicy[]>([]);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [erasureRequests, setErasureRequests] = useState<DataErasureRequest[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();

  // Fetch retention policies
  const fetchRetentionPolicies = async () => {
    if (!organization?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('organization_id', organization.id)
        .order('data_type');

      if (error) throw error;
      setRetentionPolicies(data || []);
    } catch (error) {
      // Error fetching retention policies
    }
  };

  // Fetch export requests
  const fetchExportRequests = async () => {
    if (!organization?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setExportRequests((data || []) as DataExportRequest[]);
    } catch (error) {
      // Error fetching export requests
    }
  };

  // Fetch erasure requests
  const fetchErasureRequests = async () => {
    if (!organization?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('data_erasure_requests')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure proper typing
      setErasureRequests((data || []) as DataErasureRequest[]);
    } catch (error) {
      // Error fetching erasure requests
    }
  };

  // Update retention policy
  const updateRetentionPolicy = async (id: string, updates: Partial<DataRetentionPolicy>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_retention_policies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Policy updated",
        description: "Data retention policy has been updated successfully.",
      });
      
      await fetchRetentionPolicies();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update retention policy.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create data export request
  const createExportRequest = async (emailAddress: string, requestType: DataExportRequest['request_type']) => {
    if (!organization?.id || !user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_export_requests')
        .insert({
          organization_id: organization.id,
          requested_by: user.id,
          email_address: emailAddress,
          request_type: requestType,
        });

      if (error) throw error;
      
      toast({
        title: "Export request created",
        description: "Your data export request has been submitted and will be processed shortly.",
      });
      
      await fetchExportRequests();
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Failed to create export request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create data erasure request
  const createErasureRequest = async (
    emailAddress: string, 
    erasureType: DataErasureRequest['erasure_type'],
    reason?: string
  ) => {
    if (!organization?.id || !user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_erasure_requests')
        .insert({
          organization_id: organization.id,
          requested_by: user.id,
          email_address: emailAddress,
          erasure_type: erasureType,
          reason: reason,
        });

      if (error) throw error;
      
      toast({
        title: "Erasure request created",
        description: "Your data erasure request has been submitted for review.",
      });
      
      await fetchErasureRequests();
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Failed to create erasure request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Review erasure request (admin only)
  const reviewErasureRequest = async (
    id: string, 
    status: 'approved' | 'rejected', 
    reviewNotes?: string
  ) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_erasure_requests')
        .update({
          status,
          reviewed_by: user.id,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Request reviewed",
        description: `Erasure request has been ${status}.`,
      });
      
      await fetchErasureRequests();
    } catch (error: any) {
      toast({
        title: "Review failed",
        description: error.message || "Failed to review erasure request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization?.id) {
      fetchRetentionPolicies();
      fetchExportRequests();
      fetchErasureRequests();
    }
  }, [organization?.id]);

  return {
    retentionPolicies,
    exportRequests,
    erasureRequests,
    loading,
    updateRetentionPolicy,
    createExportRequest,
    createErasureRequest,
    reviewErasureRequest,
    refreshData: () => {
      fetchRetentionPolicies();
      fetchExportRequests();
      fetchErasureRequests();
    }
  };
};
