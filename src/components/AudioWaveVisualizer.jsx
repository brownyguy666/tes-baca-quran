import { useEffect, useRef } from 'react'

/**
 * Real-time Audio Waveform & Equalizer Visualizer using Web Audio API
 * Renders glowing dynamic frequency bars that react to voice input.
 */
export default function AudioWaveVisualizer({ stream, isRecording }) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (isRecording && stream) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        const audioCtx = new AudioContext()
        audioContextRef.current = audioCtx

        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser

        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(analyser)
        sourceRef.current = source

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const draw = () => {
          animationFrameRef.current = requestAnimationFrame(draw)
          analyser.getByteFrequencyData(dataArray)

          const width = canvas.width
          const height = canvas.height
          ctx.clearRect(0, 0, width, height)

          const barCount = 28
          const barWidth = (width / barCount) - 3
          const step = Math.floor(bufferLength / barCount) || 1

          for (let i = 0; i < barCount; i++) {
            const val = dataArray[i * step] || 0
            const percent = val / 255
            const barHeight = Math.max(4, percent * height * 0.85)
            const x = i * (barWidth + 3) + 2
            const y = (height - barHeight) / 2

            // Glowing gradient: Emerald -> Gold -> Indigo
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
            gradient.addColorStop(0, '#f59e0b') // Amber/Gold
            gradient.addColorStop(0.5, '#10b981') // Emerald
            gradient.addColorStop(1, '#6366f1') // Indigo

            ctx.fillStyle = gradient
            ctx.shadowBlur = 8
            ctx.shadowColor = 'rgba(16,185,129,0.5)'

            // Draw rounded bar
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth, barHeight, 3)
            ctx.fill()
          }
        }

        draw()
      } catch (err) {
        console.warn('AudioVisualizer Web Audio API error:', err)
      }
    } else {
      // Idle wave state
      let phase = 0
      const drawIdle = () => {
        animationFrameRef.current = requestAnimationFrame(drawIdle)
        const width = canvas.width
        const height = canvas.height
        ctx.clearRect(0, 0, width, height)

        const barCount = 28
        const barWidth = (width / barCount) - 3

        for (let i = 0; i < barCount; i++) {
          const sinVal = Math.sin((i / barCount) * Math.PI * 2 + phase)
          const barHeight = 4 + (sinVal + 1) * 3
          const x = i * (barWidth + 3) + 2
          const y = (height - barHeight) / 2

          ctx.fillStyle = 'rgba(148,163,184,0.25)'
          ctx.shadowBlur = 0
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, 2)
          ctx.fill()
        }
        phase += 0.05
      }

      drawIdle()
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (sourceRef.current) {
        try { sourceRef.current.disconnect() } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close() } catch {}
      }
    }
  }, [stream, isRecording])

  return (
    <div className="w-full flex items-center justify-center py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
      <canvas
        ref={canvasRef}
        width={320}
        height={46}
        className="w-full max-w-xs h-10 block"
      />
    </div>
  )
}
