import React, { useEffect, useState } from 'react';

declare global {
    interface Window {
        Go: any;
    }
}

export const WasmLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWasm = async () => {
            try {
                // Load the Go Wasm shim
                // We assume wasm_exec.js is already loaded via index.html or dynamic import
                // To be safe, we check if window.Go is defined, if not we wait or load it

                if (!window.Go) {
                    // Dynamically load the shim if not present (though we will add to index.html for simplicity)
                    const script = document.createElement('script');
                    script.src = '/wasm_exec.js';
                    script.async = true;

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = () => reject(new Error('Failed to load wasm_exec.js'));
                        document.body.appendChild(script);
                    });
                }

                const go = new window.Go();
                const result = await WebAssembly.instantiateStreaming(
                    fetch('/sharencrypt.wasm'),
                    go.importObject
                );

                // Run the Go program
                // We don't await this because it blocks (it's the main loop)
                go.run(result.instance);

                console.log('Pro Logic Wasm Loaded');
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load Wasm:', err);
                setError('Failed to load security module');
                setIsLoading(false);
            }
        };

        loadWasm();
    }, []);

    if (isLoading) {
        // You might want a splash screen here, or just render children transparently 
        // if the wasm isn't strictly required for initial render
        return <>{children}</>;
    }

    return <>{children}</>;
};
