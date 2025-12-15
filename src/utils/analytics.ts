
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
        const stored = localStorage.getItem('sharencrypt-analytics');
        // Default to TRUE if env var is true, unless user explicitly opted out ('false')
        // OR default to FALSE if env var is false.
        const envEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

        if (stored !== null) {
            this.enabled = envEnabled && stored === 'true';
        } else {
            this.enabled = envEnabled;
        }
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        localStorage.setItem('sharencrypt-analytics', String(enabled));
        if (enabled && !this.initialized) {
            this.initialize();
        }
        console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
    }

    public isEnabled(): boolean {
        return this.enabled;
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
