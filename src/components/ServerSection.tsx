import type { ChangeEvent } from 'react'
import type { Issue, Settings } from '../lib/types'
import { issueFor } from '../lib/validate'
import { Field, Input, SectionCard } from './ui'

type Props = {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  issues: Issue[]
  detecting: boolean
  onRedetect: () => void
}

export function ServerSection({ settings, set, issues, detecting, onRedetect }: Props) {
  const number = (key: keyof Settings) => (event: ChangeEvent<HTMLInputElement>) =>
    set(key, Number(event.target.value) as never)

  return (
    <SectionCard step="۰۱" title="سرور و شبکه" description="مقصد اتصال، آدرس‌های تونل و تنظیمات شبکه">
      <div className="grid">
        <Field
          label="آدرس سرور"
          hint={detecting ? 'در حال تشخیص خودکار…' : 'به‌صورت خودکار تشخیص داده شد'}
          error={detecting ? undefined : issueFor(issues, 'endpoint')}
          wide
        >
          <div className="readout">
            <code>{detecting ? 'در حال تشخیص…' : settings.endpoint || '—'}</code>
            <button type="button" className="btn btn-ghost" onClick={onRedetect} disabled={detecting}>
              {detecting ? 'صبر کنید' : 'تشخیص دوباره'}
            </button>
          </div>
        </Field>

        <Field label="پورت" error={issueFor(issues, 'port')}>
          <Input ltr type="number" min={1} max={65535} value={settings.port} onChange={number('port')} />
        </Field>

        <Field label="MTU" error={issueFor(issues, 'mtu')}>
          <Input ltr type="number" min={576} max={9100} value={settings.mtu} onChange={number('mtu')} />
        </Field>

        <Field label="DNS" hint="با کاما جدا کنید" error={issueFor(issues, 'dns')} wide>
          <Input ltr mono value={settings.dns} onChange={event => set('dns', event.target.value)} spellCheck={false} />
        </Field>

        <Field label="آی‌پی تونل سرور" error={issueFor(issues, 'serverTunnelIp')}>
          <Input ltr mono value={settings.serverTunnelIp} onChange={event => set('serverTunnelIp', event.target.value)} />
        </Field>

        <Field label="ماسک شبکه" hint="مثلاً ۲۴" error={issueFor(issues, 'subnet')}>
          <Input ltr type="number" min={8} max={30} value={settings.subnet} onChange={number('subnet')} />
        </Field>

        <Field label="آی‌پی کلاینت" error={issueFor(issues, 'clientIp')}>
          <Input ltr mono value={settings.clientIp} onChange={event => set('clientIp', event.target.value)} />
        </Field>

        <Field label="PersistentKeepalive" hint="۰ = غیرفعال" error={issueFor(issues, 'keepalive')}>
          <Input ltr type="number" min={0} max={3600} value={settings.keepalive} onChange={number('keepalive')} />
        </Field>

        <Field label="AllowedIPs" hint="کل ترافیک: 0.0.0.0/0, ::/0" error={issueFor(issues, 'allowedIps')} wide>
          <Input ltr mono value={settings.allowedIps} onChange={event => set('allowedIps', event.target.value)} spellCheck={false} />
        </Field>

        <Field label="اینترفیس خروجی سرور" hint="برای NAT در PostUp" error={issueFor(issues, 'natInterface')} wide>
          <Input ltr mono value={settings.natInterface} onChange={event => set('natInterface', event.target.value)} spellCheck={false} />
        </Field>
      </div>
    </SectionCard>
  )
}
