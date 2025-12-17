import { useEffect } from 'react';

export function ScriptLoader() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://assets.lemonsqueezy.com/lemon.js';
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
    return null;
}
