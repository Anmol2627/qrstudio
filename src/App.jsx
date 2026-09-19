import { useState } from 'react'
import Header from './components/Header/Header'
import LandingPage from './components/LandingPage/LandingPage'
import Editor from './components/Editor/Editor'
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
  // currentPage tracks which view is active: 'landing' or 'editor'
  const [currentPage, setCurrentPage] = useState('landing')

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
        {currentPage === 'landing' ? (
          <LandingPage onGetStarted={() => setCurrentPage('editor')} />
        ) : (
          <Editor />
        )}
      </main>
    </div>
  )
}

export default App
