import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { links } from '@/data/links';
import { sectionIds } from '@/data/navigation';
import { t, type Lang } from '@/i18n/utils';
import styles from './Teams.module.css';

interface Props {
  lang: Lang;
}

// TODO: when the team launches, move this to the /equipos route and build it from the TeamHubPage template.
export default function Teams({ lang }: Props) {
  const teams = t(lang).teams;

  return (
    <section className="section" id={sectionIds[lang].teams} aria-labelledby="teams-title">
      <div className="container">
        <Card className={styles.teams}>
          <div className={styles.bars} aria-hidden="true">
            <span />
            <span />
          </div>
          <div className={styles.body}>
            <div className={styles.meta}>
              <p className="kicker">{teams.kicker}</p>
              <Badge scheme="brand">{teams.soon}</Badge>
            </div>
            <h2 id="teams-title" className="display-title">
              {teams.title}
            </h2>
            <p className="body-lead">{teams.body}</p>
            <div>
              <Button href={links.discord} external variant="subtle" iconLeft="MessageCircle">
                {teams.cta}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
