import { ChangeEvent, useMemo, useState } from 'react';
import { BYOK_NOTE, ROI_DEFAULTS } from '../data/content';
import { SectionHead } from './SectionHead';

const fa = (n: number, digits = 0) =>
  n.toLocaleString('fa-IR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

type Inputs = {
  articles: number;
  products: number;
  tickets: number;
  minArticle: number;
  minProduct: number;
  minTicket: number;
  rate: number;
};

export function RoiCalculator() {
  const [v, setV] = useState<Inputs>({
    articles: ROI_DEFAULTS.articlesPerMonth,
    products: ROI_DEFAULTS.products,
    tickets: ROI_DEFAULTS.tickets,
    minArticle: ROI_DEFAULTS.minutesSavedPerArticle,
    minProduct: ROI_DEFAULTS.minutesSavedPerProduct,
    minTicket: ROI_DEFAULTS.minutesSavedPerTicket,
    rate: ROI_DEFAULTS.hourlyRateToman,
  });

  const set = (key: keyof Inputs) => (e: ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    setV((prev) => ({ ...prev, [key]: Number.isFinite(n) && n >= 0 ? n : 0 }));
  };

  const calc = useMemo(() => {
    const mArticles = v.articles * v.minArticle;
    const mProducts = v.products * v.minProduct;
    const mTickets = v.tickets * v.minTicket;
    const totalMinutes = mArticles + mProducts + mTickets;
    const hours = totalMinutes / 60;
    const money = hours * v.rate;
    return { mArticles, mProducts, mTickets, hours, money };
  }, [v]);

  return (
    <section className="section section--tint" id="roi" aria-labelledby="roi-title">
      <div className="container">
        <SectionHead
          eyebrow="VALUE CALCULATOR"
          title="محاسبه‌گر صرفه‌جویی زمان و هزینه"
          lead="تعداد کارها را تنظیم کنید. زمان هر کار و نرخ ساعت کاری قابل ویرایش‌اند؛ پیش‌فرض‌ها فقط نمونه‌اند."
        />
        <div className="roi">
          <div className="card roi__inputs">
            <div className="slider">
              <label htmlFor="r-articles">
                تعداد مقالات ماهانه <output>{fa(v.articles)}</output>
              </label>
              <input id="r-articles" type="range" min={0} max={100} step={1} value={v.articles} onChange={set('articles')} />
              <small>مقاله‌ی ۱۲۰۰ کلمه‌ای با تصویر شاخص و متای سئو</small>
            </div>
            <div className="slider">
              <label htmlFor="r-products">
                تعداد محصولات ووکامرس <output>{fa(v.products)}</output>
              </label>
              <input id="r-products" type="range" min={0} max={3000} step={10} value={v.products} onChange={set('products')} />
              <small>محصولاتی که توضیحات آن‌ها نیاز به تکمیل یا بازنویسی دارد</small>
            </div>
            <div className="slider">
              <label htmlFor="r-tickets">
                تعداد تیکت و گفت‌وگوی پشتیبانی ماهانه <output>{fa(v.tickets)}</output>
              </label>
              <input id="r-tickets" type="range" min={0} max={2000} step={10} value={v.tickets} onChange={set('tickets')} />
              <small>پرسش‌هایی که چت‌بات مستند پاسخ می‌دهد یا تیکت آن‌ها ثبت می‌شود</small>
            </div>

            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: 10, fontSize: '0.92rem' }}>
                فرض‌های قابل ویرایش (دقیقه‌ی صرفه‌جویی برای هر واحد و نرخ ساعت)
              </legend>
              <div className="assump">
                <label>
                  دقیقه / مقاله
                  <input type="number" min={0} value={v.minArticle} onChange={set('minArticle')} aria-label="دقیقه صرفه‌جویی برای هر مقاله" />
                </label>
                <label>
                  دقیقه / محصول
                  <input type="number" min={0} value={v.minProduct} onChange={set('minProduct')} aria-label="دقیقه صرفه‌جویی برای هر محصول" />
                </label>
                <label>
                  دقیقه / تیکت
                  <input type="number" min={0} value={v.minTicket} onChange={set('minTicket')} aria-label="دقیقه صرفه‌جویی برای هر تیکت" />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 4, marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                نرخ یک ساعت کار (تومان)
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={v.rate}
                  onChange={set('rate')}
                  aria-label="نرخ یک ساعت کار به تومان"
                  style={{ border: '1px solid var(--avand-border-light)', borderRadius: 10, padding: '7px 9px', background: '#f8fafc', fontFamily: 'var(--font-mono)', direction: 'ltr', textAlign: 'left' }}
                />
              </label>
            </fieldset>
          </div>

          <div className="card roi__result" aria-live="polite">
            <h3>نتیجه‌ی تقریبی ماهانه</h3>
            <div className="roi__big">
              {fa(calc.hours, 1)}
              <small>ساعت آزادشده</small>
            </div>
            <div className="roi__money">
              معادل {fa(calc.money)} تومان
            </div>
            <ul className="roi__breakdown">
              <li>
                <span>مقالات</span>
                <b>{fa(calc.mArticles / 60, 1)} ساعت</b>
              </li>
              <li>
                <span>محصولات ووکامرس</span>
                <b>{fa(calc.mProducts / 60, 1)} ساعت</b>
              </li>
              <li>
                <span>تیکت و پشتیبانی</span>
                <b>{fa(calc.mTickets / 60, 1)} ساعت</b>
              </li>
            </ul>
            <p className="roi__disclaimer">
              این عدد بر اساس فرض‌های بالا محاسبه می‌شود و تضمین درآمد یا صرفه‌جویی نیست. {BYOK_NOTE}
              <br />
              هزینه‌ی مصرف توکن API در این محاسبه لحاظ نشده است.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
