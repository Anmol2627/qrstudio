import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2, Download, Palette, Scissors } from 'lucide-react'
import { generatePoster, generateArtisticQr } from '../../services/mlApi'
import ImageCropper from '../ImageCropper/ImageCropper'
import './PosterStudio.css'

/*
  POSTER STUDIO
  =============

  A two-mode QR generation workflow using an uploaded image as input.

  ┌─────────────────────────────────────────────────────┐
  │  Tab A: THEMED QR                                   │
  │  Extract dominant colors → generate styled QR       │
  │                                                     │
  │  Tab B: ARTISTIC QR                                 │
  │  Embed the image INTO the QR code pattern itself    │
  │  → Interactive crop tool → sliders → generate       │
  └─────────────────────────────────────────────────────┘

  STEP FLOW:
    Step 1 → Upload image (both modes)
    Step 2 → Crop (Artistic mode only)
    Step 3 → Configure (URL + sliders)
    Step 4 → Result

  KEY CONCEPTS (for interviews):
  - "Lifting state up": the crop result (File) is managed here, not in ImageCropper
  - "Controlled components": all sliders are controlled via state
  - generateArtisticQr sends dark_strength and light_strength to the backend
    which controls how visible the image vs. QR pattern is
*/

export default function PosterStudio({ onClose }) {
  const [mode, setMode] = useState('artistic') // 'themed' | 'artistic'
  const [step, setStep] = useState('upload')   // 'upload' | 'crop' | 'configure' | 'result'

  // Upload state
  const [rawFile, setRawFile] = useState(null)       // original uploaded file
  const [rawPreview, setRawPreview] = useState(null) // preview of original

  // Crop state
  const [croppedFile, setCroppedFile] = useState(null)
  const [croppedPreview, setCroppedPreview] = useState(null)
  const [showCropper, setShowCropper] = useState(false)

  // Configuration
  const [url, setUrl] = useState('')
  const [darkStrength, setDarkStrength] = useState(0.40)   // lum_threshold: 0.1–0.7

  // UI state
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)

  // The file to actually send to the backend:
  // In artistic mode, prefer the cropped file; fall back to raw
  const activeFile = croppedFile || rawFile
  const activePreview = croppedPreview || rawPreview

  // ── File upload handler ────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setRawFile(selected)
    setRawPreview(URL.createObjectURL(selected))
    // Reset downstream state
    setCroppedFile(null)
    setCroppedPreview(null)
    setShowCropper(false)
    setResult(null)
    setError('')
    setStep('configure')
  }

  // ── Crop handlers ──────────────────────────────────────────────────────────
  const handleOpenCropper = () => setShowCropper(true)

  const handleCropConfirm = (file, previewUrl) => {
    setCroppedFile(file)
    setCroppedPreview(previewUrl)
    setShowCropper(false)
  }

  const handleCropCancel = () => setShowCropper(false)

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!url || !activeFile) {
      setError('Please provide a URL and an image.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let outputUrl = null

      if (mode === 'themed') {
        outputUrl = await generatePoster(activeFile, url)
      } else {
        outputUrl = await generateArtisticQr(activeFile, url, darkStrength)
      }

      if (outputUrl) {
        setResult(outputUrl)
        setStep('result')
      } else {
        setError('Generation failed. The backend may be unavailable.')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setRawFile(null)
    setRawPreview(null)
    setCroppedFile(null)
    setCroppedPreview(null)
    setResult(null)
    setError('')
    setShowCropper(false)
  }

  return (
    <div className="poster-modal-overlay">
      <div className="poster-modal">

        {/* ── Header ── */}
        <div className="pm-header">
          <h2>Poster Studio</h2>
          <button onClick={onClose} className="pm-close"><X size={20} /></button>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="pm-tabs">
          <button
            className={`pm-tab ${mode === 'themed' ? 'active' : ''}`}
            onClick={() => { setMode('themed'); setResult(null); setError('') }}
          >
            <Palette size={14} />
            Themed QR
          </button>
          <button
            className={`pm-tab ${mode === 'artistic' ? 'active' : ''}`}
            onClick={() => { setMode('artistic'); setResult(null); setError('') }}
          >
            <Scissors size={14} />
            Artistic QR
          </button>
        </div>

        {/* ── Mode Description ── */}
        <div className="pm-content">
          <p className="pm-desc">
            {mode === 'themed' ? (
              <>Upload any image as a <strong>color reference</strong>. The AI extracts
              dominant colors and generates a matching styled QR code.</>
            ) : (
              <>Upload any image and the AI will <strong>embed it into the QR pattern</strong>.
              The QR looks like your image and is still scannable.
              You can crop to choose exactly which part is used.</>
            )}
          </p>

          {/* ── STEP: Upload ── */}
          {step === 'upload' && (
            <div
              className="pm-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={36} />
              <span>Click to upload an image</span>
              <span className="pm-upload-sub">JPG, PNG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* ── STEP: Configure (after upload) ── */}
          {(step === 'configure' || step === 'result') && (
            <div className="pm-configure">

              {/* Image preview + crop action */}
              <div className="pm-image-row">
                <div className="pm-image-thumb-wrap" onClick={() => fileInputRef.current?.click()}>
                  <img src={activePreview} alt="Selected" className="pm-image-thumb" />
                  <span className="pm-image-change">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="pm-image-meta">
                  <p className="pm-image-name">{rawFile?.name}</p>
                  {croppedFile && (
                    <span className="pm-crop-badge">✂ Cropped region selected</span>
                  )}
                  {mode === 'artistic' && (
                    <button className="pm-crop-btn" onClick={handleOpenCropper}>
                      <Scissors size={13} />
                      {croppedFile ? 'Adjust Crop' : 'Crop Region'}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Cropper */}
              {showCropper && rawPreview && (
                <ImageCropper
                  imageSrc={rawPreview}
                  onCrop={handleCropConfirm}
                  onCancel={handleCropCancel}
                />
              )}

              {/* URL Input */}
              {!showCropper && (
                <>
                  <div className="pm-field">
                    <label>Target URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://gdg.community.dev"
                    />
                  </div>

                  {/* Artistic-mode sliders */}
                  {mode === 'artistic' && (
                    <div className="pm-sliders">
                      <div className="pm-slider-row">
                        <label>
                          Color Sensitivity
                          <span className="pm-slider-desc">
                            Lower = more image colors shine through &nbsp;|&nbsp; Higher = darker, more scannable
                          </span>
                        </label>
                        <div className="pm-slider-track">
                          <span style={{fontSize:'0.7rem', opacity:0.6}}>Vibrant</span>
                          <input
                            type="range" min="0.10" max="0.70" step="0.05"
                            value={darkStrength}
                            onChange={e => setDarkStrength(parseFloat(e.target.value))}
                          />
                          <span style={{fontSize:'0.7rem', opacity:0.6}}>Bold</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && <div className="pm-error">{error}</div>}

                  <button
                    className="pm-generate-btn"
                    onClick={handleGenerate}
                    disabled={loading || !url || !activeFile}
                  >
                    {loading
                      ? <><Loader2 className="spin" size={16} /> Generating…</>
                      : <><ImagePlus size={16} /> Generate</>
                    }
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── STEP: Result ── */}
          {result && !showCropper && (
            <div className="pm-result">
              <h3>{mode === 'themed' ? 'Themed QR Code' : 'Artistic QR Code'}</h3>
              <p className="pm-result-sub">
                {mode === 'themed'
                  ? 'Colors extracted from your reference image'
                  : 'Your image is embedded in the QR pattern — scan it!'}
              </p>
              <img src={result} alt="Generated QR" className="pm-result-img" />
              <div className="pm-result-actions">
                <a href={result} download={mode === 'themed' ? 'themed_qr.png' : 'artistic_qr.png'} className="pm-download-btn">
                  <Download size={16} /> Download
                </a>
                <button className="pm-reset-btn" onClick={handleReset}>
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
