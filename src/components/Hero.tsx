import { lazy, Suspense } from 'react';
import { Play } from '@phosphor-icons/react';
import { HERO_STATS, LINKS, PRODUCT } from '../data/content';
import { Logo } from './Logo';

// Three.js vascular core is code-split. Without WebGL the static logo mark stands in.
const Vascular3D = lazy(() => import('./Vascular3D').then((m) => ({ default: m.Vascular3D })));

function StaticCore() {
  return (
    <div className="hero__fallback">
      <Logo className="core-hex" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" id="top" data-scene="burst">
      <div className="container hero__grid">
        <div>
          <div className="hero__badge">
            <span className="badge">{PRODUCT.badgeFa}</span>
          </div>
          <h1>
            <span className="hl">هوش مصنوعی را در رگ‌های وردپرس و ووکامرس خود جاری کنید.</span>
          </h1>
          <p className="hero__en">{PRODUCT.taglineEn}</p>
          <p className="hero__sub">{PRODUCT.subtitleFa}</p>
          <div className="hero__ctas">
            <a className="btn btn--primary" href="#demo">
              <Play size={16} weight="fill" aria-hidden="true" /> دموی تعاملی را ببینید
            </a>
            <a className="btn btn--ghost" href={LINKS.technicalGuideUrl}>
              راهنمای فنی
            </a>
          </div>
          <div className="hero__stats">
            {HERO_STATS.map((s) => (
              <div className="stat" key={s.title}>
                <div className="stat__value">{s.value}</div>
                <div className="stat__title">{s.title}</div>
                <div className="stat__note">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero__visual">
          <Suspense fallback={<StaticCore />}>
            <Vascular3D fallback={<StaticCore />} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
