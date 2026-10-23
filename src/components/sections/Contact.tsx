import Card from '../ui/Card';
import Icon from '../ui/Icon';
import CopyEmail from '../islands/CopyEmail';
import SectionHead from './SectionHead';
import { links } from '@/data/links';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import styles from './Contact.module.css';

interface Props {
  lang: Lang;
}

const topicKeys = ['support', 'data', 'hello'] as const;

/** mailto: link with the topic's subject and body template filled in. */
function mailto(subject: string, body: string) {
  return `mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact({ lang }: Props) {
  const c = t(lang).contact;

  // Links only: the landing has no backend. TODO: confirm the email inbox.
  return (
    <section className="section" id={sectionIds[lang].contact} aria-labelledby="contact-title">
      <div className="container">
        <SectionHead id="contact-title" kicker={c.kicker} title={c.title} lead={c.lead}>
          <p className={`body ${styles.discord}`}>
            {c.discordPrompt}{' '}
            <a href={links.discord} target="_blank" rel="noopener">
              {c.discordLink}
              <Icon name="ArrowUpRight" size={14} className={styles.discordIcon} />
            </a>
          </p>
        </SectionHead>

        <ul className={`grid grid--3 ${styles.topics}`}>
          {topicKeys.map((key) => {
            const topic = c.topics[key];
            return (
              <li key={key} className={styles.item}>
                <Card href={mailto(topic.subject, topic.template)} className={styles.card}>
                  <p className="kicker">{topic.kicker}</p>
                  <h3>{topic.title}</h3>
                  <p className="body">{topic.body}</p>
                  <span className={`button-label ${styles.cta}`}>
                    {topic.cta}
                    <Icon name="ArrowRight" size={18} />
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>

        <div className={styles.direct}>
          <Icon name="Mail" size={18} className={styles.mailIcon} />
          <span className={styles.address}>{links.email}</span>
          <CopyEmail
            email={links.email}
            label={c.copy}
            copiedLabel={c.copied}
            icon={<Icon name="Copy" size={14} />}
            className={`code ${styles.copy}`}
          />
          <span className={`meta ${styles.replies}`}>{c.replies}</span>
        </div>
      </div>
    </section>
  );
}
