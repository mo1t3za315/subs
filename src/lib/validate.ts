import { validateAwg } from './awg'
import { isValidKey } from './keys'
import type { Issue, Settings } from './types'

export function isIPv4(value: string): boolean {
  const parts = value.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

export function validate(settings: Settings): Issue[] {
  const issues: Issue[] = []
  const endpoint = settings.endpoint.trim()

  if (!endpoint) {
    issues.push({ field: 'endpoint', message: 'آدرس سرور (IP یا دامنه) را وارد کنید.' })
  } else if (!/^[a-zA-Z0-9.\-:[\]]+$/.test(endpoint)) {
    issues.push({ field: 'endpoint', message: 'آدرس سرور معتبر نیست.' })
  }

  if (!Number.isInteger(settings.port) || settings.port < 1 || settings.port > 65535) {
    issues.push({ field: 'port', message: 'پورت باید عددی بین ۱ تا ۶۵۵۳۵ باشد.' })
  }

  if (settings.dns.trim() && settings.dns.split(',').some(item => item.trim() && !isIPv4(item.trim()))) {
    issues.push({ field: 'dns', message: 'هر DNS باید یک IPv4 معتبر باشد.' })
  }

  if (!Number.isInteger(settings.mtu) || settings.mtu < 576 || settings.mtu > 9100) {
    issues.push({ field: 'mtu', message: 'MTU باید بین ۵۷۶ تا ۹۱۰۰ باشد.' })
  }

  if (!isIPv4(settings.clientIp)) {
    issues.push({ field: 'clientIp', message: 'آی‌پی کلاینت معتبر نیست.' })
  }

  if (!isIPv4(settings.serverTunnelIp)) {
    issues.push({ field: 'serverTunnelIp', message: 'آی‌پی تونل سرور معتبر نیست.' })
  }

  if (!Number.isInteger(settings.subnet) || settings.subnet < 8 || settings.subnet > 30) {
    issues.push({ field: 'subnet', message: 'ماسک شبکه باید بین ۸ تا ۳۰ باشد.' })
  }

  if (!settings.allowedIps.trim()) {
    issues.push({ field: 'allowedIps', message: 'AllowedIPs را وارد کنید.' })
  }

  if (!Number.isInteger(settings.keepalive) || settings.keepalive < 0 || settings.keepalive > 3600) {
    issues.push({ field: 'keepalive', message: 'PersistentKeepalive باید بین ۰ تا ۳۶۰۰ باشد.' })
  }

  if (!isValidKey(settings.serverPrivateKey)) {
    issues.push({ field: 'serverPrivateKey', message: 'کلید خصوصی سرور باید ۳۲ بایت Base64 باشد.' })
  }

  if (!isValidKey(settings.clientPrivateKey)) {
    issues.push({ field: 'clientPrivateKey', message: 'کلید خصوصی کلاینت باید ۳۲ بایت Base64 باشد.' })
  }

  if (settings.usePsk && !isValidKey(settings.psk)) {
    issues.push({ field: 'psk', message: 'کلید Preshared باید ۳۲ بایت Base64 باشد.' })
  }

  if (settings.mode === 'awg') {
    for (const message of validateAwg(settings.awg)) issues.push({ field: 'awg', message })
  }

  return issues
}

export function issueFor(issues: Issue[], field: string): string | undefined {
  return issues.find(issue => issue.field === field)?.message
}
