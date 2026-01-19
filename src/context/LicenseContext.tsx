import React, { createContext, useContext } from 'react';
import { PRO_FEATURES, LicenseConfig } from '../proprietary';

interface LicenseContextType {
    licenseType: 'free' | 'pro' | 'enterprise';
    features: LicenseConfig['features'];
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
