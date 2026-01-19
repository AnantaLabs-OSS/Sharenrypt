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
    unlimitedSize: true,
    customTurn: true,
    history: true,
    customId: true,
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
    static validateLicense(_key: string): Promise<{ valid: boolean; type: 'pro' | 'enterprise' }> {
        // Mock Validation Logic - In real binary this is compiled code
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ valid: true, type: 'pro' });
            }, 500);
        });
    }
}
