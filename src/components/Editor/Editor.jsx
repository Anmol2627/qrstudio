import { useState, useEffect, useCallback } from 'react'
import QRTypeSelector from '../QRTypeSelector/QRTypeSelector'
import QRForm from '../QRForm/QRForm'
import QRPreview from '../QRPreview/QRPreview'
import CustomizationPanel from '../CustomizationPanel/CustomizationPanel'
import PresetSelector from '../PresetSelector/PresetSelector'
import ContentAssistant from '../ContentAssistant/ContentAssistant'
import { DEFAULT_QR_CONFIG } from '../../data/constants'
import './Editor.css'

/*
  EDITOR COMPONENT — The Core QR Creation Workspace
  ==================================================
  
  This is the most important component in QR Studio. It:
  1. Holds the CENTRALIZED QR configuration state
  2. Orchestrates the three-panel layout (types | form+customization | preview)
  3. Passes data down and callbacks up to child components
  
  STATE ARCHITECTURE
  ------------------
  The qrConfig object is the single source of truth for the current QR code.
  Every child component reads from it and writes to it through callbacks.
  
  Why centralize here?
  Because the QR Type Selector, the Form, the Customization Panel, and
  the Preview ALL need access to the same data. If each component had
  its own copy, they'd go out of sync.
  
  The qrConfig object structure:
  {
    type: 'url' | 'text' | 'email' | 'phone' | 'wifi',
    data: { ... },            // Type-specific fields
    size: 300,                // Pixel dimensions
    foregroundColor: '#1B4332',
    backgroundColor: '#FFFFFF',
    errorCorrection: 'H',    // L, M, Q, or H
    margin: 4,                // Quiet zone modules
  }
  
  WHY useState AND NOT useReducer?
  --------------------------------
  useReducer is better when state updates are complex and have many
  different "action types" (like Redux). Our state updates are mostly
  simple merges: "update these fields." useState with a spread-merge
  pattern is simpler and sufficient for now.
  
  If the state logic grows more complex (undo/redo, for instance),
  we'd refactor to useReducer.
  
  CALLBACK PATTERN
  ----------------
  updateConfig is wrapped in useCallback. This is a performance
  optimization: it ensures the function reference stays the same
  between renders, preventing unnecessary re-renders of child
  components that receive it as a prop.
  
  For now it's a minor optimization, but it's a good habit to learn.
*/
function Editor({ initialConfig = DEFAULT_QR_CONFIG, onSaveToRecent }) {
  const [qrConfig, setQrConfig] = useState(initialConfig)

  // When a user clicks "Reuse" in the Recent page, App.jsx updates initialConfig.
  // We need this useEffect to actually apply that new config to our state.
  useEffect(() => {
    setQrConfig(initialConfig)
  }, [initialConfig])

  /*
    updateConfig merges partial updates into the existing config.
    
    Example usage:
      updateConfig({ size: 400 })           → changes only size
      updateConfig({ type: 'email', data: {} }) → changes type and clears data
    
    The spread operator (...) copies all existing fields, then the
    new `updates` overwrite only the specified fields.
    
    WHY a function inside setQrConfig?
    Because when a state update depends on the PREVIOUS state,
    you should use the function form: setState(prev => newState).
    This guarantees you're working with the latest state, even if
    multiple updates happen rapidly.
  */
  const updateConfig = useCallback((updates) => {
    setQrConfig(prev => ({ ...prev, ...updates }))
  }, [])

  /*
    updateData merges partial updates into just the `data` sub-object.
    This is used by QRForm to update type-specific fields (like url, email, ssid)
    without accidentally overwriting other config fields.
  */
  const updateData = useCallback((dataUpdates) => {
    setQrConfig(prev => ({
      ...prev,
      data: { ...prev.data, ...dataUpdates }
    }))
  }, [])

  return (
    <div className="editor">
      {/* 
        LEFT PANEL — QR Type Selector
        A vertical navigation showing URL, Text, Email, Phone, Wi-Fi.
        Clicking a type updates qrConfig.type and clears the form data.
      */}
      <aside className="editor-sidebar" role="complementary" aria-label="QR code type selector">
        <QRTypeSelector 
          selectedType={qrConfig.type} 
          onTypeSelect={(type) => updateConfig({ type, data: {} })}
        />
      </aside>

      {/* 
        CENTER PANEL — Form + Customization
        Contains the input fields for the selected QR type
        and the customization controls (size, colors, etc.)
      */}
      <section className="editor-center" role="main">
        <ContentAssistant 
          onParsed={(parsedData) => {
            // The AI assistant returns a type and data object.
            // We merge this into the existing config (preserving colors/size)
            updateConfig(parsedData)
          }} 
        />

        <PresetSelector 
          activeConfig={qrConfig} 
          onApplyPreset={updateConfig} 
        />
        
        <QRForm 
          type={qrConfig.type}
          data={qrConfig.data}
          onDataChange={updateData}
        />
        
        <CustomizationPanel
          config={qrConfig}
          onConfigChange={updateConfig}
        />
      </section>

      {/* 
        RIGHT PANEL — Live Preview
        Shows the QR code generated from the current config.
        Updates in real time as the user changes any setting.
      */}
      <aside className="editor-preview" role="complementary" aria-label="QR code preview">
        <QRPreview 
          config={qrConfig} 
          onSave={() => onSaveToRecent && onSaveToRecent(qrConfig)}
        />
      </aside>
    </div>
  )
}

export default Editor
