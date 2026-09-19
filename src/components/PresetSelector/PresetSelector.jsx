import { Check } from 'lucide-react'
import { PRESETS } from '../../data/presets'
import './PresetSelector.css'

/*
  PRESET SELECTOR COMPONENT
  =========================
  
  WHAT IT DOES:
  Displays a horizontal, scrollable list of visual presets.
  Clicking a preset applies its color/margin/error-correction
  settings to the active QR code.
  
  PROPS:
  - activeConfig: object — the current full QR config
  - onApplyPreset: function — called with the preset's config updates
  
  HOW WE DETECT THE "ACTIVE" PRESET:
  We don't actually store an `activePresetId` in our state. Why?
  Because a user might click "Minimal", then manually change the color.
  If they do that, they are no longer using the pure "Minimal" preset.
  
  Instead, we determine if a preset is active by checking if the current
  config matches the preset's config EXACTLY. This is a computed value,
  meaning it's calculated on every render based on the current state,
  rather than being stored as a separate, potentially out-of-sync state variable.
*/
function PresetSelector({ activeConfig, onApplyPreset }) {
  
  // Helper to check if a preset perfectly matches the current config
  const isPresetActive = (presetConfig) => {
    return (
      activeConfig.foregroundColor === presetConfig.foregroundColor &&
      activeConfig.backgroundColor === presetConfig.backgroundColor &&
      activeConfig.errorCorrection === presetConfig.errorCorrection &&
      activeConfig.margin === presetConfig.margin
    )
  }

  return (
    <section className="preset-selector" aria-labelledby="preset-heading">
      <div className="preset-header">
        <h2 id="preset-heading" className="preset-title">Presets</h2>
        <p className="preset-desc">Quick starting points for your design.</p>
      </div>

      <div className="preset-list-container">
        <ul className="preset-list" role="list">
          {PRESETS.map((preset) => {
            const isActive = isPresetActive(preset.config)
            
            return (
              <li key={preset.id}>
                <button
                  className={`preset-card ${isActive ? 'active' : ''}`}
                  onClick={() => onApplyPreset(preset.config)}
                  aria-pressed={isActive}
                >
                  <div 
                    className="preset-preview"
                    style={{
                      backgroundColor: preset.config.backgroundColor,
                      borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)'
                    }}
                  >
                    {/* Simulated QR code graphic using DOM elements */}
                    <div 
                      className="preset-qr-sim"
                      style={{ 
                        color: preset.config.foregroundColor,
                        padding: `${preset.config.margin}px` 
                      }}
                    >
                      <div className="sim-eye top-left"></div>
                      <div className="sim-eye top-right"></div>
                      <div className="sim-eye bottom-left"></div>
                      <div className="sim-dots"></div>
                    </div>
                  </div>
                  
                  <div className="preset-info">
                    <span className="preset-name">{preset.name}</span>
                    {isActive && <Check size={12} className="preset-check" />}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default PresetSelector
