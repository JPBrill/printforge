'use client'

import type { FormValues, Mode } from '@/app/page'

interface Props {
  form: FormValues
  onChange: (v: FormValues) => void
}

export default function Controls({ form, onChange }: Props) {
  const set = (key: keyof FormValues, value: string | number) =>
    onChange({ ...form, [key]: value })

  return (
    <div className="flex flex-col gap-4">
      {/* Mode */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Mode</label>
        <div className="flex gap-2">
          {(['stamp', 'emboss'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => set('mode', m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                form.mode === m
                  ? 'bg-accent text-black border-accent'
                  : 'bg-transparent text-gray-400 border-border-dark hover:border-gray-500'
              }`}
            >
              {m === 'stamp' ? '🔴 Stamp' : '🟢 Emboss'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {form.mode === 'stamp'
            ? 'Lines recessed — press into clay, dough, wax'
            : 'Lines raised — artwork stands above surface'}
        </p>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'size_mm',  label: 'Size (mm)',  min: 20,  max: 200, step: 5 },
          { key: 'base_mm',  label: 'Base (mm)',  min: 1,   max: 10,  step: 0.5 },
          { key: 'depth_mm', label: 'Depth (mm)', min: 0.5, max: 5,   step: 0.1 },
        ] as const).map(({ key, label, min, max, step }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">{label}</label>
            <input
              type="range"
              min={min} max={max} step={step}
              value={form[key]}
              onChange={(e) => set(key, parseFloat(e.target.value))}
              className="accent-[#00ff88] w-full"
            />
            <span className="text-xs text-accent text-center">{form[key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
