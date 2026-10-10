import { useState } from 'react';
import { WORKSPACES } from '../data/content';
import { SectionHead } from './SectionHead';
import { useTilt } from '../hooks/useTilt';

// Illustrative mockup content. Values are sample data, not live metrics.
type MockSpec = {
  side: number; // active sidebar item
  kpis: [string, string][];
  rows: [string, string, 'ok' | 'warn' | 'info'][];
  bars?: boolean;
  field?: string;
};

const MOCKS: Record<string, MockSpec> = {
  dashboard: {
    side: 0,
    kpis: [['۱۲', 'مقالات این ماه'], ['۰', 'جاب در خطا'], ['۴۸ms', 'پینگ سرویس']],
    rows: [
      ['صف پس‌زمینه · avandwp_jobs', 'فعال', 'ok'],
      ['پیش‌نویس «راهنمای خرید قهوه»', 'آماده بازبینی', 'info'],
      ['تیکت صوتی از چت‌بات', 'منتظر کارشناس', 'warn'],
    ],
    bars: true,
  },
  studio: {
    side: 1,
    kpis: [['۱٬۲۰۸', 'کلمه‌ی فارسی'], ['OK', 'Alt Text'], ['MP3', 'پادکست']],
    rows: [
      ['تصویر شاخص · Flux', 'Alt تولید شد', 'ok'],
      ['متای Yoast', 'تزریق شد', 'ok'],
      ['پادکست صوتی', 'در صف', 'info'],
    ],
  },
  woo: {
    side: 2,
    kpis: [['۳۰۰', 'محصول اسکن‌شده'], ['۴۲', 'کمتر از ۸۰ کلمه'], ['FAQ', 'اسکیمای صفحه']],
    rows: [
      ['قهوه اتیوپی · ۴۳ کلمه', 'پیش‌نویس', 'warn'],
      ['فنجان سرامیکی · ۶۱ کلمه', 'پیش‌نویس', 'warn'],
      ['دریپر سفالی · ۱۰۲ کلمه', 'کامل', 'ok'],
    ],
  },
  chat: {
    side: 3,
    kpis: [['۸۷٪', 'پاسخ مستند'], ['۱۲', 'تیکت باز'], ['FAQ', 'بازخورد به FAQ']],
    rows: [
      ['سؤال: کلید API کجاست؟', 'منبع دارد', 'ok'],
      ['تیکت: پرداخت ریالی', 'Whisper · صوت', 'info'],
      ['بازخورد منفی ×۳', 'پیشنهاد FAQ', 'warn'],
    ],
  },
  automate: {
    side: 4,
    kpis: [['۶', 'انتشار امروز'], ['۲', 'اعلان سفارش'], ['۵', 'مورد ممیزی']],
    rows: [
      ['انتشار «راهنمای قهوه» در تلگرام', 'ارسال شد', 'ok'],
      ['ممیزی: تصویر شاخص ندارد', 'بازبینی', 'warn'],
      ['سفارش جدید ووکامرس', 'اعلان شد', 'ok'],
    ],
  },
  settings: {
    side: 5,
    kpis: [['AES', 'AES-256-GCM'], ['۸', 'جدول دیتابیس'], ['OK', 'سلامت']],
    rows: [
      ['GapGPT · کلید ریالی', 'تست: ۴۸ms', 'ok'],
      ['OpenAI · کلید', 'تست: ۱۱۰ms', 'ok'],
      ['Rate Limiter', 'فعال', 'info'],
    ],
    field: 'AvandWP_Vault ▸ key=•••••••••••••••• (encrypted, AES-256-GCM)',
  },
};

export function WorkspaceShowcase() {
  const [index, setIndex] = useState(0);
  const ws = WORKSPACES[index];
  const mock = MOCKS[ws.id];
  const sideItems = ['پیشخوان', 'محتوا', 'ووکامرس', 'چت‌بات', 'تلگرام', 'تنظیمات'];
  const tilt = useTilt<HTMLDivElement>(4);

  return (
    <section className="section" id="workspaces" aria-labelledby="ws-title" style={{ background: 'var(--avand-bg-light)' }}>
      <div className="container">
        <SectionHead
          eyebrow="6 WORKSPACES"
          title="۶ فضای کاری پنل مدیریت"
          lead="هر تب یکی از شش صفحه‌ی پنل آوند را نشان می‌دهد. موکاپ‌ها ساده‌سازی‌شده‌اند و داده‌های داخل آن‌ها نمونه‌اند."
        />
        <div className="ws">
          <div className="ws__tabs" role="tablist" aria-label="فضاهای کاری">
            {WORKSPACES.map((w, i) => (
              <button
                key={w.id}
                role="tab"
                type="button"
                aria-selected={i === index}
                className="ws__tab"
                onClick={() => setIndex(i)}
              >
                {w.label}
              </button>
            ))}
            <p className="ws__desc" role="tabpanel">{ws.desc}</p>
          </div>

          <div
            ref={tilt.ref}
            className="mock tilt"
            role="img"
            aria-label={`موکاپ ${ws.title}`}
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
          >
            <div className="mock__bar">
              <i /><i /><i />
              <span>/wp-admin/admin.php?page=avandwp-{ws.id}</span>
            </div>
            <div className="mock__screen">
              <div className="mock__side" aria-hidden="true">
                {sideItems.map((_, i) => (
                  <div key={i} className={i === mock.side ? 'on' : ''} />
                ))}
              </div>
              <div className="mock__main">
                <div className="mock__title">{ws.title}</div>
                <div className="mock__kpis">
                  {mock.kpis.map(([v, l]) => (
                    <div className="mock__kpi" key={l}>
                      <b>{v}</b>
                      <small>{l}</small>
                    </div>
                  ))}
                </div>
                {mock.bars && (
                  <div className="mock__bars" aria-hidden="true">
                    {[40, 62, 35, 78, 55, 90, 70, 48, 84, 66].map((h, i) => (
                      <i key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                )}
                {mock.rows.map(([t, pill, tone]) => (
                  <div className="mock__row" key={t}>
                    <span>{t}</span>
                    <span className={`mock__pill${tone === 'warn' ? ' mock__pill--warn' : tone === 'info' ? ' mock__pill--info' : ''}`}>
                      {pill}
                    </span>
                  </div>
                ))}
                {mock.field && <div className="mock__field">{mock.field}</div>}
                <div className="mock__note">داده‌های نمایشی · موکاپ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
