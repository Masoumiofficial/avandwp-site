import { ArrowRight } from '@phosphor-icons/react';
import { LINKS, PRODUCT, RASTCHIN_PRODUCT_URL } from '../data/content';

// Closing call-to-action (Hero + Features + CTA pattern from the design system).
export function FinalCta() {
  const purchaseLabel = RASTCHIN_PRODUCT_URL ? 'خرید افزونه' : 'مشاهده‌ی قیمت‌ها';
  return (
    <section className="final-cta" data-scene="burst" aria-labelledby="cta-title">
      <div className="container final-cta__inner">
        <div>
          <h2 id="cta-title">{PRODUCT.taglineFa}</h2>
          <p>
            از نصب تا اولین پیش‌نویس، فقط چند مرحله. گاوصندوق کلیدها، صف پس‌زمینه و اتصال ریالی را از همان پیشخوان وردپرس مدیریت کنید.
          </p>
        </div>
        <div className="final-cta__actions">
          <a className="btn btn--primary" href={LINKS.purchaseUrl}>
            {purchaseLabel} <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
