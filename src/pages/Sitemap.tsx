import React from 'react';

export function Sitemap() {
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sharencrypt.anantalabs.tech/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sharencrypt.anantalabs.tech/guide</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sharencrypt.anantalabs.tech/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
    <url>
    <loc>https://sharencrypt.anantalabs.tech/privacy</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://sharencrypt.anantalabs.tech/terms</loc>
    <priority>0.5</priority>
  </url>
</urlset>`;

    return (
        <pre className="p-4 bg-background text-foreground font-mono whitespace-pre-wrap text-xs sm:text-sm">
            {content}
        </pre>
    );
}
