export type Mode = 'awg' | 'wg'

export type AwgParams = {
  jc: number
  jmin: number
  jmax: number
  s1: number
  s2: number
  s3: number
  s4: number
  h1: number
  h2: number
  h3: number
  h4: number
}

export type Settings = {
  mode: Mode
  endpoint: string
  port: number
  dns: string
  mtu: number
  serverTunnelIp: string
  subnet: number
  clientIp: string
  allowedIps: string
  keepalive: number
  natInterface: string
  serverPrivateKey: string
  clientPrivateKey: string
  usePsk: boolean
  psk: string
  awg: AwgParams
}

export type Issue = {
  field: string
  message: string
}
