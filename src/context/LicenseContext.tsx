import React, { createContext, useContext, useState, useEffect } from 'react';
import { LicenseService } from '../services/licenseService';
import { FREE_FEATURES, PRO_FEATURES, ENTERPRISE_FEATURES, LicenseConfig } from '../proprietary';

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
    const [licenseType, setLicenseType] = useState<'free' | 'pro' | 'enterprise'>('free');
    const [isLoading, setIsLoading] = useState(true);
    const isEnterpriseMode = LicenseService.isEnterpriseMode();

    useEffect(() => {
        // Load saved license on startup
        const savedKey = localStorage.getItem('sharencrypt_license_key');
        if (savedKey) {
            validateAndSet(savedKey);
        } else {
            setIsLoading(false);
        }
    }, []);

    const validateAndSet = async (key: string) => {
        setIsLoading(true);
        const result = await LicenseService.validate(key);

        if (result.valid) {
            // Enterprise Mode Restriction: Can ONLY activate Enterprise keys
            if (isEnterpriseMode && result.type !== 'enterprise') {
                setLicenseType('free'); // Or keep locked
                // localStorage.removeItem('sharencrypt_license_key'); // Don't save invalid keys for mode
            } else {
                setLicenseType(result.type as any);
                localStorage.setItem('sharencrypt_license_key', key);
            }
        } else {
            setLicenseType('free');
            localStorage.removeItem('sharencrypt_license_key');
        }
        setIsLoading(false);
        return result;
    };

    const activateLicense = async (key: string) => {
        const result = await validateAndSet(key);
        return { success: result.valid, error: result.valid ? undefined : result.error };
    };

    const removeLicense = () => {
        localStorage.removeItem('sharencrypt_license_key');
        setLicenseType('free');
    };

    // Determine features based on type
    let features = FREE_FEATURES;
    if (licenseType === 'pro') features = PRO_FEATURES;
    if (licenseType === 'enterprise') features = ENTERPRISE_FEATURES;

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
