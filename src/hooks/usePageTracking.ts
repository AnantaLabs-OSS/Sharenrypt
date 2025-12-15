import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../utils/analytics';

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        // Track the page view on location change
        analytics.trackPageView(location.pathname);
    }, [location]);
}
