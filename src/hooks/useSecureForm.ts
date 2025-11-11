
import { useState, useCallback } from 'react';
import { validateEmail, validateTrackingId, sanitizeInput, clientRateLimit } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';

interface UseSecureFormOptions {
  rateLimitKey?: string;
  maxAttempts?: number;
  windowMs?: number;
}

export const useSecureForm = (options: UseSecureFormOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    rateLimitKey = 'default',
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000
  } = options;

  const validateAndSanitize = useCallback((data: Record<string, any>) => {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else {
        // Preserve non-string values (numbers, booleans, objects, etc.)
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }, []);

  const checkRateLimit = useCallback(() => {
    if (!clientRateLimit.isAllowed(rateLimitKey, maxAttempts, windowMs)) {
      toast({
        title: "Too many attempts",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [rateLimitKey, maxAttempts, windowMs, toast]);

  const secureSubmit = useCallback(async (
    submitFn: (data: any) => Promise<any>,
    data: any,
    validationFn?: (data: any) => boolean
  ) => {
    
    
    if (isSubmitting) {
      
      return;
    }
    
    
    if (!checkRateLimit()) {
      
      return;
    }
    
    
    setIsSubmitting(true);
    
    try {
      
      const sanitizedData = validateAndSanitize(data);
      
      
      if (validationFn) {
        
        const isValid = validationFn(sanitizedData);
        
        
        if (!isValid) {
          
          return;
        }
      }
      
      
      const result = await submitFn(sanitizedData);
      
      
      clientRateLimit.reset(rateLimitKey);
      return result;
    } catch (error) {
      console.error('❌ Secure form submission error:', error);
      toast({
        title: "Submission failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      
      setIsSubmitting(false);
    }
  }, [isSubmitting, checkRateLimit, validateAndSanitize, rateLimitKey, toast]);

  return {
    isSubmitting,
    secureSubmit,
    validateAndSanitize,
    checkRateLimit
  };
};
