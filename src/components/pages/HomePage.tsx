/** The home page, shared by / (es) and /en (en). */
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Hero from '../sections/Hero';
import WhatIs from '../sections/WhatIs';
import Tools from '../sections/Tools';
import Teams from '../sections/Teams';
import Community from '../sections/Community';
import Faq from '../sections/Faq';
import Contact from '../sections/Contact';
import FinalCta from '../sections/FinalCta';
import type { Lang } from '@/i18n/utils';

interface Props {
  lang: Lang;
}

export default function HomePage({ lang }: Props) {
  return (
    <>
      <Header lang={lang} path="/" />
      <main id="main">
        <Hero lang={lang} />
        <WhatIs lang={lang} />
        <Tools lang={lang} />
        {/* TODO: optional stats strip (StatCard) — add only with verified numbers (tournaments created, LAN ranked players). */}
        <Teams lang={lang} />
        <Community lang={lang} />
        <Faq lang={lang} />
        <Contact lang={lang} />
        <FinalCta lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
