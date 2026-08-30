import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://go-sehetak.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/dashboard/',
          '/*/login',
          '/*/register',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
