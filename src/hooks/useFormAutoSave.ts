import { useEffect, useCallback, useRef } from 'react';

interface UseFormAutoSaveOptions {
  key: string;
  data: any;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Auto-save form data to localStorage with debouncing
 * Helps users avoid losing their work if they accidentally close the page
 */
export const useFormAutoSave = ({
  key,
  data,
  enabled = true,
  debounceMs = 1000
}: UseFormAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save function
  const saveToLocalStorage = useCallback((storageKey: string, formData: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          data: formData,
          timestamp: Date.now()
        }));
        console.log('📝 Auto-saved form data');
      } catch (error) {
        console.error('Failed to auto-save form data:', error);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Auto-save when data changes
  useEffect(() => {
    if (enabled && data) {
      saveToLocalStorage(key, data);
    }
  }, [enabled, key, data, saveToLocalStorage]);

  // Load saved data
  const loadSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const ageMinutes = (Date.now() - parsed.timestamp) / 1000 / 60;

        // Only restore if less than 24 hours old
        if (ageMinutes < 24 * 60) {
          console.log('📂 Restored auto-saved form data');
          return parsed.data;
        } else {
          // Clean up old data
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
    return null;
  }, [key]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(key);
      console.log('🗑️ Cleared auto-saved form data');
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
    }
  }, [key]);

  return {
    loadSavedData,
    clearSavedData
  };
};
