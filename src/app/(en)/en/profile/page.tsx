import ProfilePage, { profileMetadata } from '@/components/pages/ProfilePage';

export const metadata = profileMetadata('en');

export default async function Page({ searchParams }: PageProps<'/en/profile'>) {
  return <ProfilePage lang="en" riotResult={(await searchParams).riot} />;
}
