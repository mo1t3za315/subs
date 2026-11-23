import { useState } from 'react'
import type { Issue, Settings } from '../lib/types'
import { QrPanel } from './QrPanel'
import { CopyButton, DownloadButton } from './ui'

type Tab = 'client' | 'server' | 'amnezia'

type Props = {
  settings: Settings
  issues: Issue[]
  clientConfig: string
  serverConfig: string
  amneziaJson: string
  vpnUri: string
}

export function OutputSection({ settings, issues, clientConfig, serverConfig, amneziaJson, vpnUri }: Props) {
  const [tab, setTab] = useState<Tab>('client')
  const [qrMode, setQrMode] = useState<'config' | 'link'>('config')
  const isAwg = settings.mode === 'awg'
  const activeTab: Tab = !isAwg && tab === 'amnezia' ? 'client' : tab

  const tabs: { id: Tab; label: string; file: string; body: string }[] = [
    { id: 'client', label: 'کلاینت', file: isAwg ? 'amneziawg-client.conf' : 'wg-client.conf', body: clientConfig },
    { id: 'server', label: 'سرور', file: isAwg ? 'awg0.conf' : 'wg0.conf', body: serverConfig },
    ...(isAwg
      ? [{ id: 'amnezia' as Tab, label: 'AmneziaVPN', file: 'amneziawg-client.json', body: amneziaJson }]
      : []),
  ]

  const current = tabs.find(item => item.id === activeTab) ?? tabs[0]
  const qrValue = issues.length > 0 ? '' : qrMode === 'link' ? vpnUri : clientConfig

  return (
    <div className="output-stack">
      <section className="card output-card">
        <header className="card-head">
          <span className="step">۰۴</span>
          <div className="card-titles">
            <h2>خروجی نهایی</h2>
            <p>آمادهٔ کپی، دانلود یا اسکن</p>
          </div>
        </header>

        {issues.length > 0 ? (
          <div className="card-body">
            <div className="banner">
              <strong>برای ساخت کانفیگ، این موارد را کامل کنید:</strong>
              <ul>
                {issues.slice(0, 6).map(issue => (
                  <li key={issue.field + issue.message}>{issue.message}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="card-body">
              <div className="tabs" role="tablist" aria-label="نوع خروجی">
                {tabs.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === item.id}
                    className={activeTab === item.id ? 'tab tab-active' : 'tab'}
                    onClick={() => setTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="out-head">
                <code className="filename" dir="ltr">
                  {current.file}
                </code>
                <div className="out-actions">
                  <CopyButton text={current.body} />
                  <DownloadButton filename={current.file} text={current.body} />
                </div>
              </div>

              <pre className="code" dir="ltr">
                {current.body}
              </pre>

              {activeTab === 'amnezia' ? (
                <div className="vpn-box">
                  <div className="vpn-head">
                    <span>لینک مستقیم برای اپ AmneziaVPN</span>
                    <CopyButton text={vpnUri} label="کپی لینک" />
                  </div>
                  <code className="vpn-link" dir="ltr" title={vpnUri}>
                    {vpnUri || 'در حال ساخت…'}
                  </code>
                  <p className="hint">در اپ: «افزودن سرور» ← «وارد کردن از کلیپ‌بورد»</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>

      <section className="card qr-card">
        <header className="card-head">
          <span className="step">QR</span>
          <div className="card-titles">
            <h2>اسکن سریع</h2>
            <p>{qrMode === 'link' ? 'با دوربین اپ AmneziaVPN' : 'با اپ AmneziaWG یا WireGuard'}</p>
          </div>
        </header>
        <div className="card-body qr-body">
          {isAwg ? (
            <div className="segmented">
              <button
                type="button"
                className={qrMode === 'config' ? 'seg seg-active' : 'seg'}
                onClick={() => setQrMode('config')}
              >
                کانفیگ کلاینت
              </button>
              <button
                type="button"
                className={qrMode === 'link' ? 'seg seg-active' : 'seg'}
                onClick={() => setQrMode('link')}
              >
                لینک vpn://
              </button>
            </div>
          ) : null}
          <QrPanel value={qrValue} />
        </div>
      </section>
    </div>
  )
}
