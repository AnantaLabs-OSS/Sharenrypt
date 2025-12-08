import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

export function useBackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const setupListener = async () => {
            const listener = await CapacitorApp.addListener('backButton', () => {
                if (!isMounted) return;

                if (location.pathname !== '/') {
                    navigate(-1);
                } else {
                    CapacitorApp.exitApp();
                }
            });
            return listener;
        };

        const listenerPromise = setupListener();

        return () => {
            isMounted = false;
            listenerPromise.then(l => l.remove().catch(console.error));
        };
    }, [navigate, location]);
}
