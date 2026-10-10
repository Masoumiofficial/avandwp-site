import { ROADMAP } from '../data/content';
import { SectionHead } from './SectionHead';

export function Roadmap() {
  const cols = [
    { cls: 'road__col--done', data: ROADMAP.active },
    { cls: 'road__col--next', data: ROADMAP.next },
    { cls: 'road__col--later', data: ROADMAP.later },
  ];
  return (
    <section className="section section--white" id="roadmap" aria-labelledby="road-title">
      <div className="container">
        <SectionHead
          eyebrow="ENGINEERING ROADMAP"
          title="نقشه راه مهندسی شفاف"
          lead="آنچه امروز فعال است را از آنچه در راه است جدا کرده‌ایم تا خریدار بداند دقیقاً چه چیزی را می‌خرد."
        />
        <div className="road">
          {cols.map((c) => (
            <article key={c.data.title} className={`card road__col ${c.cls}`}>
              <h3>{c.data.title}</h3>
              <ul>
                {c.data.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
