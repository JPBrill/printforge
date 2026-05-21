'use client'

import { useCallback, useState } from 'react'

interface Props {
  onFile: (f: File) => void
  preview: string | null
}

export default function UploadZone({ onFile, preview }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors h-44 ${
        dragging ? 'border-accent bg-accent/5' : 'border-border-dark hover:border-gray-600'
      }`}
    >
      <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
      {preview ? (
        <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm">Drop image here or <span className="text-accent">browse</span></span>
          <span className="text-xs">JPG, PNG, WEBP — max 10MB</span>
        </div>
      )}
    </label>
  )
}
