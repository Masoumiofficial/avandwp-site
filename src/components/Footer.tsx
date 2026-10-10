import { DownloadSimple } from '@phosphor-icons/react';
import { LINKS, NAV_ITEMS, PRODUCT } from '../data/content';
import { Logo } from './Logo';

export function Footer() {
  const downloadReady = Boolean(LINKS.downloadUrl);
  return (
    <footer className="site-footer">
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
            <h4>دانلود</h4>
            {downloadReady ? (
              <a className="btn btn--primary btn--sm" href={LINKS.downloadUrl} download>
                <DownloadSimple size={16} aria-hidden="true" /> بسته‌ی نهایی سایت (ZIP)
              </a>
            ) : (
              <span className="btn btn--ghost btn--sm" aria-disabled="true">
                لینک دانلود به‌زودی
              </span>
            )}
            <p style={{ fontSize: '0.82rem', marginTop: 12 }}>
              نسخه‌ی استاتیک این صفحه؛ قابل آپلود روی هر هاست استاتیک.
            </p>
            <p style={{ fontSize: '0.82rem', marginTop: 6 }}>
              فایل افزونه avandwp-v{PRODUCT.version}.zip: {LINKS.pluginDownloadUrl ? <a href={LINKS.pluginDownloadUrl}>دانلود</a> : 'به‌زودی'}
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
