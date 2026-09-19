import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/*
  WHY StrictMode?
  ---------------
  React.StrictMode is a development-only wrapper that helps catch
  common mistakes. It intentionally double-invokes certain functions
  (like component render and useEffect) to surface bugs related to
  impure rendering or missing cleanup.

  It does NOT affect the production build at all — zero performance cost.
  
  WHY createRoot?
  ---------------
  createRoot is the React 18+ API for mounting your app. The older
  ReactDOM.render() still works but doesn't enable concurrent features.
  createRoot mounts our <App /> into the <div id="root"> in index.html.
*/
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
