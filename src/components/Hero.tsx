import { lazy, Suspense, useEffect, useState } from 'react';
import { Play, CubeFocus, GraphIcon } from '@phosphor-icons/react';
import { HERO_NODES, HERO_STATS, LINKS, PRODUCT } from '../data/content';
import { Logo } from './Logo';

// Three.js is code-split so the first paint and the 2D fallback stay light.
const Vascular3D = lazy(() => import('./Vascular3D').then((m) => ({ default: m.Vascular3D })));

// Node positions in percent of the diagram box, derived from each node's angle.
const RADIUS = 36;
function nodePos(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: 50 + RADIUS * Math.cos(rad), y: 50 + RADIUS * Math.sin(rad) };
}

export function VascularDiagram() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setActive((i) => (i + 1) % HERO_NODES.length), 2400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <figure className="vascular" aria-label="دیاگرام شبکه آوندی: هسته AvandWP به چهار گره خروجی متصل است">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="36" fill="none" stroke="#334155" strokeWidth="0.3" strokeDasharray="1 1.4" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(37,99,235,.25)" strokeWidth="0.4" />
        {HERO_NODES.map((n, i) => {
          const p = nodePos(n.angle);
          const on = i === active;
          return (
            <g key={n.id}>
              <line x1="50" y1="50" x2={p.x} y2={p.y} stroke={on ? '#2DD4BF' : 'url(#heroLine)'} strokeWidth={on ? 0.9 : 0.5} opacity={on ? 1 : 0.55} />
              {on && (
                <line className="flow" x1="50" y1="50" x2={p.x} y2={p.y} stroke="#e0f2fe" strokeWidth="0.5" />
              )}
            </g>
          );
        })}
      </svg>

      <div className="vascular__core" style={{ position: 'absolute' }}>
        <Logo className="core-hex pulse" />
        <div className="core-label">AvandWP Core</div>
      </div>

      {HERO_NODES.map((n, i) => {
        const p = nodePos(n.angle);
        return (
          <div
            key={n.id}
            className={`vascular__node${i === active ? ' is-active' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {n.label}
            <small>{['CONTENT', 'COMMERCE', 'SUPPORT', 'TELEGRAM'][i]}</small>
          </div>
        );
      })}
      <figcaption className="vascular__caption">
        هسته AvandWP جریان داده را از مدل‌های AI دریافت و به چهار سرویس خروجی می‌رساند.
      </figcaption>
    </figure>
  );
}

export function Hero() {
  const [view, setView] = useState<'3d' | '2d'>('3d');

  return (
    <section className="hero" id="top">
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
          <div className="view-toggle" role="group" aria-label="انتخاب نمای نمودار">
            <button
              type="button"
              className="view-toggle__btn"
              aria-pressed={view === '3d'}
              onClick={() => setView('3d')}
            >
              <CubeFocus size={16} aria-hidden="true" /> نمای سه‌بعدی
            </button>
            <button
              type="button"
              className="view-toggle__btn"
              aria-pressed={view === '2d'}
              onClick={() => setView('2d')}
            >
              <GraphIcon size={16} aria-hidden="true" /> نمای دوبعدی
            </button>
          </div>
          {view === '3d' ? (
            <Suspense fallback={<VascularDiagram />}>
              <Vascular3D fallback={<VascularDiagram />} />
            </Suspense>
          ) : (
            <VascularDiagram />
          )}
        </div>
      </div>
    </section>
  );
}
