import { describe, expect, it } from 'vitest'
import { PRESETS, presetParams, validateAwg, type PresetId } from './awg'
import type { AwgParams } from './types'

const RUNS = 300

/** پارامترهای پایهٔ معتبر برای تست‌های منفی. */
const validBase: AwgParams = {
  jc: 6,
  jmin: 10,
  jmax: 120,
  s1: 20,
  s2: 30,
  s3: 25,
  s4: 20,
  h1: 100,
  h2: 200,
  h3: 300,
  h4: 400,
}

/** همهٔ قیدهای AmneziaWG را جدا از validateAwg بررسی می‌کند. */
function checkConstraints(awg: AwgParams) {
  expect(awg.jc).toBeGreaterThanOrEqual(1)
  expect(awg.jc).toBeLessThanOrEqual(128)

  expect(awg.jmin).toBeGreaterThanOrEqual(0)
  expect(awg.jmin).toBeLessThan(awg.jmax)
  expect(awg.jmax).toBeLessThanOrEqual(1280)

  expect(awg.s1).toBeGreaterThanOrEqual(0)
  expect(awg.s1).toBeLessThanOrEqual(1132)
  expect(awg.s2).toBeGreaterThanOrEqual(0)
  expect(awg.s2).toBeLessThanOrEqual(1188)
  expect(awg.s2).not.toBe(awg.s1 + 56)
  expect(awg.s3).toBeGreaterThanOrEqual(0)
  expect(awg.s3).toBeLessThanOrEqual(1216)
  expect(awg.s4).toBeGreaterThanOrEqual(0)
  expect(awg.s4).toBeLessThanOrEqual(1280)

  const headers = [awg.h1, awg.h2, awg.h3, awg.h4]
  for (const header of headers) {
    expect(Number.isInteger(header)).toBe(true)
    expect(header).toBeGreaterThanOrEqual(0)
    expect(header).toBeLessThanOrEqual(4294967295)
  }
  expect(new Set(headers).size).toBe(4)
}

function expectErrors(awg: AwgParams) {
  expect(validateAwg(awg).length).toBeGreaterThan(0)
}

describe('presetParams', () => {
  for (const { id } of PRESETS) {
    it(`پیش‌تنظیم «${id}» پارامترهای معتبر می‌سازد`, () => {
      const awg = presetParams(id)
      expect(validateAwg(awg)).toEqual([])
      checkConstraints(awg)
    })
  }

  it('پیش‌تنظیم «خاموش» دقیقاً رفتار WireGuard ساده را حفظ می‌کند', () => {
    expect(presetParams('off')).toMatchObject({
      jc: 1,
      jmin: 0,
      jmax: 1,
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      h1: 1,
      h2: 2,
      h3: 3,
      h4: 4,
    })
  })

  it('در ساخت مکرر، مقادیر H دوباره تولید می‌شوند', () => {
    const seen = new Set<number>()
    for (let index = 0; index < 20; index += 1) seen.add(presetParams('normal').h1)
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('تولید تصادفی پارامترهای مبهم‌سازی', () => {
  const ids: PresetId[] = ['light', 'normal', 'strong']

  for (const id of ids) {
    it(`در ${RUNS} بار ساخت «${id}» همهٔ قیدها رعایت می‌شود`, () => {
      for (let index = 0; index < RUNS; index += 1) {
        const awg = presetParams(id)
        expect(validateAwg(awg)).toEqual([])
        checkConstraints(awg)
      }
    })
  }

  it('S2 هرگز برابر S1 + 56 نمی‌شود', () => {
    for (let index = 0; index < RUNS; index += 1) {
      const { s1, s2 } = presetParams('normal')
      expect(s2).not.toBe(s1 + 56)
    }
  })

  it('H1 تا H4 همیشه چهار مقدار متمایز هستند', () => {
    for (let index = 0; index < RUNS; index += 1) {
      const { h1, h2, h3, h4 } = presetParams('strong')
      expect(new Set([h1, h2, h3, h4]).size).toBe(4)
    }
  })

  it('S-padها داخل محدودهٔ مجاز می‌مانند', () => {
    for (let index = 0; index < RUNS; index += 1) {
      const awg = presetParams('light')
      expect(awg.s1).toBeGreaterThanOrEqual(0)
      expect(awg.s1).toBeLessThanOrEqual(1132)
      expect(awg.s2).toBeGreaterThanOrEqual(0)
      expect(awg.s2).toBeLessThanOrEqual(1188)
    }
  })
})

describe('validateAwg', () => {
  it('پارامترهای معتبر را بدون خطا می‌پذیرد', () => {
    expect(validateAwg(validBase)).toEqual([])
  })

  it('Jc خارج از محدودهٔ ۱ تا ۱۲۸ را رد می‌کند', () => {
    expectErrors({ ...validBase, jc: 0 })
    expectErrors({ ...validBase, jc: 129 })
  })

  it('Jmin بزرگ‌تر یا مساوی Jmax را رد می‌کند', () => {
    expectErrors({ ...validBase, jmin: 120, jmax: 120 })
    expectErrors({ ...validBase, jmin: 200, jmax: 120 })
  })

  it('S2 برابر S1 + 56 را رد می‌کند', () => {
    expectErrors({ ...validBase, s1: 20, s2: 76 })
  })

  it('S-pad خارج از محدوده را رد می‌کند', () => {
    expectErrors({ ...validBase, s1: 1133 })
    expectErrors({ ...validBase, s2: 1189 })
    expectErrors({ ...validBase, s3: 1217 })
    expectErrors({ ...validBase, s4: 1281 })
  })

  it('H تکراری یا خارج از محدوده را رد می‌کند', () => {
    expectErrors({ ...validBase, h4: validBase.h1 })
    expectErrors({ ...validBase, h2: 4294967296 })
    expectErrors({ ...validBase, h3: 12.5 })
  })
})
