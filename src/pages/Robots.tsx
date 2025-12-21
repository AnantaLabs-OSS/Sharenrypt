import React, { useEffect } from 'react';

export function Robots() {
    const content = `User-agent: *
Allow: /

Sitemap: https://sharencrypt.anantalabs.tech/sitemap.xml`;

    useEffect(() => {
        // Optional: Set content type if possible via meta or just rely on display
    }, []);

    return (
        <pre className="p-4 bg-background text-foreground font-mono whitespace-pre-wrap">
            {content}
        </pre>
    );
}
