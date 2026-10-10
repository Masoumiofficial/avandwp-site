import { SECURITY_CARDS } from '../data/content';
import { SectionHead } from './SectionHead';

const icons = ['🔐', '🔗', '🛡️', '🧹'];

export function Security() {
  return (
    <section className="section section--dark" id="security" aria-labelledby="sec-title">
      <div className="container">
        <SectionHead
          eyebrow="SECURITY & ARCHITECTURE"
          title="امنیت و معماری داده"
          lead="چهار اصل فنی معماری آوند؛ جزئیات پیاده‌سازی در مستندات فنی آمده است."
        />
        <div className="sec-grid">
          {SECURITY_CARDS.map((c, i) => (
            <article key={c.title} className="card card--dark sec-card">
              <span className="shield" aria-hidden="true" style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                {icons[i]}
              </span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <span className="tag">{c.tag}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
