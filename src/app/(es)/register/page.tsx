import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import { t } from '@/i18n/utils';
import { pageMetadata } from '@/lib/seo';
import RegisterForm from './RegisterForm';

const d = t('es');

export const metadata = pageMetadata({
  lang: 'es',
  path: '/register',
  title: d.auth.register.title,
  noindex: true,
});

/** Onboarding: shown once after the first Google sign-in to complete the profile. */
export default function RegisterPage() {
  return (
    <AuthShell title={d.auth.register.title} lead={d.auth.register.lead} wide>
      {/* RegisterForm reads ?callbackUrl= with useSearchParams, which needs a Suspense boundary. */}
      <Suspense>
        <RegisterForm copy={d.auth.register} legal={d.auth.legal} />
      </Suspense>
    </AuthShell>
  );
}
