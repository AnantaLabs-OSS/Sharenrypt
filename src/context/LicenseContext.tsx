import React, { createContext, useContext } from 'react';

// Inlined configuration for Open Source version
export interface LicenseConfigFeatures {
    unlimitedSize: boolean;
    customTurn: boolean;
    history: boolean;
    customId: boolean;
    prioritySupport?: boolean;
}

const PRO_FEATURES: LicenseConfigFeatures = {
    unlimitedSize: true,
    customTurn: true,
    history: true,
    customId: true,
};

interface LicenseContextType {
    licenseType: 'free' | 'pro' | 'enterprise';
    features: LicenseConfigFeatures;
    activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
    isEnterpriseMode: boolean;
    isLoading: boolean;
    removeLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Always return PRO/Enterprise-like state for open source
    const licenseType = 'pro';
    const features = PRO_FEATURES;
    const isEnterpriseMode = false;
    const isLoading = false;

    const activateLicense = async () => {
        return { success: true };
    };

    const removeLicense = () => {
        // No-op
    };

    return (
        <LicenseContext.Provider value={{ licenseType, features, activateLicense, isEnterpriseMode, isLoading, removeLicense }}>
            {children}
        </LicenseContext.Provider>
    );
};

export const useLicense = () => {
    const context = useContext(LicenseContext);
    if (!context) {
        throw new Error('useLicense must be used within a LicenseProvider');
    }
    return context;
};
