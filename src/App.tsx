import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { KeysSection } from './components/KeysSection'
import { ModeSwitch } from './components/ModeSwitch'
import { ObfuscationSection } from './components/ObfuscationSection'
import { OutputSection } from './components/OutputSection'
import { ServerSection } from './components/ServerSection'
import { buildAmneziaJson, buildVpnUri } from './lib/amnezia'
import { buildClientConfig, buildServerConfig } from './lib/config'
import { createDefaultSettings } from './lib/defaults'
import { publicKeyFromPrivate } from './lib/keys'
import type { AwgParams, Mode, Settings } from './lib/types'
import { validate } from './lib/validate'

export default function App() {
  const [settings, setSettings] = useState<Settings>(createDefaultSettings)
  const [vpnUri, setVpnUri] = useState('')

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings(previous => ({ ...previous, [key]: value }))

  const setAwg = <K extends keyof AwgParams>(key: K, value: number) =>
    setSettings(previous => ({ ...previous, awg: { ...previous.awg, [key]: value } }))

  const replaceAwg = (awg: AwgParams) => setSettings(previous => ({ ...previous, awg }))

  const serverPublicKey = useMemo(() => publicKeyFromPrivate(settings.serverPrivateKey), [settings.serverPrivateKey])
  const clientPublicKey = useMemo(() => publicKeyFromPrivate(settings.clientPrivateKey), [settings.clientPrivateKey])

  const issues = useMemo(() => validate(settings), [settings])

  const clientConfig = useMemo(() => buildClientConfig(settings, serverPublicKey), [settings, serverPublicKey])
  const serverConfig = useMemo(() => buildServerConfig(settings, clientPublicKey), [settings, clientPublicKey])
  const amneziaJson = useMemo(
    () => (settings.mode === 'awg' ? buildAmneziaJson(settings, serverPublicKey, clientConfig) : ''),
    [settings, serverPublicKey, clientConfig],
  )

  useEffect(() => {
    let alive = true

    if (!amneziaJson || issues.length > 0) {
      setVpnUri('')
      return
    }

    buildVpnUri(amneziaJson)
      .then(uri => {
        if (alive) setVpnUri(uri)
      })
      .catch(() => {
        if (alive) setVpnUri('')
      })

    return () => {
      alive = false
    }
  }, [amneziaJson, issues.length])

  return (
    <div className="app">
      <Header />

      <main className="layout">
        <div className="col col-form">
          <ModeSwitch mode={settings.mode} onChange={(mode: Mode) => set('mode', mode)} />
          <ServerSection settings={settings} set={set} issues={issues} />
          {settings.mode === 'awg' ? (
            <ObfuscationSection awg={settings.awg} setAwg={setAwg} onReplace={replaceAwg} />
          ) : null}
          <KeysSection
            settings={settings}
            set={set}
            serverPublicKey={serverPublicKey}
            clientPublicKey={clientPublicKey}
            issues={issues}
          />
        </div>

        <div className="col col-output">
          <OutputSection
            settings={settings}
            issues={issues}
            clientConfig={clientConfig}
            serverConfig={serverConfig}
            amneziaJson={amneziaJson}
            vpnUri={vpnUri}
          />
        </div>
      </main>

      <footer className="foot">
        <p>
          کانفیگ سرور را در <code>awg0.conf</code> قرار دهید و با <code>awg-quick up awg0</code> بالا بیاورید؛ کلیدها
          فقط در همین مرورگر ساخته می‌شوند و هیچ‌جا ذخیره یا ارسال نمی‌شوند.
        </p>
      </footer>
    </div>
  )
}
