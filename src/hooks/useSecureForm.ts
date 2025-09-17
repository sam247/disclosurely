
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
    console.log('🔵 secureSubmit called with data:', data);
    
    if (isSubmitting) {
      console.log('❌ Already submitting, blocking duplicate submission');
      return;
    }
    
    console.log('🔵 Checking rate limit...');
    if (!checkRateLimit()) {
      console.log('❌ Rate limit exceeded');
      return;
    }
    
    console.log('🔵 Setting isSubmitting to true');
    setIsSubmitting(true);
    
    try {
      console.log('🔵 Sanitizing data...');
      const sanitizedData = validateAndSanitize(data);
      console.log('🔵 Sanitized data:', sanitizedData);
      
      if (validationFn) {
        console.log('🔵 Running validation function...');
        const isValid = validationFn(sanitizedData);
        console.log('🔵 Validation result:', isValid);
        
        if (!isValid) {
          console.log('❌ Validation failed, stopping submission');
          return;
        }
      }
      
      console.log('🔵 Calling submit function...');
      const result = await submitFn(sanitizedData);
      console.log('🔵 Submit function completed:', result);
      
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
      console.log('🔵 Setting isSubmitting to false');
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
