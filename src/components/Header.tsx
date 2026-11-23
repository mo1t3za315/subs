export function Header() {
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="5" cy="12" r="2.3" />
            <circle cx="19" cy="6.2" r="2.3" />
            <circle cx="19" cy="17.8" r="2.3" />
            <path d="M7.1 11.1 16.9 6.9M7.1 12.9l9.8 4.2" />
          </svg>
        </span>
        <div className="brand-text">
          <h1>سازندهٔ کانفیگ AmneziaWG</h1>
          <p>کلیدها، پارامترهای مبهم‌سازی و کانفیگ کلاینت و سرور — همه در یک صفحه</p>
        </div>
      </div>
      <span className="pill">
        <span className="pill-dot" />
        AmneziaWG 2.0
      </span>
    </header>
  )
}
