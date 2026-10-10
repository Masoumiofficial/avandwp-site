import { FAQ_ITEMS } from '../data/content';
import { SectionHead } from './SectionHead';

export function Faq() {
  return (
    <section className="section section--dark" id="faq" data-scene="bubbles" aria-labelledby="faq-title">
      <div className="container">
        <SectionHead eyebrow="FAQ" title="سؤالات متداول" lead="پاسخ‌های کوتاه و صادقانه به پرسش‌هایی که بیشتر پرسیده می‌شوند." />
        <div className="faq">
          {FAQ_ITEMS.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
