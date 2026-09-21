import { useEffect, useState, useRef } from 'react'
import { AlertTriangle, ShieldAlert, Sparkles, Activity } from 'lucide-react'
import { evaluateReliability } from '../../ai/reliabilityAssistant'
import { analyzeReliability } from '../../services/mlApi'
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
  const [score, setScore] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Debounce the ML API call by 500ms
    debounceRef.current = setTimeout(async () => {
      try {
        const params = {
          size: config.size,
          margin: config.margin,
          error_correction: config.errorCorrection,
          foreground_color: config.foregroundColor,
          background_color: config.backgroundColor
        }
        
        const mlResult = await analyzeReliability(params)
        
        if (mlResult) {
          // Use ML results
          setScore(mlResult.score)
          const mappedWarnings = mlResult.issues.map(msg => ({
            level: mlResult.scannable ? 'warning' : 'critical',
            message: msg,
            fix: Object.keys(mlResult.recommendations).length > 0 ? mlResult.recommendations : null
          }))
          setWarnings(mappedWarnings)
        } else {
          // Fallback to heuristics
          setScore(null)
          setWarnings(evaluateReliability(config))
        }
      } catch (err) {
        console.error(err)
        setScore(null)
        setWarnings(evaluateReliability(config))
      }
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [config])

  if (warnings.length === 0) return null

  return (
    <div className="reliability-assistant">
      <div className="ra-header">
        <ShieldAlert size={16} className="ra-header-icon" />
        <span className="ra-title">Scan Warnings</span>
        {score !== null && (
          <div className="ra-score" title="ML Confidence Score">
            <Activity size={12} />
            <span>{Math.round(score * 100)}%</span>
          </div>
        )}
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
