import { useState, useEffect } from 'react';
import { createClient } from 'contentful';

const CONTENTFUL_SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID || 'rm7hib748uv7';
const CONTENTFUL_DELIVERY_TOKEN = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN || 'e3JfeWQKBvfCQoqi22f6F_XzWgbZPXR9JWTyuSTGcFw';

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_TOKEN,
});

export interface Announcement {
  id: string;
  message: string;
  displayOnDashboard: boolean;
  displayOnFrontend: boolean;
  linkUrl?: string;
  linkText?: string;
}

export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch published announcements (content type: 'announcement')
        console.log('Fetching announcements from Contentful...');
        const response = await client.getEntries({
          content_type: 'announcement',
          'fields.status': 'published',
          limit: 1,
        });

        console.log('Announcements response:', response);
        console.log('Total items:', response.items.length);

        if (response.items.length > 0) {
          const item = response.items[0];
          const fields = item.fields as any;

          console.log('Announcement fields:', fields);

          setAnnouncement({
            id: item.sys.id,
            message: fields.message || '',
            displayOnDashboard: fields.displayOnDashboard || false,
            displayOnFrontend: fields.displayOnFrontend || false,
            linkUrl: fields.linkUrl,
            linkText: fields.linkText,
          });
        } else {
          console.log('No announcements found');
        }
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError('Failed to fetch announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, []);

  return { announcement, loading, error };
};
