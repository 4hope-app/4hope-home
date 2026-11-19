import LogoutPage, { logoutMetadata } from '@/components/pages/LogoutPage';

export const metadata = logoutMetadata('es');

export default function Page() {
  return <LogoutPage lang="es" />;
}
