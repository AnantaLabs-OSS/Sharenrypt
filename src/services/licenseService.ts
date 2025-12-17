import { WasmService } from './wasmBridge';



export class LicenseService {
    static async validate(key: string): Promise<{ valid: boolean; type: 'pro' | 'enterprise' | 'free'; error?: string }> {
        // 1. Check for Enterprise Mock Key (Offline/Self-Hosted)
        if (key.startsWith('ENT-')) {
            return { valid: true, type: 'enterprise' };
        }

        // 2. Lemon Squeezy Validation (Pro)
        try {
            const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // Note: In client-side code, we typically don't expose secret keys, but user requested this architecture.
                    // Ideally this call goes through a proxy. using the provided key as Bearer if required or just API key?
                    // The '/validate' endpoint sends the license key in the body.
                },
                body: JSON.stringify({
                    license_key: key
                })
            });

            const data = await response.json();

            if (data.valid) {
                return { valid: true, type: 'pro' };
            }

            // Fallback to "Proprietary Login" check if API fails or for testing 'PRO-' prefix locally
            const localCheck = await WasmService.validateLicense(key);
            if (localCheck.valid) {
                return { valid: true, type: localCheck.type };
            }

            return { valid: false, type: 'free', error: 'Invalid License' };

        } catch (error) {
            console.error("License validation failed", error);
            // Fallback to local check logic for demo purposes if network fails
            const localCheck = await WasmService.validateLicense(key);
            if (localCheck.valid) {
                return { valid: true, type: localCheck.type };
            }
            return { valid: false, type: 'free', error: 'Validation Error' };
        }
    }

    static isEnterpriseMode(): boolean {
        return import.meta.env.VITE_ENTERPRISE === 'true';
    }
}
