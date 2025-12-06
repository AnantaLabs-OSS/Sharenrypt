
/**
 * Analytics Utility
 * 
 * A privacy-focused wrapper for analytics. 
 * Only tracks events if VITE_ENABLE_ANALYTICS=true.
 * Can be extended to support Google Analytics, Plausible, etc.
 */

class Analytics {
    private enabled: boolean = false;
    private initialized: boolean = false;

    constructor() {
        this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    }

    public initialize() {
        if (!this.enabled || this.initialized) return;

        console.log('📊 Analytics initialized (Privacy Mode)');

        // Optional: Load GA4 or other scripts here if configured
        const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
        if (gaId) {
            this.loadGoogleAnalytics(gaId);
        }

        this.initialized = true;
    }

    private loadGoogleAnalytics(measurementId: string) {
        // Basic Google Analytics 4 Injection
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.async = true;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
        document.head.appendChild(inlineScript);

        console.log(`📊 Google Analytics loaded: ${measurementId}`);
    }

    public trackEvent(category: string, action: string, label?: string, value?: number) {
        if (!this.enabled) return;

        // Log to console in development
        if (import.meta.env.DEV) {
            console.log(`[Analytics] ${category} - ${action}`, { label, value });
        }

        // Push to dataLayer if GA is loaded
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }

    public trackPageView(path: string) {
        if (!this.enabled) return;

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'page_view', {
                page_path: path
            });
        }
    }
}

export const analytics = new Analytics();
