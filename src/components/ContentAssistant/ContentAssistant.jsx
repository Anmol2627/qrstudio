import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { parseNaturalLanguageInput } from '../../ai/contentAssistant'
import { classifyContent } from '../../services/mlApi'
import './ContentAssistant.css'

/*
  CONTENT ASSISTANT COMPONENT
  ===========================
  
  WHAT IT DOES:
  Provides a single "magic" text input where users can type what they want
  in natural language. It passes this to our heuristic AI parser and updates
  the main Editor configuration.
  
  PROPS:
  - onParsed: function — called with the resulting config updates { type, data }
*/
function ContentAssistant({ onParsed }) {
  const [input, setInput] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleProcess = async () => {
    if (!input.trim()) return

    // Add a slight artificial delay for the "AI thinking" effect.
    // This improves perceived value and user trust.
    setIsAnimating(true)
    
    try {
      // First attempt to use the ML Backend
      const apiResult = await classifyContent(input)
      
      let finalResult = null
      
      if (apiResult && apiResult.type) {
        // Map backend response
        finalResult = {
          type: apiResult.type,
          data: apiResult.entities || {}
        }
      } else {
        // Graceful fallback to heuristic engine if API is unavailable or fails
        console.log("Using heuristic fallback for content assistant.")
        finalResult = parseNaturalLanguageInput(input)
      }

      if (finalResult) {
        onParsed({ type: finalResult.type, data: finalResult.data })
        // Clear input after successful parsing
        setInput('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsAnimating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleProcess()
    }
  }

  return (
    <div className="content-assistant">
      <div className="ca-header">
        <Sparkles size={16} className="ca-icon" />
        <h3 className="ca-title">Smart Input</h3>
      </div>
      
      <p className="ca-desc">
        Describe what you want to share. We'll figure out the rest.
      </p>

      <div className="ca-input-wrapper">
        <input
          type="text"
          className="ca-input"
          placeholder="e.g. Email hr@company.com subject Interview"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnimating}
        />
        <button 
          className={`ca-submit ${isAnimating ? 'animating' : ''}`}
          onClick={handleProcess}
          disabled={!input.trim() || isAnimating}
          aria-label="Process smart input"
        >
          {isAnimating ? <Sparkles size={16} className="spin" /> : <ArrowRight size={16} />}
        </button>
      </div>
      
      <div className="ca-hints">
        <span className="ca-hint-tag">"Connect to wifi HomeNet pass 1234"</span>
        <span className="ca-hint-tag">"Call me at +1 555-1234"</span>
      </div>
    </div>
  )
}

export default ContentAssistant
