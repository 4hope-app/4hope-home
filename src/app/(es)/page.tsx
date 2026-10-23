import HomePage from '@/components/pages/HomePage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ lang: 'es', path: '/' });

export default function Page() {
  return <HomePage lang="es" />;
}
