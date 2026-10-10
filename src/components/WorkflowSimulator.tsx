import { useEffect, useState } from 'react';
import { SCENARIOS, SIMULATOR_DISCLAIMER } from '../data/content';
import { ArrowClockwise, Play } from '@phosphor-icons/react';
import { SectionHead } from './SectionHead';

const STEP_MS = 950;

export function WorkflowSimulator() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState(0); // number of finished steps, 0..3
  const [running, setRunning] = useState(false);
  const scenario = SCENARIOS[index];
  const total = scenario.steps.length;

  useEffect(() => {
    if (!running) return;
    if (phase >= total) {
      setRunning(false);
      return;
    }
    const t = window.setTimeout(() => setPhase((p) => p + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [running, phase, total]);

  const select = (i: number) => {
    setIndex(i);
    setPhase(0);
    setRunning(false);
  };
  const run = () => {
    setPhase(0);
    setRunning(true);
  };
  const done = phase >= total;

  return (
    <section className="section section--dark" id="demo" data-scene="pipeline" aria-labelledby="demo-title">
      <div className="container">
        <SectionHead
          eyebrow="INTERACTIVE SIMULATOR"
          title="دموی گردش کار آوند"
          lead="یکی از سه سناریوی واقعی را انتخاب کنید و مسیر سه گام معماری افزونه را ببینید."
        />
        <div className="sim">
          <div className="sim__tabs" role="tablist" aria-label="سناریوهای دموی گردش کار">
            {SCENARIOS.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                id={`sim-tab-${s.id}`}
                aria-selected={i === index}
                aria-controls="sim-panel"
                className="sim__tab"
                onClick={() => select(i)}
              >
                <strong>{s.label}</strong>
                <span>{s.prompt}</span>
              </button>
            ))}
          </div>

          <div className="sim__panel" id="sim-panel" role="tabpanel" aria-labelledby={`sim-tab-${scenario.id}`}>
            <div className="sim__prompt">
              <b>درخواست: </b>
              {scenario.prompt}
            </div>

            <ol className="sim__steps" aria-live="polite">
              {scenario.steps.map((step, i) => {
                const cls = i < phase ? 'is-done' : i === phase && running ? 'is-running' : '';
                return (
                  <li key={step} className={`sim__step ${cls}`}>
                    <span className="dot" aria-hidden="true" />
                    <span>{step}</span>
                  </li>
                );
              })}
            </ol>

            <div>
              <div className="sim__label">SAVED OUTPUTS</div>
              <ul className="sim__outputs">
                {scenario.outputs.map((o) => (
                  <li key={o} className={done ? 'is-ready' : ''}>
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sim__controls">
              <button type="button" className="btn btn--primary btn--sm" onClick={run} disabled={running}>
                {running ? (
                  'در حال اجرا…'
                ) : done ? (
                  <><ArrowClockwise size={16} aria-hidden="true" /> اجرای دوباره</>
                ) : (
                  <><Play size={16} weight="fill" aria-hidden="true" /> اجرای شبیه‌سازی</>
                )}
              </button>
              {(phase > 0 || running) && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => select(index)}>
                  بازنشانی
                </button>
              )}
              <span className="section__lead" style={{ fontSize: '0.85rem' }}>
                {done ? 'پایان شبیه‌سازی' : `${phase.toLocaleString('fa-IR')} از ${total.toLocaleString('fa-IR')} گام`}
              </span>
            </div>

            <p className="sim__disclaimer" role="note">
              <strong>توجه شفافیت: </strong>
              {SIMULATOR_DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
