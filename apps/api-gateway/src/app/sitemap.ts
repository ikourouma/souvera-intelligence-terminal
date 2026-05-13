import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://souvera.vercel.app';
  const lastModified = new Date();

  const routes = [
    // Homepage
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },

    // Main hubs
    { path: '/platform', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/intelligence', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/sectors', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/insights', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/access', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/resources', priority: 0.8, changeFrequency: 'monthly' as const },

    // Platform sub-pages
    { path: '/platform/terminal', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/platform/signal-engine', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/platform/data-foundation', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/platform/api', priority: 0.7, changeFrequency: 'monthly' as const },

    // Intelligence sub-pages
    { path: '/intelligence/africa', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/intelligence/caribbean', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/intelligence/map', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/intelligence/compare', priority: 0.7, changeFrequency: 'monthly' as const },

    // Sectors sub-pages
    { path: '/sectors/fintech', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sectors/critical-minerals', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sectors/energy', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sectors/agriculture', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sectors/logistics', priority: 0.7, changeFrequency: 'monthly' as const },

    // Insights sub-pages
    { path: '/insights/briefings', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/insights/rankings', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/insights/methodology', priority: 0.8, changeFrequency: 'monthly' as const },

    // Access sub-pages
    { path: '/access/request-access', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/access/request-demo', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/access/institutional', priority: 0.8, changeFrequency: 'monthly' as const },

    // Resources sub-pages
    { path: '/resources/data-sources', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/resources/compliance', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/resources/source-registry', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/resources/faq', priority: 0.7, changeFrequency: 'monthly' as const },

    // Company pages
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/status', priority: 0.5, changeFrequency: 'daily' as const },

    // Legal pages
    { path: '/legal', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/legal/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/legal/terms', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
