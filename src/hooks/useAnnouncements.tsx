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

export const useAnnouncements = (showOnFrontend: boolean = true, showOnBackend: boolean = false) => {
  const { profile } = useOrganization();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [profile?.organization_id, showOnFrontend, showOnBackend]);

  const fetchAnnouncements = async () => {
    if (!profile?.organization_id) {
      console.log('No organization_id found in profile:', profile);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching announcements for organization:', profile.organization_id);
      console.log('showOnFrontend:', showOnFrontend, 'showOnBackend:', showOnBackend);
      
      const query = supabase
        .from('announcement_bar')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true);

      // Filter by frontend/backend visibility
      if (showOnFrontend && showOnBackend) {
        // Show announcements that are visible on either frontend OR backend
        query.or('show_on_frontend.eq.true,show_on_backend.eq.true');
      } else if (showOnFrontend) {
        query.eq('show_on_frontend', true);
      } else if (showOnBackend) {
        query.eq('show_on_backend', true);
      } else {
        // If neither is true, return empty results
        query.eq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching announcements:', error);
        return;
      }

      console.log('Raw fetched announcements:', data);

      // Filter by date range
      const now = new Date();
      const activeAnnouncements = (data || []).filter(announcement => {
        const startDate = announcement.start_date ? new Date(announcement.start_date) : null;
        const endDate = announcement.end_date ? new Date(announcement.end_date) : null;
        
        console.log('Checking announcement:', announcement.title, {
          startDate,
          endDate,
          now,
          startValid: !startDate || now >= startDate,
          endValid: !endDate || now <= endDate
        });
        
        if (startDate && now < startDate) return false;
        if (endDate && now > endDate) return false;
        
        return true;
      });

      console.log('Active announcements after date filter:', activeAnnouncements);
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
