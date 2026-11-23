/**
 * آدرس سرور را بدون دخالت کاربر تعیین می‌کند:
 * ۱) اگر همین صفحه روی دامنه یا IP واقعی باز شده باشد، همان آدرس.
 * ۲) در غیر این صورت IP عمومی بازدیدکننده.
 */
function hostFromPage(): string {
  const hostname = window.location.hostname
  if (!hostname) return ''
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') return ''
  if (/^\d{2,5}-/.test(hostname)) return '' // هاست پروکسی پورت محیط پیش‌نمایش
  return hostname
}

async function publicIp(): Promise<string> {
  const response = await fetch('https://api.ipify.org?format=json', {
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) throw new Error(`status ${response.status}`)

  const data = (await response.json()) as { ip?: unknown }
  if (typeof data.ip !== 'string' || !data.ip.trim()) throw new Error('ip missing')
  return data.ip.trim()
}

export async function detectServerHost(): Promise<string> {
  const fromPage = hostFromPage()
  if (fromPage) return fromPage

  try {
    return await publicIp()
  } catch {
    return window.location.hostname
  }
}
