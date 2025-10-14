import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  show_on_frontend: boolean;
  show_on_backend: boolean;
  priority: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = (showOnFrontend: boolean = true) => {
  const { profile } = useOrganization();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [profile?.organization_id, showOnFrontend]);

  const fetchAnnouncements = async () => {
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const query = supabase
        .from('announcement_bar')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      // Filter by frontend/backend visibility
      if (showOnFrontend) {
        query.eq('show_on_frontend', true);
      } else {
        query.eq('show_on_backend', true);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      // Filter by date range
      const now = new Date();
      const activeAnnouncements = (data || []).filter(announcement => {
        const startDate = announcement.start_date ? new Date(announcement.start_date) : null;
        const endDate = announcement.end_date ? new Date(announcement.end_date) : null;
        
        if (startDate && now < startDate) return false;
        if (endDate && now > endDate) return false;
        
        return true;
      });

      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    announcements,
    loading,
    refetch: fetchAnnouncements
  };
};
