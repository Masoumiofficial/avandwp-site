import { SETUP_STEPS } from '../data/content';
import { SectionHead } from './SectionHead';

export function Setup() {
  return (
    <section className="section section--white" id="setup" data-scene="path" aria-labelledby="setup-title">
      <div className="container">
        <SectionHead eyebrow="QUICK START" title="راه‌اندازی در ۳ مرحله" lead="از نصب تا اولین پیش‌نویس، با سه گام ساده." />
        <ol className="steps" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {SETUP_STEPS.map((s) => (
            <li key={s.no} className="card step">
              <div className="step__no" aria-hidden="true">
                {s.no}
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
