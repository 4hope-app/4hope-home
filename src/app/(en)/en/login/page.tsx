import LoginPage, { loginMetadata } from '@/components/pages/LoginPage';

export const metadata = loginMetadata('en');

export default function Page() {
  return <LoginPage lang="en" />;
}
