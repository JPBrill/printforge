'use client'

interface Props {
  url: string
  score: number | null
}

export default function DownloadCard({ url, score }: Props) {
  const passed = score !== null && score >= 0.55
  const warning = score !== null && score >= 0.40 && score < 0.55

  return (
    <div className="flex flex-col gap-3 animate-fade-in rounded-xl border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#00ff88" />
          <path d="M5.5 10l3 3 6-6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-accent font-semibold text-sm">STL Ready</span>
        {score !== null && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
            passed ? 'border-accent/40 text-accent bg-accent/10' :
            warning ? 'border-yellow-600/40 text-yellow-400 bg-yellow-900/20' :
            'border-red-600/40 text-red-400 bg-red-900/20'
          }`}>
            Guardrail: {(score * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {warning && (
        <p className="text-yellow-400 text-xs">
          Low similarity score. Result may differ from input. Try a higher contrast image for best results.
        </p>
      )}

      <a
        href={url}
        download="printforge-output.stl"
        className="w-full py-2.5 rounded-xl text-center font-semibold text-black bg-accent hover:bg-accent-dim transition-colors text-sm"
      >
        Download STL
      </a>
    </div>
  )
}
