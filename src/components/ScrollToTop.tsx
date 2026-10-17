import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores the scroll position to the top of the page whenever the route
 * changes, so navigating to a new screen never leaves the user stranded at
 * the previous scroll offset.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
