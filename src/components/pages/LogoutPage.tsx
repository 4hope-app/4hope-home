/**
 * Sign-out page with the site header and footer, shared by /logout (es) and /en/logout (en).
 * Tools on 4hope.app subdomains link here: /logout?callbackUrl=https%3A%2F%2Fbracket.4hope.app%2F.
 */
import { Suspense } from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import AuthShell from '../auth/AuthShell';
import LogoutForm from '../auth/LogoutForm';
import { localizePath, t, type Lang } from '@/i18n/utils';
import { pageMetadata } from '@/lib/seo';

interface Props {
  lang: Lang;
}

export const logoutMetadata = (lang: Lang) =>
  pageMetadata({ lang, path: '/logout', title: t(lang).auth.logout.title, noindex: true });

export default function LogoutPage({ lang }: Props) {
  const copy = t(lang).auth.logout;

  return (
    <>
      <Header lang={lang} path="/logout" showAccount={false} />
      <AuthShell title={copy.title} lead={copy.lead} framed>
        {/* LogoutForm reads ?callbackUrl= with useSearchParams, which needs a Suspense boundary. */}
        <Suspense>
          <LogoutForm copy={copy} fallback={localizePath('/', lang)} />
        </Suspense>
      </AuthShell>
      <Footer lang={lang} />
    </>
  );
}
