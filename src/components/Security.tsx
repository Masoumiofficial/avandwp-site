import { Broom, LockKey, ShareNetwork, ShieldCheck, type Icon } from '@phosphor-icons/react';
import { SECURITY_CARDS } from '../data/content';
import { SectionHead } from './SectionHead';

const ICONS: Icon[] = [LockKey, ShareNetwork, ShieldCheck, Broom];

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
          {SECURITY_CARDS.map((c, i) => {
            const Icon = ICONS[i];
            return (
              <article key={c.title} className="card card--dark sec-card">
                <span className="shield" aria-hidden="true">
                  <Icon size={28} weight="duotone" />
                </span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <span className="tag">{c.tag}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
