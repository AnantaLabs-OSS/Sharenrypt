import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    type?: string;
}

export function SEO({
    title = 'Sharencrypt - Free Unlimited Secure File Sharing',
    description = 'Secure, peer-to-peer file sharing with no file size limits. Encrypted, blazing fast, and free. Share large files directly between devices without the cloud.',
    canonical,
    type = 'website'
}: SEOProps) {
    const siteUrl = 'https://sharencrypt.anantalabs.tech';
    const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullCanonical} />

            {/* Twitter */}
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:url" content={fullCanonical} />
        </Helmet>
    );
}
