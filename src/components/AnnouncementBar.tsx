import React from 'react';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import { X } from 'lucide-react';

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
    <div className="bg-blue-600 text-white py-2.5 px-3 sm:py-3 sm:px-4 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm font-medium text-center break-words">
            {announcement.message && (
              <>
                {announcement.message}
                {announcement.linkUrl && announcement.linkText && (
                  <span className="ml-1 sm:ml-2 whitespace-nowrap">
                    <a 
                      href={announcement.linkUrl}
                      className="underline hover:no-underline"
                    >
                      {announcement.linkText}
                    </a>
                  </span>
                )}
              </>
            )}
            {!announcement.message && announcement.linkUrl && (
              <a 
                href={announcement.linkUrl}
                className="underline hover:no-underline"
              >
                {announcement.linkText || announcement.linkUrl}
              </a>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-gray-200 transition-colors flex-shrink-0 ml-2"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
