export interface LicenseConfig {
    type: 'free' | 'pro' | 'enterprise';
    features: {
        unlimitedSize: boolean;
        customTurn: boolean;
        history: boolean;
        customId: boolean;
        prioritySupport?: boolean;
    };
}

export const FREE_FEATURES = {
    unlimitedSize: false,
    customTurn: false,
    history: false,
    customId: false,
};

export const PRO_FEATURES = {
    unlimitedSize: true,
    customTurn: true,
    history: true,
    customId: true,
};

export const ENTERPRISE_FEATURES = {
    ...PRO_FEATURES,
    prioritySupport: true,
};

// "The Binary" Logic - Mocked for this environment
// In a real scenario, this file would be excluded from the open source repo
export class ProprietaryLogic {
    static validateLicense(key: string): Promise<{ valid: boolean; type: 'pro' | 'enterprise' }> {
        // Mock Validation Logic - In real binary this is compiled code
        return new Promise((resolve) => {
            setTimeout(() => {
                if (key.startsWith('ENT-')) {
                    resolve({ valid: true, type: 'enterprise' });
                } else if (key.startsWith('PRO-')) { // Mock key or Lemon Squeezy logic here
                    resolve({ valid: true, type: 'pro' });
                } else {
                    resolve({ valid: false, type: 'pro' }); // Default fail
                }
            }, 1000);
        });
    }
}
