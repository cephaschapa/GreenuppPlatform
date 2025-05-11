import { useState, useEffect } from 'react';

/**
 * A hook that returns true if the media query matches the current viewport size.
 * @param query The CSS media query to check
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Create the media query
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial match state
    setMatches(mediaQuery.matches);
    
    // Define the event handler function
    const handleResize = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the event listener
    mediaQuery.addEventListener('change', handleResize);
    
    // Clean up the event listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, [query]);
  
  return matches;
}