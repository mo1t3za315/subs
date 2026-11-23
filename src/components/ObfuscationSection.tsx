import { useState, type ChangeEvent } from 'react'
import { PRESETS, presetParams, validateAwg, type PresetId } from '../lib/awg'
import type { AwgParams } from '../lib/types'
import { Chip, Field, Input, SectionCard } from './ui'

type Props = {
  awg: AwgParams
  setAwg: <K extends keyof AwgParams>(key: K, value: number) => void
  onReplace: (params: AwgParams) => void
}

const NUMBER_FIELDS: { key: keyof AwgParams; label: string; hint?: string; max: number }[] = [
  { key: 'jc', label: 'Jc', hint: 'تعداد بستهٔ آشغال (۱–۱۲۸)', max: 128 },
  { key: 'jmin', label: 'Jmin', hint: 'کمینهٔ اندازه', max: 1280 },
  { key: 'jmax', label: 'Jmax', hint: 'بیشینهٔ اندازه', max: 1280 },
  { key: 's1', label: 'S1', hint: 'پد Init', max: 1132 },
  { key: 's2', label: 'S2', hint: 'پد Response', max: 1188 },
  { key: 's3', label: 'S3', hint: 'پد Cookie', max: 1216 },
  { key: 's4', label: 'S4', hint: 'پد Data', max: 1280 },
]

const HEADER_FIELDS: { key: keyof AwgParams; label: string }[] = [
  { key: 'h1', label: 'H1' },
  { key: 'h2', label: 'H2' },
  { key: 'h3', label: 'H3' },
  { key: 'h4', label: 'H4' },
]

export function ObfuscationSection({ awg, setAwg, onReplace }: Props) {
  const [applied, setApplied] = useState<PresetId | null>('normal')
  const errors = validateAwg(awg)

  const applyPreset = (id: PresetId) => {
    onReplace(presetParams(id))
    setApplied(id)
  }

  const edit = (key: keyof AwgParams) => (event: ChangeEvent<HTMLInputElement>) => {
    setAwg(key, Number(event.target.value))
    setApplied(null)
  }

  return (
    <SectionCard
      step="۰۲"
      title="مبهم‌سازی AmneziaWG"
      description="این مقادیر باید روی سرور و کلاینت یکسان باشند"
      aside={
        <button type="button" className="btn" onClick={() => applyPreset('normal')}>
          تصادفی‌سازی
        </button>
      }
    >
      <div className="chips">
        {PRESETS.map(preset => (
          <Chip key={preset.id} active={applied === preset.id} onClick={() => applyPreset(preset.id)}>
            {preset.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-3">
        {NUMBER_FIELDS.map(field => (
          <Field key={field.key} label={field.label} hint={field.hint}>
            <Input ltr type="number" min={0} max={field.max} value={awg[field.key]} onChange={edit(field.key)} />
          </Field>
        ))}
      </div>

      <div className="grid grid-4">
        {HEADER_FIELDS.map(field => (
          <Field key={field.key} label={field.label} hint="شناسهٔ نوع پیام">
            <Input ltr type="number" min={0} max={4294967295} value={awg[field.key]} onChange={edit(field.key)} />
          </Field>
        ))}
      </div>

      {errors.length > 0 ? (
        <ul className="issues">
          {errors.map(message => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

      <details className="explain">
        <summary>این پارامترها چه کاری می‌کنند؟</summary>
        <ul>
          <li>
            <b>Jc، Jmin، Jmax</b> — پیش از دست‌دادن (handshake)، چند بستهٔ آشغال با اندازهٔ تصادفی ارسال می‌شود تا
            الگوی WireGuard در ترافیک دیده نشود.
          </li>
          <li>
            <b>S1 تا S4</b> — به ابتدای هر نوع پیام چند بایت پد اضافه می‌کند و طول ثابت بسته‌ها را می‌شکند.
          </li>
          <li>
            <b>H1 تا H4</b> — شناسهٔ نوع پیام‌ها را از مقادیر ثابت WireGuard به اعداد دلخواه تغییر می‌دهد؛ چهار مقدار
            باید متفاوت باشند.
          </li>
          <li>مقادیر Jc، Jmin و Jmax می‌توانند بین دو طرف متفاوت باشند، اما S و H باید دقیقاً یکسان باشند.</li>
        </ul>
      </details>
    </SectionCard>
  )
}
