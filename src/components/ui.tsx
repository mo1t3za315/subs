import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { copyText, downloadText } from '../lib/files'

export function SectionCard({
  step,
  title,
  description,
  aside,
  children,
}: {
  step: string
  title: string
  description?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="card">
      <header className="card-head">
        <span className="step">{step}</span>
        <div className="card-titles">
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {aside ? <div className="card-aside">{aside}</div> : null}
      </header>
      <div className="card-body">{children}</div>
    </section>
  )
}

export function Field({
  label,
  hint,
  error,
  wide,
  children,
}: {
  label: string
  hint?: string
  error?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

export function Input({
  mono,
  ltr,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean; ltr?: boolean }) {
  const classes = ['input', mono ? 'mono' : '', ltr ? 'ltr' : '', className].filter(Boolean).join(' ')
  return <input {...rest} className={classes} dir={ltr ? 'ltr' : undefined} />
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={active ? 'chip chip-active' : 'chip'} onClick={onClick} aria-pressed={!!active}>
      {children}
    </button>
  )
}

export function CopyButton({ text, label = 'کپی' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')

  const onClick = async () => {
    const ok = await copyText(text)
    setState(ok ? 'done' : 'failed')
    window.setTimeout(() => setState('idle'), ok ? 1600 : 2600)
  }

  const classes = state === 'done' ? 'btn btn-ok' : state === 'failed' ? 'btn btn-fail' : 'btn'

  return (
    <button type="button" className={classes} onClick={onClick} disabled={!text}>
      {state === 'done' ? 'کپی شد ✓' : state === 'failed' ? 'کپی نشد' : label}
    </button>
  )
}

export function DownloadButton({
  filename,
  text,
  label = 'دانلود',
}: {
  filename: string
  text: string
  label?: string
}) {
  return (
    <button type="button" className="btn btn-primary" onClick={() => downloadText(filename, text)} disabled={!text}>
      {label}
    </button>
  )
}

export function DerivedKey({ label, value }: { label: string; value: string }) {
  return (
    <div className="derived">
      <span className="derived-label">{label}</span>
      <code>{value || '—'}</code>
      <CopyButton text={value} label="کپی" />
    </div>
  )
}
