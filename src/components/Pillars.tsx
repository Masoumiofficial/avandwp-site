import { PILLARS } from '../data/content';
import { SectionHead } from './SectionHead';

export function Pillars() {
  return (
    <section className="section" id="pillars" aria-labelledby="pillars-title" style={{ background: 'var(--avand-bg-light)' }}>
      <div className="container">
        <SectionHead
          eyebrow="FOUR PILLARS"
          title="معماری ۴ ستونه محصول"
          lead="هر ستون یک جریان کاری مشخص را پوشش می‌دهد و همه‌ی آن‌ها روی یک هسته‌ی مشترک وردپرس اجرا می‌شوند."
        />
        <div className="pillars">
          {PILLARS.map((p) => (
            <article key={p.key} className="card pillar">
              <div className="pillar__key">{p.key}</div>
              <h3>{p.title}</h3>
              <ul>
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
