import { ArrowRight, DownloadSimple } from '@phosphor-icons/react';
import { LINKS, PRODUCT } from '../data/content';

// Closing call-to-action (Hero + Features + CTA pattern from the design system).
export function FinalCta() {
  const downloadReady = Boolean(LINKS.downloadUrl);
  return (
    <section className="final-cta" aria-labelledby="cta-title">
      <div className="container final-cta__inner">
        <div>
          <h2 id="cta-title">{PRODUCT.taglineFa}</h2>
          <p>
            از نصب تا اولین پیش‌نویس، فقط چند مرحله. گاوصندوق کلیدها، صف پس‌زمینه و اتصال ریالی را از همان پیشخوان وردپرس مدیریت کنید.
          </p>
        </div>
        <div className="final-cta__actions">
          <a className="btn btn--primary" href={LINKS.purchaseUrl}>
            دریافت لایسنس آوند <ArrowRight size={16} aria-hidden="true" />
          </a>
          {downloadReady ? (
            <a className="btn btn--ghost" href={LINKS.downloadUrl} download>
              <DownloadSimple size={16} aria-hidden="true" /> دانلود بسته‌ی سایت
            </a>
          ) : (
            <span className="btn btn--ghost" aria-disabled="true">
              دانلود به‌زودی
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
