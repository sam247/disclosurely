import React, { useState } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import { useAnnouncements } from '@/hooks/useAnnouncements';

interface PageWithAnnouncementProps {
  children: React.ReactNode;
  showOnFrontend?: boolean;
  showOnBackend?: boolean;
}

const PageWithAnnouncement: React.FC<PageWithAnnouncementProps> = ({
  children,
  showOnFrontend = true,
  showOnBackend = false
}) => {
  const { announcements, loading } = useAnnouncements(showOnFrontend);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.has(announcement.id)
  );

  const handleDismiss = (announcementId: string) => {
    setDismissedAnnouncements(prev => new Set([...prev, announcementId]));
  };

  if (loading) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Render announcements */}
      {visibleAnnouncements.map((announcement) => (
        <AnnouncementBar
          key={announcement.id}
          title={announcement.title}
          content={announcement.content}
          onDismiss={() => handleDismiss(announcement.id)}
        />
      ))}
      {children}
    </>
  );
};

export default PageWithAnnouncement;
