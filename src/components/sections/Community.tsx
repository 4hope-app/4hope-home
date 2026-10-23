import Button from '../ui/Button';
import Card from '../ui/Card';
import Icon from '../ui/Icon';
import { links, socials } from '@/data/links';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import styles from './Community.module.css';

interface Props {
  lang: Lang;
}

export default function Community({ lang }: Props) {
  const d = t(lang);
  const c = d.community;

  return (
    <section className="section" id={sectionIds[lang].community} aria-labelledby="community-title">
      <div className="container">
        <Card className={styles.community}>
          <div className={styles.text}>
            <p className="kicker">{c.kicker}</p>
            <h2 id="community-title" className="display-title">
              {c.title}
            </h2>
            <p className="body-lead">{c.body}</p>
            <div>
              <Button href={links.discord} external size="lg" iconLeft="MessageCircle">
                {c.cta}
              </Button>
            </div>
          </div>
          <div className={styles.social}>
            <p className="caption">{c.follow}</p>
            <ul>
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    className={styles.iconBtn}
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${s.label} ${d.a11y.newTab}`}
                  >
                    <Icon name={s.icon} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </section>
  );
}
