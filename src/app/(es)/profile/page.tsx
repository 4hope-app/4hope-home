import ProfilePage, { profileMetadata } from '@/components/pages/ProfilePage';

export const metadata = profileMetadata('es');

export default async function Page({ searchParams }: PageProps<'/profile'>) {
  return <ProfilePage lang="es" riotResult={(await searchParams).riot} />;
}
