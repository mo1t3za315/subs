import type { AwgParams } from './types'

export type PresetId = 'off' | 'light' | 'normal' | 'strong'

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'off', label: 'خاموش' },
  { id: 'light', label: 'سبک' },
  { id: 'normal', label: 'متوسط' },
  { id: 'strong', label: 'قوی' },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomHeader(): number {
  return randomInt(5, 2147483647)
}

/** Four distinct H values, as AmneziaWG requires. */
function randomHeaders() {
  const values = new Set<number>()
  while (values.size < 4) values.add(randomHeader())
  const [h1, h2, h3, h4] = [...values]
  return { h1, h2, h3, h4 }
}

/** S2 must never equal S1 + 56. */
function paddingPair(min = 15, max = 150) {
  const s1 = randomInt(min, max)
  let s2 = randomInt(min, max)
  while (s2 === s1 + 56) s2 = randomInt(min, max)
  return { s1, s2 }
}

export function presetParams(id: PresetId): AwgParams {
  const headers = randomHeaders()
  switch (id) {
    case 'off':
      // AmneziaWG values that make it behave exactly like plain WireGuard.
      return { jc: 1, jmin: 0, jmax: 1, s1: 0, s2: 0, s3: 0, s4: 0, h1: 1, h2: 2, h3: 3, h4: 4 }
    case 'light': {
      const { s1, s2 } = paddingPair()
      return { jc: 4, jmin: 8, jmax: 80, s1, s2, s3: 20, s4: 15, ...headers }
    }
    case 'strong':
      return { jc: 12, jmin: 40, jmax: 240, s1: 100, s2: 160, s3: 60, s4: 40, ...headers }
    default: {
      const { s1, s2 } = paddingPair()
      return { jc: 6, jmin: 10, jmax: 120, s1, s2, s3: 25, s4: 20, ...headers }
    }
  }
}

export function validateAwg(awg: AwgParams): string[] {
  const errors: string[] = []
  if (awg.jc < 1 || awg.jc > 128) errors.push('Jc باید بین ۱ تا ۱۲۸ باشد.')
  if (awg.jmin < 0 || awg.jmin > 1280) errors.push('Jmin باید بین ۰ تا ۱۲۸۰ باشد.')
  if (awg.jmax < 0 || awg.jmax > 1280) errors.push('Jmax باید بین ۰ تا ۱۲۸۰ باشد.')
  if (awg.jmin >= awg.jmax) errors.push('Jmin باید کوچکتر از Jmax باشد.')
  if (awg.s1 < 0 || awg.s1 > 1132) errors.push('S1 باید بین ۰ تا ۱۱۳۲ باشد.')
  if (awg.s2 < 0 || awg.s2 > 1188) errors.push('S2 باید بین ۰ تا ۱۱۸۸ باشد.')
  if (awg.s2 === awg.s1 + 56) errors.push('S2 نباید برابر S1 + 56 باشد.')
  if (awg.s3 < 0 || awg.s3 > 1216) errors.push('S3 باید بین ۰ تا ۱۲۱۶ باشد.')
  if (awg.s4 < 0 || awg.s4 > 1280) errors.push('S4 باید بین ۰ تا ۱۲۸۰ باشد.')

  const headers = [awg.h1, awg.h2, awg.h3, awg.h4]
  if (headers.some(h => h < 0 || h > 4294967295 || !Number.isInteger(h))) {
    errors.push('مقادیر H1 تا H4 باید عدد صحیح بین ۰ تا ۴۲۹۴۹۶۷۲۹۵ باشند.')
  } else if (new Set(headers).size !== 4) {
    errors.push('مقادیر H1 تا H4 باید با هم متفاوت باشند.')
  }
  return errors
}
