import { useState } from 'react'
import { Palette, Wand2 } from 'lucide-react'
import { parseDesignIntent } from '../../ai/designAssistant'
import './DesignAssistant.css'

/*
  DESIGN ASSISTANT COMPONENT
  ==========================
  
  WHAT IT DOES:
  Allows the user to describe the visual style they want in natural language.
  Calls the parsing engine and passes the config up.
  
  PROPS:
  - onApplyStyle: function — called with the new configuration when successful
*/
function DesignAssistant({ onApplyStyle }) {
  const [input, setInput] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleProcess = () => {
    if (!input.trim()) return

    setIsAnimating(true)
    setFeedback('')
    
    setTimeout(() => {
      const result = parseDesignIntent(input)
      if (result) {
        if (result.preset) {
          onApplyStyle(result.preset.config)
          setFeedback(`Applied ${result.preset.name} style!`)
        } else if (result.customConfig) {
          onApplyStyle(result.customConfig)
          setFeedback('Applied custom color!')
        }
        setInput('')
      } else {
        setFeedback("Couldn't quite understand that style.")
      }
      
      setIsAnimating(false)
      
      // Clear feedback after a few seconds
      setTimeout(() => setFeedback(''), 3000)
    }, 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleProcess()
    }
  }

  return (
    <div className="design-assistant">
      <div className="da-header">
        <Palette size={16} className="da-icon" />
        <span className="da-title">Magic Design</span>
      </div>
      
      <div className="da-input-wrapper">
        <input
          type="text"
          className="da-input"
          placeholder="e.g. Make it look like the ocean"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnimating}
        />
        <button 
          className={`da-submit ${isAnimating ? 'animating' : ''}`}
          onClick={handleProcess}
          disabled={!input.trim() || isAnimating}
          aria-label="Process magic design"
        >
          {isAnimating ? <Wand2 size={14} className="wiggle" /> : <Wand2 size={14} />}
        </button>
      </div>
      
      {feedback && (
        <div className="da-feedback">
          {feedback}
        </div>
      )}
    </div>
  )
}

export default DesignAssistant
