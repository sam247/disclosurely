import React from 'react';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import { X, ExternalLink } from 'lucide-react';

interface AnnouncementBarProps {
  showOnDashboard?: boolean;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ 
  showOnDashboard = false 
}) => {
  const { announcement, loading, error } = useAnnouncement();
  const [isVisible, setIsVisible] = React.useState(true);
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check localStorage for dismissal
  React.useEffect(() => {
    if (announcement) {
      const dismissedKey = `announcement-dismissed-${announcement.id}`;
      const dismissed = localStorage.getItem(dismissedKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [announcement]);

  const handleDismiss = () => {
    if (announcement) {
      const dismissedKey = `announcement-dismissed-${announcement.id}`;
      localStorage.setItem(dismissedKey, 'true');
      setIsDismissed(true);
    }
    setIsVisible(false);
  };

  if (loading || error || !announcement) {
    return null;
  }

  // Check if announcement should be shown in this context
  const shouldShow = showOnDashboard 
    ? announcement.displayOnDashboard 
    : announcement.displayOnFrontend;

  if (!shouldShow || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-600 text-white py-3 px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium">
              {announcement.message}
              {announcement.linkUrl && announcement.linkText && (
                <span className="ml-2">
                  <a 
                    href={announcement.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline inline-flex items-center gap-1"
                  >
                    {announcement.linkText}
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-gray-200 transition-colors flex-shrink-0 ml-4"
          aria-label="Dismiss announcement"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
