import LogoutPage, { logoutMetadata } from '@/components/pages/LogoutPage';

export const metadata = logoutMetadata('en');

export default function Page() {
  return <LogoutPage lang="en" />;
}
