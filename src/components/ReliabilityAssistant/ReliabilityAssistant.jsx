import { useEffect, useState } from 'react'
import { AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react'
import { evaluateReliability } from '../../ai/reliabilityAssistant'
import './ReliabilityAssistant.css'

/*
  RELIABILITY ASSISTANT COMPONENT
  ===============================
  
  WHAT IT DOES:
  Watches the current QR config and runs it through the reliability engine.
  If any issues are found (like low contrast), it displays them to the user
  with an option to "Auto-Fix".
  
  PROPS:
  - config: object — the current full QR config
  - onFix: function — called with the corrected config values when Auto-Fix is clicked
*/
function ReliabilityAssistant({ config, onFix }) {
  const [warnings, setWarnings] = useState([])

  // Re-evaluate whenever the config changes (debouncing isn't really needed 
  // here since the math is extremely fast and synchronous, but if it were 
  // complex ML, we would debounce it).
  useEffect(() => {
    const results = evaluateReliability(config)
    setWarnings(results)
  }, [config])

  if (warnings.length === 0) return null

  return (
    <div className="reliability-assistant">
      <div className="ra-header">
        <ShieldAlert size={16} className="ra-header-icon" />
        <span className="ra-title">Scan Warnings</span>
      </div>
      
      <ul className="ra-list">
        {warnings.map((warn, idx) => (
          <li key={idx} className={`ra-item ${warn.level}`}>
            <AlertTriangle size={14} className="ra-item-icon" />
            <span className="ra-item-msg">{warn.message}</span>
            {warn.fix && (
              <button 
                className="ra-fix-btn"
                onClick={() => onFix(warn.fix)}
                title="Apply recommended fix"
              >
                <Sparkles size={12} />
                Fix
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ReliabilityAssistant
