import { useState, useEffect, useRef } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className = ''
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset animation when phrases change (e.g., language change)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCurrentPhraseIndex(0);
    setCurrentText('');
    setIsDeleting(false);
    setIsComplete(false);
  }, [phrases]);

  // Start typing immediately when phrases are first loaded
  useEffect(() => {
    console.log('TypingAnimation - phrases:', phrases, 'currentText:', currentText, 'isDeleting:', isDeleting, 'isComplete:', isComplete);
    if (phrases && phrases.length > 0 && currentText === '' && !isDeleting && !isComplete && currentPhraseIndex === 0) {
      const firstPhrase = phrases[0];
      console.log('Starting to type first phrase:', firstPhrase);
      if (firstPhrase) {
        // Start typing immediately
        timeoutRef.current = setTimeout(() => {
          console.log('Setting first character:', firstPhrase[0]);
          setCurrentText(firstPhrase[0] || '');
          timeoutRef.current = null;
        }, typingSpeed);
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };
      }
    }
  }, [phrases, currentText, isDeleting, isComplete, currentPhraseIndex, typingSpeed]);

  useEffect(() => {
    if (!phrases || phrases.length === 0) {
      return;
    }

    const currentPhrase = phrases[currentPhraseIndex];
    if (!currentPhrase) return;
    
    const isLastPhrase = currentPhraseIndex === phrases.length - 1;

    // If we're on the last phrase and it's fully typed, mark as complete
    if (isLastPhrase && currentText === currentPhrase && !isDeleting) {
      setIsComplete(true);
      return;
    }

    // Don't continue if animation is complete
    if (isComplete) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Pause after typing is complete, then delete (except for last phrase)
    if (currentText === currentPhrase && !isDeleting) {
      timeoutRef.current = setTimeout(() => {
        if (!isLastPhrase) {
          setIsDeleting(true);
        } else {
          setIsComplete(true);
        }
        timeoutRef.current = null;
      }, pauseDuration);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    // Delete current text
    if (isDeleting && currentText.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1));
        timeoutRef.current = null;
      }, deletingSpeed);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    // Move to next phrase after deleting
    if (isDeleting && currentText.length === 0) {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => prev + 1);
      return;
    }

    // Type next character - this should trigger immediately when currentText is empty
    if (!isDeleting && currentText.length < currentPhrase.length) {
      timeoutRef.current = setTimeout(() => {
        const nextLength = currentText.length + 1;
        setCurrentText(currentPhrase.slice(0, nextLength));
        timeoutRef.current = null;
      }, typingSpeed);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [currentText, currentPhraseIndex, isDeleting, isComplete, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span className={className}>
      {currentText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default TypingAnimation;

