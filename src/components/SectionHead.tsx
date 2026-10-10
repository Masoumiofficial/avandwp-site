type Props = { eyebrow: string; title: string; lead?: string; id?: string };

export function SectionHead({ eyebrow, title, lead }: Props) {
  return (
    <div className="section__head">
      <span className="section__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {lead && <p className="section__lead">{lead}</p>}
    </div>
  );
}
