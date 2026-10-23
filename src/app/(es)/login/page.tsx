import LoginPage, { loginMetadata } from '@/components/pages/LoginPage';

export const metadata = loginMetadata('es');

export default function Page() {
  return <LoginPage lang="es" />;
}
