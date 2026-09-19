import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useState } from 'react'
import { 
  ERROR_CORRECTION_LEVELS, 
  QR_SIZE_MIN, 
  QR_SIZE_MAX, 
  QR_MARGIN_MIN, 
  QR_MARGIN_MAX 
} from '../../data/constants'
import './CustomizationPanel.css'

/*
  CUSTOMIZATION PANEL COMPONENT
  =============================
  
  WHAT IT DOES:
  Controls for adjusting QR code appearance:
  - Size (slider + number input)
  - Foreground color (color picker)
  - Background color (color picker)
  - Error correction level (dropdown)
  - Margin (slider)
  
  PROPS:
  - config: object — the full QR configuration
  - onConfigChange: function — called with partial config updates
  
  DESIGN DECISION: Expandable "Advanced Options"
  -----------------------------------------------
  Not every user needs every control visible at all times.
  We keep Size and Colors always visible (most commonly changed),
  and put Error Correction and Margin behind an expandable section.
  
  This reduces visual clutter without hiding functionality.
  
  INPUT TYPES USED:
  - range: native HTML slider — great for values with a clear min/max
  - color: native HTML color picker — opens the OS color picker dialog
  - number: numeric input with min/max constraints
  - select: dropdown for error correction levels
  
  These are all native HTML input types — no JavaScript slider library needed.
  The browser provides accessible, keyboard-navigable controls for free.
*/
function CustomizationPanel({ config, onConfigChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="customization-panel">
      <h2 className="customization-title">Customization</h2>

      {/* --- Size Control --- */}
      <div className="custom-group">
        <div className="custom-label-row">
          <label htmlFor="qr-size" className="custom-label">Size</label>
          <span className="custom-value">{config.size} px</span>
        </div>
        <div className="custom-slider-row">
          <input
            id="qr-size"
            type="range"
            className="custom-slider"
            min={QR_SIZE_MIN}
            max={QR_SIZE_MAX}
            step={10}
            value={config.size}
            onChange={(e) => onConfigChange({ size: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* --- Color Controls --- */}
      <div className="custom-group">
        <div className="custom-colors-row">
          <div className="custom-color-field">
            <label htmlFor="qr-fg-color" className="custom-label">
              Foreground Color
            </label>
            <div className="custom-color-input-wrapper">
              <input
                id="qr-fg-color"
                type="color"
                className="custom-color-picker"
                value={config.foregroundColor}
                onChange={(e) => onConfigChange({ foregroundColor: e.target.value })}
              />
              <input
                type="text"
                className="custom-color-text"
                value={config.foregroundColor}
                onChange={(e) => onConfigChange({ foregroundColor: e.target.value })}
                aria-label="Foreground color hex value"
                maxLength={7}
              />
            </div>
          </div>

          <div className="custom-color-field">
            <label htmlFor="qr-bg-color" className="custom-label">
              Background Color
            </label>
            <div className="custom-color-input-wrapper">
              <input
                id="qr-bg-color"
                type="color"
                className="custom-color-picker"
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                className="custom-color-text"
                value={config.backgroundColor}
                onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
                aria-label="Background color hex value"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Advanced Options Toggle --- */}
      <button 
        className="custom-advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
        aria-expanded={showAdvanced}
      >
        Advanced Options
        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* --- Advanced Options (collapsible) --- */}
      {showAdvanced && (
        <div className="custom-advanced">
          {/* Error Correction */}
          <div className="custom-group">
            <div className="custom-label-row">
              <label htmlFor="qr-error-correction" className="custom-label">
                Error Correction
                <button 
                  className="custom-info-btn"
                  aria-label="What is error correction?"
                  title="Higher error correction makes the QR more reliable but denser. Use 'H' (High) if you plan to add a logo."
                >
                  <Info size={14} />
                </button>
              </label>
            </div>
            <select
              id="qr-error-correction"
              className="form-input form-select"
              value={config.errorCorrection}
              onChange={(e) => onConfigChange({ errorCorrection: e.target.value })}
            >
              {Object.values(ERROR_CORRECTION_LEVELS).map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} — {level.description}
                </option>
              ))}
            </select>
          </div>

          {/* Margin */}
          <div className="custom-group">
            <div className="custom-label-row">
              <label htmlFor="qr-margin" className="custom-label">Margin</label>
              <span className="custom-value">{config.margin}</span>
            </div>
            <input
              id="qr-margin"
              type="range"
              className="custom-slider"
              min={QR_MARGIN_MIN}
              max={QR_MARGIN_MAX}
              step={1}
              value={config.margin}
              onChange={(e) => onConfigChange({ margin: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomizationPanel
