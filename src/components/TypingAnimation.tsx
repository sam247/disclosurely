import { useState, useEffect } from 'react';

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
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Reset animation when phrases change (e.g., language change)
  useEffect(() => {
    setCurrentPhraseIndex(0);
    setCurrentText('');
    setIsDeleting(false);
    setIsPaused(false);
    setIsComplete(false);
  }, [phrases]);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const currentPhrase = phrases[currentPhraseIndex];
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

    // Pause after typing is complete
    if (currentText === currentPhrase && !isDeleting && !isPaused) {
      setIsPaused(true);
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        if (!isLastPhrase) {
          setIsDeleting(true);
        }
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    // Delete current text
    if (isDeleting && currentText.length > 0) {
      const deleteTimer = setTimeout(() => {
        setCurrentText(currentText.slice(0, -1));
      }, deletingSpeed);
      return () => clearTimeout(deleteTimer);
    }

    // Move to next phrase after deleting
    if (isDeleting && currentText.length === 0) {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => prev + 1);
      return;
    }

    // Type next character
    if (!isDeleting && !isPaused && currentText.length < currentPhrase.length) {
      const typeTimer = setTimeout(() => {
        setCurrentText(currentPhrase.slice(0, currentText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(typeTimer);
    }
  }, [currentText, currentPhraseIndex, isDeleting, isPaused, isComplete, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default TypingAnimation;

