import { useState, useCallback } from 'react'
import Header from './components/Header/Header'
import LandingPage from './components/LandingPage/LandingPage'
import Editor from './components/Editor/Editor'
import RecentQRCodes from './components/RecentQRCodes/RecentQRCodes'
import { useLocalStorage } from './hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_QR_CONFIG, QR_TYPES } from './data/constants'
import './App.css'

/*
  APP COMPONENT — The Root of the Application
  ============================================
  
  WHY does App manage the "page" state?
  --------------------------------------
  App.jsx is the highest-level component in QR Studio. It decides
  what the user sees: the landing page or the editor.
  
  We use a simple `currentPage` state variable to toggle between views.
  This is simpler than installing a full routing library (like React Router)
  because QR Studio is essentially a single-page tool with two views:
  1. Landing page — first impression, explains what QR Studio does
  2. Editor — the main QR creation workspace
  
  WHY useState instead of a plain variable?
  ------------------------------------------
  In React, a component re-renders (redraws the UI) when its STATE
  changes. A plain JavaScript variable like `let page = 'landing'`
  would change in memory but React wouldn't know about it, so the
  UI would never update.
  
  useState tells React: "Watch this value. When it changes, re-render."
  
  ARCHITECTURE NOTE
  -----------------
  As we build more phases, this file will grow to include the Editor
  component and the centralized QR configuration state. For now, we
  start minimal and add complexity only when needed.
*/
function App() {
  // currentPage tracks which view is active: 'landing', 'editor', or 'recent'
  const [currentPage, setCurrentPage] = useState('landing')
  
  // Stores the config that should be loaded into the editor
  const [editorInitialConfig, setEditorInitialConfig] = useState(DEFAULT_QR_CONFIG)

  // Local storage hook for recent QR codes
  const [recentCodes, setRecentCodes] = useLocalStorage(STORAGE_KEYS.RECENT_QR_CODES, [])

  /*
    handleSaveToRecent is called when a user successfully downloads or copies a QR.
    It creates a summary label based on the QR type, generates an ID, and prepends
    it to the recent array. We cap the array at 20 items.
  */
  const handleSaveToRecent = useCallback((config) => {
    setRecentCodes(prev => {
      // Don't save if there's no actual data
      if (!config.data || Object.keys(config.data).length === 0) return prev
      
      // Prevent duplicates by checking if the exact same config is already the most recent
      // (Simplified check: just stringify the data object)
      if (prev.length > 0 && JSON.stringify(prev[0].config.data) === JSON.stringify(config.data)) {
        return prev
      }

      // Generate a human-readable label
      let label = 'Untitled'
      if (config.type === QR_TYPES.URL) label = config.data.url
      if (config.type === QR_TYPES.TEXT) label = config.data.text?.substring(0, 30) + '...'
      if (config.type === QR_TYPES.EMAIL) label = config.data.email
      if (config.type === QR_TYPES.PHONE) label = config.data.phone
      if (config.type === QR_TYPES.WIFI) label = config.data.ssid

      const newItem = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        type: config.type,
        label: label || 'QR Code',
        config: config
      }

      // Prepend to array, keeping only the 20 most recent
      return [newItem, ...prev].slice(0, 20)
    })
  }, [setRecentCodes])

  const handleDeleteRecent = (id) => {
    setRecentCodes(prev => prev.filter(item => item.id !== id))
  }

  const handleClearRecent = () => {
    setRecentCodes([])
  }

  const handleReuse = (config) => {
    setEditorInitialConfig(config)
    setCurrentPage('editor')
  }

  return (
    <div className="app">
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      
      <main className="app-main">
        {/* 
          CONDITIONAL RENDERING
          ---------------------
          This is how React decides what to display based on state.
          When currentPage is 'landing', it renders LandingPage.
          When it changes to 'editor', it will render the Editor.
          
          The ternary operator (condition ? A : B) is the most common
          pattern for this in React.
        */}
        {currentPage === 'landing' && (
          <LandingPage onGetStarted={() => setCurrentPage('editor')} />
        )}
        
        {currentPage === 'editor' && (
          <Editor 
            initialConfig={editorInitialConfig} 
            onSaveToRecent={handleSaveToRecent}
          />
        )}
        
        {currentPage === 'recent' && (
          <RecentQRCodes 
            recentCodes={recentCodes}
            onReuse={handleReuse}
            onDelete={handleDeleteRecent}
            onClearAll={handleClearRecent}
          />
        )}
      </main>
    </div>
  )
}

export default App
