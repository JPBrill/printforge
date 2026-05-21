'use client'

const STEPS = [
  'Uploading image',
  'Converting to greyscale',
  'Building heightmap',
  'Generating 3D mesh',
  'Validating output',
  'Ready!',
]

interface Props { currentStep: number }

export default function LoadingSteps({ currentStep }: Props) {
  const progress = Math.round((currentStep / STEPS.length) * 100)

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {/* Progress bar */}
      <div className="w-full h-1 bg-border-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-1.5">
        {STEPS.map((label, i) => {
          const done = currentStep > i
          const active = currentStep === i
          return (
            <div
              key={i}
              className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${
                done ? 'opacity-100' : active ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#00ff88" />
                    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" className="animate-spin-slow">
                    <circle cx="8" cy="8" r="6" stroke="#00ff88" strokeWidth="2" strokeDasharray="20 18" fill="none" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" stroke="#333" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </span>
              <span className={done ? 'text-accent' : active ? 'text-white' : 'text-gray-500'}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
