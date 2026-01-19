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


