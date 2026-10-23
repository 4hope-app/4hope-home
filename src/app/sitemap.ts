import type { MetadataRoute } from 'next';
import { languages, type Lang } from '@/i18n/utils';
import { absoluteUrl, alternateLanguages } from '@/lib/seo';

/** Every indexable page in both languages, with hreflang alternates (same codes as the pages). */
const paths = ['/', '/privacy'];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    (Object.keys(languages) as Lang[]).map((lang) => ({
      url: absoluteUrl(path, lang),
      alternates: { languages: alternateLanguages(path) },
    })),
  );
}
