import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { COMPARE_COLUMNS, COMPARE_DISCLAIMER, COMPARE_ROWS } from '../data/content';
import { SectionHead } from './SectionHead';

export function Comparison() {
  return (
    <section className="section section--white" id="compare" data-scene="tiers" aria-labelledby="compare-title">
      <div className="container">
        <SectionHead
          eyebrow="BEFORE / AFTER"
          title="قبل و بعد از آوند"
          lead="مقایسه‌ی یکپارچگی، هزینه‌ی کار دستی و محدودیت‌های عملی در یک نگاه."
        />
        <div className="before-after">
          <article className="card ba-card ba-card--before">
            <h3 className="ba-title"><XCircle size={22} weight="fill" aria-hidden="true" /> قبل از آوند</h3>
            <p>۱۰ ابزار پراکنده برای یک جریان کاری واحد، هر کدام با کپی و جابه‌جایی دستی.</p>
            <ul>
              <li>محدودیت تحریم و نیاز به پرداخت ارزی برای برخی سرویس‌ها</li>
              <li>خطای Timeout در کارهای طولانی روی هاست اشتراکی</li>
              <li>کپی/پیست دستی بین ChatGPT، فروشگاه، پشتیبانی و تلگرام</li>
            </ul>
          </article>
          <article className="card ba-card ba-card--after">
            <h3 className="ba-title"><CheckCircle size={22} weight="fill" aria-hidden="true" /> با آوند</h3>
            <p>یکپارچگی بومی درون پیشخوان وردپرس؛ یک جریان واحد از دانش سایت تا انتشار.</p>
            <ul>
              <li>صف پس‌زمینه‌ی avandwp_jobs بدون Timeout روی هاست اشتراکی</li>
              <li>اتصال ریالی بومی به GapGPT و سرویس‌های جهانی</li>
              <li>کلیدها در گاوصندوق AvandWP_Vault با AES-256-GCM</li>
            </ul>
          </article>
        </div>

        <div className="table-wrap" role="region" aria-label="جدول مقایسه" tabIndex={0}>
          <table className="compare">
            <thead>
              <tr>
                {COMPARE_COLUMNS.map((c, i) => (
                  <th key={c} scope="col" className={i === 1 ? 'is-brand' : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={`${row[0]}-${i}`} className={i === 0 ? undefined : i === 1 ? 'is-brand' : undefined}>
                      {i === 0 ? <strong>{cell}</strong> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="compare-note">{COMPARE_DISCLAIMER}</p>
      </div>
    </section>
  );
}
