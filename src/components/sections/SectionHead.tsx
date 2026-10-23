import type { ReactNode } from 'react';

interface Props {
  kicker: string;
  title: string;
  lead?: string;
  id?: string;
  children?: ReactNode;
}

export default function SectionHead({ kicker, title, lead, id, children }: Props) {
  return (
    <div className="section-head">
      <p className="kicker">{kicker}</p>
      <h2 className="display-title" id={id}>
        {title}
      </h2>
      {lead && <p className="body-lead">{lead}</p>}
      {children}
    </div>
  );
}
