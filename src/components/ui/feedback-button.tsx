import React from 'react';
import { Button as BaseButton, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps extends ButtonProps {
  feedback?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const FeedbackButton = React.forwardRef<HTMLButtonElement, FeedbackButtonProps>(
  ({ className, feedback = true, loading = false, loadingText = "Loading...", children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <BaseButton
        ref={ref}
        className={cn(
          feedback && !isDisabled && "transition-all duration-200 hover:scale-105 active:scale-95",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            {loadingText}
          </>
        ) : (
          children
        )}
      </BaseButton>
    );
  }
);

FeedbackButton.displayName = "FeedbackButton";

export { FeedbackButton };
export type { FeedbackButtonProps };
