import HomePage from '@/components/pages/HomePage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ lang: 'en', path: '/' });

export default function Page() {
  return <HomePage lang="en" />;
}
