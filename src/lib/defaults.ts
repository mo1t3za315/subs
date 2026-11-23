import { presetParams } from './awg'
import { generatePrivateKey, generatePsk } from './keys'
import type { Settings } from './types'

export function createDefaultSettings(): Settings {
  return {
    mode: 'awg',
    endpoint: '',
    port: 51820,
    dns: '1.1.1.1, 1.0.0.1',
    mtu: 1280,
    serverTunnelIp: '10.8.1.1',
    subnet: 24,
    clientIp: '10.8.1.2',
    allowedIps: '0.0.0.0/0, ::/0',
    keepalive: 25,
    natInterface: 'eth0',
    serverPrivateKey: generatePrivateKey(),
    clientPrivateKey: generatePrivateKey(),
    usePsk: false,
    psk: generatePsk(),
    awg: presetParams('normal'),
  }
}
