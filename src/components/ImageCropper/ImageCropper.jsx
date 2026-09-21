import { useRef, useState, useEffect, useCallback } from 'react'
import './ImageCropper.css'

/*
  IMAGE CROPPER COMPONENT
  =======================

  HOW IT WORKS (Browser Canvas API):

  We render the user's image onto an HTML <canvas> element.
  When the user clicks and drags, we track the mouse coordinates
  relative to the canvas to form a selection rectangle.
  
  To give visual feedback, we redraw the canvas every time the selection
  changes:
    1. Draw the image
    2. Draw a semi-transparent dark overlay on top (the "dimmed" area)
    3. "Cut out" the selection rectangle from that overlay so it looks bright
    4. Draw a dashed border around the selection

  When the user confirms, we:
    1. Create a new off-screen canvas
    2. Draw ONLY the selected region of the ORIGINAL image into it
    3. Convert that canvas to a Blob → File object
    4. Call onCrop(file, previewUrl) so the parent can send it to the backend

  Props:
    imageSrc  — object URL of the uploaded image
    onCrop    — called with (File, previewUrl) when user confirms
    onCancel  — called when user wants to use the full image instead
*/

const CANVAS_MAX_WIDTH = 520

export default function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)    // keeps the loaded HTMLImageElement
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })
  const [selection, setSelection] = useState(null)   // {x,y,w,h} in canvas display coords
  const [dragStart, setDragStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // ── Load the image and set canvas dimensions ──────────────────────────────
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const ratio = img.naturalHeight / img.naturalWidth
      const displayW = Math.min(img.naturalWidth, CANVAS_MAX_WIDTH)
      const displayH = Math.round(displayW * ratio)
      setCanvasSize({ w: displayW, h: displayH })
    }
    img.src = imageSrc
  }, [imageSrc])

  // ── Redraw canvas whenever selection changes ───────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || canvas.width === 0) return

    const ctx = canvas.getContext('2d')
    const { width: cw, height: ch } = canvas

    // 1. Draw the full image
    ctx.drawImage(img, 0, 0, cw, ch)

    if (selection && selection.w > 2 && selection.h > 2) {
      // 2. Dark overlay over the entire canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
      ctx.fillRect(0, 0, cw, ch)

      // 3. Cut the selection out of the overlay by redrawing the image there
      const { x, y, w, h } = selection
      // Map display coords → actual image coords for source
      const scaleX = img.naturalWidth / cw
      const scaleY = img.naturalHeight / ch
      ctx.drawImage(img,
        x * scaleX, y * scaleY, w * scaleX, h * scaleY,  // source
        x, y, w, h                                          // dest (display)
      )

      // 4. Dashed selection border
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 3])
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])

      // 4b. Thin accent inner border
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4)

      // 5. Corner handles
      const handleSize = 8
      ctx.fillStyle = '#ffffff'
      const corners = [
        [x, y], [x + w, y], [x, y + h], [x + w, y + h]
      ]
      corners.forEach(([cx2, cy2]) => {
        ctx.fillRect(cx2 - handleSize / 2, cy2 - handleSize / 2, handleSize, handleSize)
      })

      // 6. Dimensions label
      const displayW = Math.round(w)
      const displayH = Math.round(h)
      const label = `${displayW} × ${displayH}`
      ctx.font = '12px Inter, sans-serif'
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      const textW = ctx.measureText(label).width + 8
      const labelX = Math.min(x, cw - textW - 4)
      const labelY = y > 20 ? y - 6 : y + h + 18
      ctx.fillRect(labelX - 2, labelY - 14, textW, 18)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(label, labelX + 2, labelY)
    } else {
      // No selection yet — show a hint
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.fillRect(0, 0, cw, ch)
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Drag to select a region', cw / 2, ch / 2)
      ctx.textAlign = 'left'
    }
  }, [selection])

  useEffect(() => {
    draw()
  }, [selection, canvasSize, draw])

  // ── Mouse event helpers ────────────────────────────────────────────────────
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, canvasSize.w)),
      y: Math.max(0, Math.min(e.clientY - rect.top, canvasSize.h))
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    const pos = getCanvasPos(e)
    setDragStart(pos)
    setIsDragging(true)
    setSelection(null)
    setConfirmed(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart) return
    const pos = getCanvasPos(e)
    setSelection({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y)
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // ── Confirm crop: extract selection → File ─────────────────────────────────
  const handleConfirmCrop = () => {
    if (!selection || selection.w < 10 || selection.h < 10) return

    const img = imgRef.current
    const canvas = canvasRef.current
    const { w: cw, h: ch } = canvasSize

    // Scale selection from display coords back to actual image resolution
    const scaleX = img.naturalWidth / cw
    const scaleY = img.naturalHeight / ch

    const srcX = Math.round(selection.x * scaleX)
    const srcY = Math.round(selection.y * scaleY)
    const srcW = Math.round(selection.w * scaleX)
    const srcH = Math.round(selection.h * scaleY)

    // Off-screen canvas at original resolution
    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = srcW
    cropCanvas.height = srcH
    const ctx = cropCanvas.getContext('2d')
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)

    cropCanvas.toBlob((blob) => {
      const file = new File([blob], 'cropped_region.png', { type: 'image/png' })
      const previewUrl = URL.createObjectURL(blob)
      setConfirmed(true)
      onCrop(file, previewUrl)
    }, 'image/png')
  }

  const hasValidSelection = selection && selection.w > 10 && selection.h > 10

  return (
    <div className="image-cropper">
      <p className="cropper-hint">
        <strong>Drag</strong> on the image to select the region you want used as the QR pattern.
        Or <button className="cropper-skip-btn" onClick={onCancel}>use full image</button>.
      </p>

      <div className="cropper-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cropper-canvas"
          style={{ cursor: isDragging ? 'crosshair' : 'crosshair' }}
        />
      </div>

      <div className="cropper-actions">
        <button className="cropper-btn secondary" onClick={onCancel}>
          Use Full Image
        </button>
        <button
          className="cropper-btn primary"
          onClick={handleConfirmCrop}
          disabled={!hasValidSelection || confirmed}
        >
          {confirmed ? '✓ Region Selected' : 'Use This Region'}
        </button>
      </div>
    </div>
  )
}
