import { useState, useRef } from 'react'
import { ImagePlus, X, Loader2, Download } from 'lucide-react'
import { generatePoster } from '../../services/mlApi'
import './PosterStudio.css'

export default function PosterStudio({ onClose }) {
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
      setResult(null)
      setError('')
    }
  }

  const handleGenerate = async () => {
    if (!url || !file) {
      setError("Please provide both a URL and a Poster Image.")
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const outputUrl = await generatePoster(file, url)
      if (outputUrl) {
        setResult(outputUrl)
      } else {
        setError("Poster generation failed.")
      }
    } catch (err) {
      setError("An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="poster-modal-overlay">
      <div className="poster-modal">
        <div className="pm-header">
          <h2>Poster Studio</h2>
          <button onClick={onClose} className="pm-close"><X size={20} /></button>
        </div>
        
        <div className="pm-content">
          <p className="pm-desc">
            Upload an event poster and enter a URL. The AI will extract the poster's colors, 
            generate a matching QR code, and seamlessly composite it onto the bottom corner.
          </p>
          
          <div className="pm-form">
            <div className="pm-field">
              <label>Target URL</label>
              <input 
                type="url" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                placeholder="https://gdg.community.dev"
              />
            </div>
            
            <div className="pm-field">
              <label>Poster Image</label>
              <div 
                className="pm-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Poster preview" className="pm-preview" />
                ) : (
                  <>
                    <ImagePlus size={32} />
                    <span>Click to upload poster</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
          
          {error && <div className="pm-error">{error}</div>}
          
          <button 
            className="pm-generate-btn" 
            onClick={handleGenerate}
            disabled={loading || !url || !file}
          >
            {loading ? <Loader2 className="spin" size={16} /> : <ImagePlus size={16} />}
            {loading ? 'Generating...' : 'Magic Composite'}
          </button>
          
          {result && (
            <div className="pm-result">
              <h3>Result</h3>
              <img src={result} alt="Composited Poster" className="pm-result-img" />
              <a href={result} download="poster_with_qr.png" className="pm-download-btn">
                <Download size={16} /> Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
