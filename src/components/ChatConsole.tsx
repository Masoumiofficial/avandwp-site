import { ChatCircleDots, LinkSimple, Microphone, Ticket, ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { CHAT_ANSWERS, CHAT_FALLBACK, CHAT_QUESTIONS, ChatAnswer } from '../data/content';
import { SectionHead } from './SectionHead';

// Minimal typing for the browser Web Speech API (not in lib.dom for all TS versions).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

type Msg = {
  id: number;
  role: 'bot' | 'user';
  text: string;
  sources?: string[];
  feedback?: 'up' | 'down';
};

type TicketField = 'name' | 'contact' | 'message';
type TicketError = { field: TicketField; message: string };

let uid = 0;
const nextId = () => ++uid;

const WELCOME: Msg = {
  id: nextId(),
  role: 'bot',
  text: 'سلام! من دستیار نمونه‌ی آوند هستم. یکی از پرسش‌های نمونه را انتخاب کنید یا با میکروفون بپرسید.',
};

const TICKET_LABELS: Record<TicketField, string> = {
  name: 'نام',
  contact: 'ایمیل یا شماره تماس',
  message: 'شرح مسئله',
};

function findAnswer(question: string): ChatAnswer {
  const exact = CHAT_ANSWERS[question];
  if (exact) return exact;
  const key = Object.keys(CHAT_ANSWERS).find((k) => question.includes(k.slice(0, 12)));
  return key ? CHAT_ANSWERS[key] : CHAT_FALLBACK;
}

export function ChatConsole() {
  const [tab, setTab] = useState<'chat' | 'ticket'>('chat');
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [micMsg, setMicMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketErrors, setTicketErrors] = useState<TicketError[]>([]);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const speechSupported =
    typeof window !== 'undefined' &&
    Boolean((window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    if (ticketErrors.length) summaryRef.current?.focus();
  }, [ticketErrors]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      recRef.current?.stop();
    },
    [],
  );

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: q }]);
    setInput('');
    setThinking(true);
    timerRef.current = window.setTimeout(() => {
      const a = findAnswer(q);
      setMessages((m) => [...m, { id: nextId(), role: 'bot', text: a.answer, sources: a.sources }]);
      setThinking(false);
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const toggleMic = () => {
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = 'fa-IR';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      setMicMsg('');
      setInput(transcript);
      if (transcript) ask(transcript);
    };
    rec.onerror = (e) => {
      setMicMsg(e.error === 'not-allowed' ? 'دسترسی میکروفون داده نشد.' : 'تشخیص گفتار انجام نشد؛ دوباره تلاش کنید.');
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setMicMsg('');
    setListening(true);
    rec.start();
  };

  const setFeedback = (id: number, value: 'up' | 'down') => {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, feedback: value } : msg)));
  };

  const submitTicket = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const errors: TicketError[] = [];
    (['name', 'contact', 'message'] as TicketField[]).forEach((field) => {
      const value = String(data.get(field) ?? '').trim();
      if (!value) errors.push({ field, message: `«${TICKET_LABELS[field]}» را وارد کنید.` });
    });
    setTicketErrors(errors);
    if (errors.length === 0) setTicketSent(true);
  };

  const errorFor = (field: TicketField) => ticketErrors.find((er) => er.field === field);

  return (
    <section className="section chat-section" id="chat" aria-labelledby="chat-title">
      <div className="container">
        <SectionHead
          eyebrow="[avandwp_chat] · LIVE PREVIEW"
          title="تجربه چت‌بات و دستیار صوتی فارسی"
          lead="این ویجت نمونه‌ی زنده است و به سرویس AI متصل نیست؛ پاسخ‌ها از پیش تعریف شده‌اند تا رفتار ویجت را ببینید."
        />
        <div className="chat-layout">
          <aside className="chat-side">
            <h3>آنچه این پیش‌نمایش نشان می‌دهد</h3>
            <ul>
              <li>
                پرسش‌های نمونه را بزنید یا با میکروفون مرورگر (<span className="ltr">fa-IR</span>) بپرسید.
              </li>
              <li>پاسخ‌ها همراه با باکس «منابع رسمی از سایت شما» نمایش داده می‌شوند.</li>
              <li>با دکمه‌های «مفید بود» و «نیاز به بهبود» بازخورد بدهید.</li>
              <li>اگر پاسخ کافی نبود، تیکت برای کارشناس انسانی ثبت کنید.</li>
            </ul>
            {!speechSupported && (
              <div className="notice notice--info" style={{ marginTop: 16 }}>
                مرورگر شما تشخیص گفتار را پشتیبانی نمی‌کند. از Chrome یا Edge استفاده کنید؛ پرسش‌های نمونه همچنان کار می‌کنند.
              </div>
            )}
          </aside>

          <div className="chat" role="region" aria-label="پیش‌نمایش ویجت چت‌بات آوند">
            <div className="chat__head">
              <div>
                <strong>دستیار آوند</strong>
                <small>[avandwp_chat] · demo</small>
              </div>
              <span className="badge badge--stable">پاسخ نمونه</span>
            </div>
            <div className="chat__tabs" role="tablist" aria-label="حالت ویجت">
              <button type="button" role="tab" id="tab-chat" aria-selected={tab === 'chat'} aria-controls="panel-chat" onClick={() => setTab('chat')}>
                <ChatCircleDots size={18} aria-hidden="true" /> گفت‌وگو
              </button>
              <button type="button" role="tab" id="tab-ticket" aria-selected={tab === 'ticket'} aria-controls="panel-ticket" onClick={() => setTab('ticket')}>
                <Ticket size={18} aria-hidden="true" /> ثبت تیکت برای کارشناس
              </button>
            </div>

            {tab === 'chat' ? (
              <div id="panel-chat" role="tabpanel" aria-labelledby="tab-chat">
                <div className="chat__body" ref={bodyRef} aria-live="polite">
                  {messages.map((m) => (
                    <div key={m.id} className={`msg msg--${m.role}`}>
                      {m.text}
                      {m.sources && m.sources.length > 0 && (
                        <div className="msg__sources">
                          <strong>
                            <LinkSimple size={16} aria-hidden="true" /> منابع رسمی از سایت شما
                          </strong>
                          <ul>
                            {m.sources.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {m.role === 'bot' && m.id !== WELCOME.id && (
                        <div className="msg__feedback" role="group" aria-label="بازخورد پاسخ">
                          <button type="button" aria-pressed={m.feedback === 'up'} onClick={() => setFeedback(m.id, 'up')}>
                            <ThumbsUp size={16} aria-hidden="true" /> مفید بود
                          </button>
                          <button type="button" aria-pressed={m.feedback === 'down'} onClick={() => setFeedback(m.id, 'down')}>
                            <ThumbsDown size={16} aria-hidden="true" /> نیاز به بهبود
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {thinking && (
                    <div className="msg msg--bot" role="status">
                      <span className="sr-only">در حال پاسخ</span>
                      <span aria-hidden="true">…</span>
                    </div>
                  )}
                </div>

                <div className="chat__suggest">
                  {CHAT_QUESTIONS.map((q) => (
                    <button key={q} type="button" onClick={() => ask(q)} disabled={thinking}>
                      {q}
                    </button>
                  ))}
                </div>

                <form className="chat__input" onSubmit={onSubmit}>
                  <label className="sr-only" htmlFor="chat-input">
                    پرسش خود را بنویسید
                  </label>
                  <input
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="پرسش خود را بنویسید…"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="mic"
                    aria-pressed={listening}
                    aria-label={listening ? 'توقف ضبط' : 'پرسش صوتی'}
                    onClick={toggleMic}
                    disabled={!speechSupported}
                    title={speechSupported ? 'پرسش صوتی (fa-IR)' : 'مرورگر پشتیبانی نمی‌کند'}
                  >
                    <Microphone size={20} aria-hidden="true" />
                  </button>
                  <button type="submit" className="send" disabled={!input.trim() || thinking}>
                    ارسال
                  </button>
                </form>
                <p className="chat__hint" aria-live="polite">
                  {micMsg || (listening ? 'در حال شنیدن… بعد از پایان جمله، پاسخ داده می‌شود.' : 'پاسخ‌ها نمونه‌ی ثابت‌اند و هیچ درخواستی به سرویس AI ارسال نمی‌شود.')}
                </p>
              </div>
            ) : ticketSent ? (
              <div id="panel-ticket" role="tabpanel" aria-labelledby="tab-ticket" className="ticket">
                <div className="ticket__ok" role="status">
                  تیکت نمایشی ثبت شد. در نسخه واقعی، این تیکت در صندوق کارشناس ذخیره و اعلان تلگرام ارسال می‌شود.
                </div>
                <button
                  type="button"
                  className="btn btn--light btn--sm"
                  style={{ justifySelf: 'start' }}
                  onClick={() => {
                    setTicketSent(false);
                    setTicketErrors([]);
                  }}
                >
                  ثبت تیکت جدید
                </button>
              </div>
            ) : (
              <form id="panel-ticket" role="tabpanel" aria-labelledby="tab-ticket" className="ticket" onSubmit={submitTicket} noValidate>
                {ticketErrors.length > 0 && (
                  <div className="ticket__errors" role="alert" tabIndex={-1} ref={summaryRef} aria-labelledby="ticket-err-title">
                    <strong id="ticket-err-title">فرم کامل نیست؛ موارد زیر را اصلاح کنید:</strong>
                    <ul>
                      {ticketErrors.map((er) => (
                        <li key={er.field}>
                          <a href={`#ticket-${er.field}`}>{er.message}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(['name', 'contact', 'message'] as TicketField[]).map((field) => {
                  const err = errorFor(field);
                  const id = `ticket-${field}`;
                  const errId = `${id}-error`;
                  const common = {
                    id,
                    name: field,
                    'aria-invalid': err ? true : undefined,
                    'aria-describedby': err ? errId : undefined,
                  };
                  const input =
                    field === 'message' ? (
                      <textarea {...common} placeholder="مسئله خود را توضیح دهید…" />
                    ) : (
                      <input
                        {...common}
                        placeholder={field === 'name' ? 'مثلاً سارا محمدی' : 'name@example.com'}
                        dir={field === 'contact' ? 'ltr' : undefined}
                      />
                    );
                  return (
                    <div className="ticket__field" key={field}>
                      <label htmlFor={id}>{TICKET_LABELS[field]}</label>
                      {input}
                      {err && (
                        <span id={errId} className="ticket__error">
                          {err.message}
                        </span>
                      )}
                    </div>
                  );
                })}
                <button type="submit" className="btn btn--primary btn--sm" style={{ justifySelf: 'start' }}>
                  ارسال تیکت (نمایشی)
                </button>
                <p className="chat__hint" style={{ padding: 0 }}>
                  این فرم نمایشی است و اطلاعات ارسال نمی‌شود.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
