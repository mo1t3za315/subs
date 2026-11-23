import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrPanel({ value }: { value: string }) {
  const [src, setSrc] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    setFailed(false)
    setSrc('')

    if (!value) return

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 420,
      color: { dark: '#08111a', light: '#ffffff' },
    })
      .then(url => {
        if (alive) setSrc(url)
      })
      .catch(() => {
        if (alive) setFailed(true)
      })

    return () => {
      alive = false
    }
  }, [value])

  if (!value) return <div className="qr-placeholder">برای نمایش QR، خروجی معتبر لازم است.</div>
  if (failed) return <div className="qr-placeholder">ساخت تصویر QR ممکن نشد.</div>
  if (!src) return <div className="qr-placeholder">در حال ساخت…</div>

  return (
    <div className="qr-frame">
      <img className="qr-img" src={src} alt="کد QR کانفیگ" width={216} height={216} />
    </div>
  )
}
