import { allowedIpsList } from './config'
import type { Settings } from './types'

export function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * AmneziaVPN's native import format: a JSON envelope holding the AmneziaWG
 * config plus every obfuscation parameter the app reads back.
 */
export function buildAmneziaJson(settings: Settings, serverPublicKey: string, clientConfig: string): string {
  const dns = settings.dns
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

  const inner = {
    H1: String(settings.awg.h1),
    H2: String(settings.awg.h2),
    H3: String(settings.awg.h3),
    H4: String(settings.awg.h4),
    Jc: String(settings.awg.jc),
    Jmin: String(settings.awg.jmin),
    Jmax: String(settings.awg.jmax),
    S1: String(settings.awg.s1),
    S2: String(settings.awg.s2),
    S3: String(settings.awg.s3),
    S4: String(settings.awg.s4),
    I1: '',
    I2: '',
    I3: '',
    I4: '',
    I5: '',
    allowed_ips: allowedIpsList(settings),
    client_ip: settings.clientIp,
    client_priv_key: settings.clientPrivateKey,
    ...(settings.usePsk && settings.psk.trim() ? { psk_key: settings.psk.trim() } : {}),
    config: clientConfig.trimEnd(),
    hostName: settings.endpoint.trim(),
    mtu: String(settings.mtu),
    persistent_keep_alive: String(settings.keepalive),
    port: settings.port,
    server_pub_key: serverPublicKey,
  }

  const envelope = {
    containers: [
      {
        awg: {
          isThirdPartyConfig: true,
          last_config: JSON.stringify(inner),
          port: String(settings.port),
          protocol_version: '2',
          transport_proto: 'udp',
        },
        container: 'amnezia-awg',
      },
    ],
    defaultContainer: 'amnezia-awg',
    description: 'AmneziaWG',
    dns1: dns[0] ?? '1.1.1.1',
    dns2: dns[1] ?? dns[0] ?? '1.0.0.1',
    hostName: settings.endpoint.trim(),
  }

  return `${JSON.stringify(envelope, null, 2)}\n`
}

/**
 * vpn:// deep link understood by the AmneziaVPN client: base64url of a 4-byte
 * big-endian length followed by the zlib-compressed envelope (Qt qCompress).
 */
export async function buildVpnUri(json: string): Promise<string> {
  const payload = new TextEncoder().encode(json)
  const stream = new CompressionStream('deflate')
  const writer = stream.writable.getWriter()
  void writer.write(payload)
  void writer.close()
  const compressed = new Uint8Array(await new Response(stream.readable).arrayBuffer())

  const framed = new Uint8Array(4 + compressed.length)
  new DataView(framed.buffer).setUint32(0, payload.length, false)
  framed.set(compressed, 4)

  return `vpn://${base64Url(framed)}`
}
