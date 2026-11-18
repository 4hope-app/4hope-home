import TermsPage, { termsMetadata } from '@/components/pages/TermsPage';

export const metadata = termsMetadata('en');

export default function Page() {
  return <TermsPage lang="en" />;
}
