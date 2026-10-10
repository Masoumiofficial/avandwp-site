import { useState } from 'react';
import { BYOK_NOTE, Currency, LICENSE_TIERS, LINKS, PRICING_CONFIRMED } from '../data/content';
import { SectionHead } from './SectionHead';

const formatPrice = (amount: number, currency: Currency) =>
  currency === 'usd'
    ? { value: `$${amount.toLocaleString('en-US')}`, unit: 'USD / سال' }
    : { value: amount.toLocaleString('fa-IR'), unit: 'تومان / سال' };

export function Pricing() {
  const [currency, setCurrency] = useState<Currency>('toman');

  return (
    <section className="section" id="pricing" aria-labelledby="pricing-title" style={{ background: 'var(--avand-bg-light)' }}>
      <div className="container">
        <SectionHead
          eyebrow="LICENSE TIERS"
          title="تعرفه و لایسنس آوند"
          lead="سه سطح لایسنس بر اساس تعداد سایت وردپرسی. هزینه‌ی توکن AI جداگانه و مستقیم به ارائه‌دهنده پرداخت می‌شود."
        />

        <div className="pricing-top">
          <div className="switch" role="group" aria-label="انتخاب واحد پول">
            <button type="button" aria-pressed={currency === 'toman'} onClick={() => setCurrency('toman')}>
              تومان
            </button>
            <button type="button" aria-pressed={currency === 'usd'} onClick={() => setCurrency('usd')}>
              USD
            </button>
          </div>
        </div>

        <div className="plans">
          {LICENSE_TIERS.map((t) => {
            const price = formatPrice(t.prices[currency], currency);
            const featured = t.id === 'pro';
            return (
              <article key={t.id} className={`card plan${featured ? ' plan--featured' : ''}`}>
                {featured && <span className="plan__ribbon">پیشنهاد اصلی</span>}
                <div>
                  <span className="badge" style={{ marginBottom: 10 }}>{t.tag}</span>
                  <h3 className="plan__name">{t.name}</h3>
                  <div className="plan__sites">{t.sites.toLocaleString('fa-IR')} دامنه‌ی وردپرسی</div>
                </div>
                <div className="plan__price">
                  {price.value}
                  <small>{price.unit}</small>
                </div>
                <ul>
                  {t.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a className={`btn ${featured ? 'btn--primary' : 'btn--light'}`} href={LINKS.purchaseUrl}>
                  انتخاب {t.name}
                </a>
              </article>
            );
          })}
        </div>

        <div className="pricing-foot">
          {!PRICING_CONFIRMED && (
            <div className="notice notice--warn" role="note">
              <strong>توجه:</strong> قیمت‌های این بخش نمایشی‌اند و هنوز تأیید نهایی نشده‌اند. پیش از انتشار عمومی، مقادیر را در فایل <span className="ltr">src/data/content.ts</span> به‌روز کنید.
            </div>
          )}
          <div className="notice notice--info" role="note">
            <strong>مدل BYOK: </strong>
            {BYOK_NOTE}
          </div>
        </div>
      </div>
    </section>
  );
}
