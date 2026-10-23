import Card from '../ui/Card';
import Icon from '../ui/Icon';
import Tag from '../ui/Tag';
import SectionHead from './SectionHead';
import { tools } from '@/data/tools';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import styles from './Tools.module.css';

interface Props {
  lang: Lang;
}

export default function Tools({ lang }: Props) {
  const d = t(lang);
  const copy = d.tools;
  const items = copy.items as Record<string, { desc: string } | undefined>;

  return (
    <section className="section" id={sectionIds[lang].tools} aria-labelledby="tools-title">
      <div className="container">
        <SectionHead id="tools-title" kicker={copy.kicker} title={copy.title} lead={copy.lead} />
        <ul className={`grid grid--3 ${styles.tools}`}>
          {tools.map((tool) => {
            const live = tool.status === 'live' && tool.url;
            return (
              <li key={tool.id}>
                <Card href={live ? tool.url : undefined} external={!!live} className={styles.card}>
                  <div className={styles.top}>
                    <span className={styles.icon}>
                      <Icon name={tool.icon} size={22} />
                    </span>
                    {live ? (
                      <Tag scheme="brand" variant="solid" size="sm">
                        {copy.live}
                      </Tag>
                    ) : (
                      <Tag scheme="neutral" size="sm">
                        {copy.soon}
                      </Tag>
                    )}
                  </div>
                  <h3>{tool.name}</h3>
                  <p className="body">{items[tool.id]?.desc ?? ''}</p>
                  {live && (
                    <span className={styles.open}>
                      {copy.open}
                      <Icon name="ArrowRight" size={16} />
                      <span className="visually-hidden">{d.a11y.newTab}</span>
                    </span>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
