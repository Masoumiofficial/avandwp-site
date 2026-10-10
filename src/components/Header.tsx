import { useEffect, useState } from 'react';
import { LINKS, NAV_ITEMS, PRODUCT } from '../data/content';
import { Logo } from './Logo';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="site-header" style={{ boxShadow: scrolled ? '0 10px 30px -18px rgba(0,0,0,.7)' : 'none' }}>
      <div className="container site-header__inner">
        <a className="brand" href="#top" aria-label="آوند — صفحه اصلی">
          <Logo className="brand__logo" />
          <span className="brand__name">
            {PRODUCT.nameFa} | {PRODUCT.nameEn}
          </span>
          <span className="badge badge--stable">v{PRODUCT.version} Stable</span>
        </a>

        <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="ناوبری اصلی" onClick={() => setOpen(false)}>
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="btn btn--ghost btn--sm" href={LINKS.technicalGuideUrl}>
            راهنمای فنی
          </a>
          <a className="btn btn--primary btn--sm" href={LINKS.purchaseUrl}>
            دریافت لایسنس آوند
          </a>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? 'بستن منو' : 'باز کردن منو'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
