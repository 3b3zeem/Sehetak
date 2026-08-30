import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = 'https://go-sehetak.vercel.app';

  const locales = ['ar', 'en'];
  const routes = ['', '/about', '/contact', '/terms', '/privacy'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Root redirect entry
  sitemapEntries.push({
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
    alternates: {
      languages: {
        ar: `${siteUrl}/ar`,
        en: `${siteUrl}/en`,
      },
    },
  });

  // Multilingual route entries
  routes.forEach((route) => {
    locales.forEach((locale) => {
      const isHome = route === '';
      const priority = isHome ? 1.0 : route === '/about' || route === '/contact' ? 0.8 : 0.5;

      sitemapEntries.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: isHome ? 'daily' : 'weekly',
        priority,
        alternates: {
          languages: {
            ar: `${siteUrl}/ar${route}`,
            en: `${siteUrl}/en${route}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}
