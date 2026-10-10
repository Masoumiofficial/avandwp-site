import { LINKS, NAV_ITEMS, PRODUCT, RASTCHIN_PRODUCT_URL } from '../data/content';
import { Logo } from './Logo';

export function Footer() {
  const purchaseLabel = RASTCHIN_PRODUCT_URL ? 'خرید افزونه در راست‌چین' : 'مشاهده‌ی قیمت‌ها';
  return (
    <footer className="site-footer" data-scene="network">
      <div className="container">
        <div className="foot-grid">
          <div>
            <a className="brand" href="#top" style={{ marginBottom: 12 }}>
              <Logo className="brand__logo" />
              <span className="brand__name">
                {PRODUCT.nameFa} | {PRODUCT.nameEn}
              </span>
            </a>
            <p style={{ marginTop: 12 }}>{PRODUCT.taglineFa}</p>
            <span className="health" title="وضعیت نسخه">
              v{PRODUCT.version} · پایدار
            </span>
          </div>

          <div>
            <h4>محصول</h4>
            <ul>
              {NAV_ITEMS.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>مستندات</h4>
            <ul>
              <li>
                <a href={LINKS.technicalGuideUrl}>راهنمای فنی</a>
              </li>
              <li>
                <a href={LINKS.docsUrl}>راه‌اندازی در ۳ مرحله</a>
              </li>
              <li>
                <a href={LINKS.docsUrl}>گاوصندوق و کلیدهای API</a>
              </li>
              <li>
                <a href={LINKS.statusUrl}>وضعیت سلامت نسخه</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>خرید</h4>
            <a className="btn btn--primary btn--sm" href={LINKS.purchaseUrl}>
              {purchaseLabel}
            </a>
            <p style={{ fontSize: '0.82rem', marginTop: 12 }}>
              فروش افزونه‌ی AvandWP از طریق فروشگاه راست‌چین.
            </p>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© ۱۴۰۵ آوند (AvandWP). تمامی حقوق محفوظ است.</span>
          <span className="mono">AvandWP v{PRODUCT.version} · AI Content, WooCommerce &amp; Support Suite</span>
        </div>
      </div>
    </footer>
  );
}
