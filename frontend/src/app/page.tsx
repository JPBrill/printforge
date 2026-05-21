'use client'

import { useState, useCallback } from 'react'
import UploadZone from '@/components/UploadZone'
import Controls from '@/components/Controls'
import LoadingSteps from '@/components/LoadingSteps'
import DownloadCard from '@/components/DownloadCard'

export type Mode = 'stamp' | 'emboss'
export type AppState = 'idle' | 'loading' | 'done' | 'error'

export interface FormValues {
  mode: Mode
  size_mm: number
  base_mm: number
  depth_mm: number
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState<FormValues>({
    mode: 'stamp',
    size_mm: 80,
    base_mm: 3,
    depth_mm: 1.2,
  })
  const [appState, setAppState] = useState<AppState>('idle')
  const [step, setStep] = useState(0)
  const [stlUrl, setStlUrl] = useState<string | null>(null)
  const [guardrailScore, setGuardrailScore] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setAppState('idle')
    setStlUrl(null)
    setErrorMsg(null)
    setStep(0)
  }, [])

  const handleGenerate = async () => {
    if (!file) return
    setAppState('loading')
    setStep(0)
    setErrorMsg(null)
    setStlUrl(null)

    const steps = [1, 2, 3, 4, 5]
    for (const s of steps) {
      await new Promise(r => setTimeout(r, s === 3 ? 800 : 400))
      setStep(s)
    }

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('mode', form.mode)
      fd.append('size_mm', String(form.size_mm))
      fd.append('base_mm', String(form.base_mm))
      fd.append('depth_mm', String(form.depth_mm))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.detail?.message || 'Generation failed.')
      }

      const score = parseFloat(res.headers.get('X-Guardrail-Score') || '0')
      setGuardrailScore(score)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setStlUrl(url)
      setStep(6)
      setAppState('done')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error.')
      setAppState('error')
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold text-white tracking-tight">
          Print<span className="text-accent">Forge</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Upload any image. Get a 3D-printable STL in seconds.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-bg-card border border-border-dark rounded-2xl p-6 flex flex-col gap-6 shadow-2xl">

        <UploadZone onFile={handleFile} preview={preview} />

        <Controls form={form} onChange={setForm} />

        <button
          onClick={handleGenerate}
          disabled={!file || appState === 'loading'}
          className="w-full py-3 rounded-xl font-semibold text-black bg-accent hover:bg-accent-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-wide"
        >
          {appState === 'loading' ? 'Generating...' : 'Generate STL'}
        </button>

        {appState === 'loading' && <LoadingSteps currentStep={step} />}

        {appState === 'error' && (
          <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        {appState === 'done' && stlUrl && (
          <DownloadCard url={stlUrl} score={guardrailScore} />
        )}
      </div>

      <p className="mt-8 text-gray-600 text-xs">Free. No account. No limits.</p>
    </main>
  )
}
