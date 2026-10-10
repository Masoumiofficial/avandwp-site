// Official AvandWP hexagonal mark (see public/avandwp-logo.svg). Inlined so it can be styled and reused.
type LogoProps = { className?: string; title?: string };

export function Logo({ className, title = 'لوگوی آوند' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" role="img" aria-label={title}>
      <defs>
        <linearGradient id="avandGradPrimary" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="avandGradNode" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      <path d="M32 4L56 17.8V46.2L32 60L8 46.2V17.8L32 4Z" fill="#0F172A" stroke="url(#avandGradPrimary)" strokeWidth="3" />
      <path d="M32 32L32 13M32 32L16 42M32 32L48 42" stroke="url(#avandGradNode)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 13L48 22.5V42L32 51.5L16 42V22.5L32 13Z" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="32" cy="32" r="5.5" fill="url(#avandGradPrimary)" />
      <circle cx="32" cy="13" r="3.5" fill="#60A5FA" />
      <circle cx="16" cy="42" r="3.5" fill="#2DD4BF" />
      <circle cx="48" cy="42" r="3.5" fill="#2DD4BF" />
    </svg>
  );
}
