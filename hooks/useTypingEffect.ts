import { useState, useEffect, useRef } from 'react';

/**
 * Typewriter effect hook for React Native
 * Displays text character by character with a configurable delay
 * @param text - The text to display
 * @param speed - Delay in milliseconds per character (default: 3ms for fast typing like ChatGPT)
 */
export function useTypingEffect(text: string, speed: number = 3) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setIsComplete(false);
    indexRef.current = 0;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!text) {
      setIsComplete(true);
      return;
    }

    function typeNextCharacter() {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
        timeoutRef.current = setTimeout(typeNextCharacter, speed);
      } else {
        setIsComplete(true);
      }
    }

    // Start typing
    timeoutRef.current = setTimeout(typeNextCharacter, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  return { displayedText, isComplete };
}

