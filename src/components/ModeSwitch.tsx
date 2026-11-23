import type { Mode } from '../lib/types'

const MODES: { id: Mode; title: string; sub: string }[] = [
  { id: 'awg', title: 'AmneziaWG', sub: 'WireGuard با مبهم‌سازی DPI' },
  { id: 'wg', title: 'WireGuard', sub: 'بدون پارامترهای مبهم‌سازی' },
]

export function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="modes" role="radiogroup" aria-label="نوع پروتکل">
      {MODES.map(item => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={mode === item.id}
          className={mode === item.id ? 'mode mode-active' : 'mode'}
          onClick={() => onChange(item.id)}
        >
          <span className="mode-title">{item.title}</span>
          <span className="mode-sub">{item.sub}</span>
        </button>
      ))}
    </div>
  )
}
