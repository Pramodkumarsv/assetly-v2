'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

export default function QRCodeDisplay({ assetTag, assetId }: { assetTag: string; assetId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, `ASSET:${assetTag}:${assetId}`, {
        width: 180,
        margin: 2,
        color: { dark: '#ffffff', light: '#18181b' },
      })
    }
  }, [assetTag, assetId])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${assetTag}-qr.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('QR code downloaded!')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="text-xs text-zinc-500 font-mono">{assetTag}</p>
      <button onClick={download} className="btn-secondary w-full justify-center text-xs">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Download QR
      </button>
    </div>
  )
}
