/** Sign-in page with the site header and footer, shared by /login (es) and /en/login (en). */
import { Suspense } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import AuthShell from '../auth/AuthShell';
import LegalNote from '../auth/LegalNote';
import LoginForm from '../auth/LoginForm';
import { t, type Lang } from '@/i18n/utils';
import { pageMetadata } from '@/lib/seo';

interface Props {
  lang: Lang;
}

export const loginMetadata = (lang: Lang) =>
  pageMetadata({ lang, path: '/login', title: t(lang).auth.login.title, noindex: true });

export default function LoginPage({ lang }: Props) {
  const copy = t(lang).auth.login;

  return (
    <>
      <Header lang={lang} path="/login" showAccount={false} />
      <AuthShell title={copy.title} lead={copy.lead} framed>
        {/* LoginForm reads ?callbackUrl= with useSearchParams, which needs a Suspense boundary. */}
        <Suspense>
          <LoginForm copy={copy} />
        </Suspense>
        <LegalNote lang={lang} />
      </AuthShell>
      <Footer lang={lang} />
    </>
  );
}
