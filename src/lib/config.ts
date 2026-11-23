import type { AwgParams, Settings } from './types'

function awgLines(awg: AwgParams): string[] {
  return [
    `Jc = ${awg.jc}`,
    `Jmin = ${awg.jmin}`,
    `Jmax = ${awg.jmax}`,
    `S1 = ${awg.s1}`,
    `S2 = ${awg.s2}`,
    `S3 = ${awg.s3}`,
    `S4 = ${awg.s4}`,
    `H1 = ${awg.h1}`,
    `H2 = ${awg.h2}`,
    `H3 = ${awg.h3}`,
    `H4 = ${awg.h4}`,
  ]
}

export function buildClientConfig(settings: Settings, serverPublicKey: string): string {
  const lines = ['[Interface]', `PrivateKey = ${settings.clientPrivateKey}`, `Address = ${settings.clientIp}/32`]

  const dns = settings.dns.trim()
  if (dns) lines.push(`DNS = ${dns}`)
  lines.push(`MTU = ${settings.mtu}`)

  if (settings.mode === 'awg') lines.push(...awgLines(settings.awg))

  lines.push('', '[Peer]', `PublicKey = ${serverPublicKey}`)
  if (settings.usePsk && settings.psk.trim()) lines.push(`PresharedKey = ${settings.psk.trim()}`)
  lines.push(`AllowedIPs = ${settings.allowedIps}`)
  lines.push(`Endpoint = ${settings.endpoint.trim()}:${settings.port}`)
  if (settings.keepalive > 0) lines.push(`PersistentKeepalive = ${settings.keepalive}`)

  return `${lines.join('\n')}\n`
}

export function buildServerConfig(settings: Settings, clientPublicKey: string): string {
  const nic = settings.natInterface.trim() || 'eth0'
  const lines = [
    '[Interface]',
    `PrivateKey = ${settings.serverPrivateKey}`,
    `Address = ${settings.serverTunnelIp}/${settings.subnet}`,
    `MTU = ${settings.mtu}`,
    `ListenPort = ${settings.port}`,
    `PostUp = iptables -I FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${nic} -j MASQUERADE`,
    `PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ${nic} -j MASQUERADE`,
  ]

  if (settings.mode === 'awg') lines.push(...awgLines(settings.awg))

  lines.push('', '[Peer]', `PublicKey = ${clientPublicKey}`)
  if (settings.usePsk && settings.psk.trim()) lines.push(`PresharedKey = ${settings.psk.trim()}`)
  lines.push(`AllowedIPs = ${settings.clientIp}/32`)

  return `${lines.join('\n')}\n`
}

export function allowedIpsList(settings: Settings): string[] {
  return settings.allowedIps
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}
