import Card from '../ui/Card';
import Icon from '../ui/Icon';
import SectionHead from './SectionHead';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import styles from './WhatIs.module.css';

interface Props {
  lang: Lang;
}

export default function WhatIs({ lang }: Props) {
  const w = t(lang).whatIs;

  return (
    <section className="section" id={sectionIds[lang].about} aria-labelledby="about-title">
      <div className="container">
        <SectionHead id="about-title" kicker={w.kicker} title={w.title} lead={w.lead} />
        <ul className={`grid grid--3 ${styles.points}`}>
          {w.points.map((p) => (
            <Card as="li" key={p.title}>
              <span className={styles.icon}>
                <Icon name={p.icon} size={22} />
              </span>
              <h3>{p.title}</h3>
              <p className="body">{p.body}</p>
            </Card>
          ))}
        </ul>
      </div>
    </section>
  );
}
