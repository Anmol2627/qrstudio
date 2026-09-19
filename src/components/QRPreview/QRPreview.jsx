import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { QR_TYPES } from '../../data/constants'
import { Download, Copy, Maximize2 } from 'lucide-react'
import './QRPreview.css'

/*
  QR PREVIEW COMPONENT
  ====================
  
  WHAT IT DOES:
  Renders the live QR code preview using the `qrcode` library.
  Whenever the config changes, it regenerates the QR code.
  
  HOW QR GENERATION WORKS:
  The `qrcode` library takes a string and renders it to an HTML canvas.
  Different QR types need different string formats:
  - URL: just the URL string
  - Text: just the text string
  - Email: "mailto:email?subject=...&body=..."
  - Phone: "tel:+1234567890"
  - Wi-Fi: "WIFI:T:WPA;S:NetworkName;P:Password;;"
  
  These formats are standardized — any QR scanner understands them.
  
  IMPORTANT CONCEPT: useEffect
  ----------------------------
  useEffect runs AFTER the component renders. It's used for "side effects":
  things that interact with the outside world (DOM manipulation, API calls,
  timers, etc.).
  
  Here, we use useEffect to draw the QR code on the canvas AFTER the
  canvas element exists in the DOM. We can't draw on a canvas that
  doesn't exist yet, so we wait until after render.
  
  The dependency array [config] means: "re-run this effect whenever
  config changes." If config hasn't changed, skip the effect.
  
  IMPORTANT CONCEPT: useRef
  -------------------------
  useRef gives us a persistent reference to a DOM element.
  We need direct access to the <canvas> element because the QR library
  draws on it using the Canvas API (a browser drawing API).
  React's declarative model can't describe canvas drawing operations,
  so we "escape" into imperative DOM access with a ref.
*/
function QRPreview({ config, onSave }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [isEmpty, setIsEmpty] = useState(true)

  /*
    buildQRString converts the structured config data into the
    standardized string format that QR scanners expect.
    
    This is a pure utility function — it takes data in, returns
    a string out. No side effects. Easy to test independently.
  */
  const buildQRString = () => {
    const { type, data } = config

    switch (type) {
      case QR_TYPES.URL:
        return data.url || ''

      case QR_TYPES.TEXT:
        return data.text || ''

      case QR_TYPES.EMAIL: {
        if (!data.email) return ''
        // mailto: URI scheme — standard format for email QR codes
        let mailto = `mailto:${data.email}`
        const params = []
        if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`)
        if (data.body) params.push(`body=${encodeURIComponent(data.body)}`)
        if (params.length > 0) mailto += `?${params.join('&')}`
        return mailto
      }

      case QR_TYPES.PHONE:
        // tel: URI scheme — standard format for phone QR codes
        return data.phone ? `tel:${data.phone}` : ''

      case QR_TYPES.WIFI: {
        if (!data.ssid) return ''
        // WIFI: format — a standardized string for Wi-Fi QR codes
        // T = security type, S = SSID, P = password, H = hidden
        const security = data.security || 'WPA'
        const password = data.password || ''
        return `WIFI:T:${security};S:${data.ssid};P:${password};;`
      }

      default:
        return ''
    }
  }

  // Generate QR code whenever config changes
  useEffect(() => {
    const qrString = buildQRString()

    if (!qrString.trim()) {
      setIsEmpty(true)
      setError(null)
      // Clear the canvas when there's no content
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    setIsEmpty(false)
    setError(null)

    // QR library options — maps our config to the library's API
    const options = {
      width: config.size,
      margin: config.margin,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor,
      },
      errorCorrectionLevel: config.errorCorrection,
    }

    // QRCode.toCanvas draws directly onto our canvas element
    QRCode.toCanvas(canvasRef.current, qrString, options, (err) => {
      if (err) {
        console.error('QR generation error:', err)
        setError('Failed to generate QR code. Check your input.')
      }
    })
  }, [config]) // Re-run whenever any config property changes

  // Download the QR code as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    /*
      canvas.toDataURL() converts the canvas content to a base64-encoded
      PNG image string. We create a temporary <a> link element, set its
      href to this data URL, and programmatically click it to trigger
      the browser's download dialog.
      
      This is the standard browser-only approach for downloading
      canvas content. No backend needed.
    */
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `qrstudio-${config.type}-${Date.now()}.png`
    link.href = dataUrl
    link.click()
    
    // Auto-save to recent history upon successful download
    if (onSave) onSave()
  }

  // Copy QR code to clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    try {
      /*
        canvas.toBlob() creates a Blob (binary large object) from the
        canvas content. The Clipboard API then writes this as an image
        to the user's clipboard.
        
        This is a relatively new browser API — we wrap it in try/catch
        to gracefully handle browsers that don't support it.
      */
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      
      // Auto-save to recent history upon successful copy
      if (onSave) onSave()
      
      // TODO: Show a "Copied!" toast notification (Phase 14)
    } catch (err) {
      console.error('Copy to clipboard failed:', err)
      // TODO: Show error toast
    }
  }

  return (
    <div className="qr-preview">
      <div className="qr-preview-header">
        <h2 className="qr-preview-title">Live Preview</h2>
        <button className="qr-preview-expand" aria-label="Expand preview">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Canvas Container */}
      <div className="qr-preview-canvas-container">
        {isEmpty && !error && (
          <div className="qr-preview-empty">
            <p>Enter content to generate a QR code</p>
          </div>
        )}
        
        {error && (
          <div className="qr-preview-error">
            <p>{error}</p>
          </div>
        )}

        <canvas 
          ref={canvasRef}
          className={`qr-preview-canvas ${isEmpty ? 'hidden' : ''}`}
          aria-label="Generated QR code preview"
        />
      </div>

      {/* Action Buttons */}
      <div className="qr-preview-actions">
        <button 
          className="qr-action-primary"
          onClick={handleDownload}
          disabled={isEmpty}
          aria-label="Download QR code as PNG"
        >
          <Download size={16} />
          Download PNG
        </button>
        <div className="qr-action-secondary-group">
          <button 
            className="qr-action-secondary"
            onClick={handleCopy}
            disabled={isEmpty}
            aria-label="Copy QR code to clipboard"
          >
            <Copy size={14} />
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRPreview
