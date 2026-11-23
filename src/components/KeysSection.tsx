import { generatePsk, generatePrivateKey } from '../lib/keys'
import { issueFor } from '../lib/validate'
import type { Issue, Settings } from '../lib/types'
import { DerivedKey, Field, Input, SectionCard } from './ui'

type Props = {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  serverPublicKey: string
  clientPublicKey: string
  issues: Issue[]
}

function KeyBlock({
  title,
  privateKey,
  publicKey,
  error,
  onChange,
  onRegenerate,
}: {
  title: string
  privateKey: string
  publicKey: string
  error?: string
  onChange: (value: string) => void
  onRegenerate: () => void
}) {
  return (
    <div className="key-block">
      <div className="key-head">
        <h3>{title}</h3>
        <button type="button" className="btn btn-ghost" onClick={onRegenerate}>
          بازتولید
        </button>
      </div>
      <Field label="PrivateKey" error={error}>
        <Input ltr mono value={privateKey} onChange={event => onChange(event.target.value)} spellCheck={false} />
      </Field>
      <DerivedKey label="PublicKey" value={publicKey} />
    </div>
  )
}

export function KeysSection({ settings, set, serverPublicKey, clientPublicKey, issues }: Props) {
  const regenerateAll = () => {
    set('serverPrivateKey', generatePrivateKey())
    set('clientPrivateKey', generatePrivateKey())
    set('psk', generatePsk())
  }

  return (
    <SectionCard
      step="۰۳"
      title="کلیدها"
      description="در همین مرورگر ساخته می‌شوند و جایی ارسال نمی‌شوند"
      aside={
        <button type="button" className="btn" onClick={regenerateAll}>
          بازتولید همه
        </button>
      }
    >
      <div className="key-grid">
        <KeyBlock
          title="سرور"
          privateKey={settings.serverPrivateKey}
          publicKey={serverPublicKey}
          error={issueFor(issues, 'serverPrivateKey')}
          onChange={value => set('serverPrivateKey', value)}
          onRegenerate={() => set('serverPrivateKey', generatePrivateKey())}
        />
        <KeyBlock
          title="کلاینت"
          privateKey={settings.clientPrivateKey}
          publicKey={clientPublicKey}
          error={issueFor(issues, 'clientPrivateKey')}
          onChange={value => set('clientPrivateKey', value)}
          onRegenerate={() => set('clientPrivateKey', generatePrivateKey())}
        />
      </div>

      <label className="switch">
        <input type="checkbox" checked={settings.usePsk} onChange={event => set('usePsk', event.target.checked)} />
        <span className="switch-track" aria-hidden="true" />
        <span className="switch-text">
          PresharedKey
          <small>یک لایهٔ رمزنگاری اضافه روی هر دو طرف</small>
        </span>
      </label>

      {settings.usePsk ? (
        <div className="psk-row">
          <Field label="PresharedKey" error={issueFor(issues, 'psk')}>
            <Input ltr mono value={settings.psk} onChange={event => set('psk', event.target.value)} spellCheck={false} />
          </Field>
          <button type="button" className="btn" onClick={() => set('psk', generatePsk())}>
            بازتولید
          </button>
        </div>
      ) : null}
    </SectionCard>
  )
}
