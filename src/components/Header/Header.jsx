import { QrCode } from 'lucide-react'
import './Header.css'

/*
  HEADER COMPONENT
  ================
  
  WHAT IT DOES:
  The persistent top navigation bar for QR Studio.
  Shows the brand logo/name and navigation links.
  
  PROPS EXPLAINED:
  ----------------
  - currentPage: string — which page is currently active ('landing' or 'editor')
    Used to highlight the active navigation item.
  
  - onNavigate: function — called when user clicks a nav link.
    This is a pattern called "lifting state up." The Header doesn't
    own the page state — App.jsx does. So Header receives a function
    from App to call when navigation happens.
    
    WHY? Because if Header owned the state, App wouldn't know which
    page to render. State should live in the nearest common ancestor
    of all components that need it.
  
  COMPONENT STRUCTURE:
  --------------------
  <header>
    <logo section>        — brand identity
    <nav links>           — page navigation (visible on desktop)
    <action buttons>      — "Get Started" CTA
  </header>
*/
function Header({ currentPage, onNavigate }) {
  // Navigation items — defined as data so we can map over them
  // This avoids repeating the same JSX structure for each link
  const navItems = [
    { id: 'editor', label: 'Create' },
    { id: 'recent', label: 'Recent' },
    { id: 'presets', label: 'Presets' },
    { id: 'learn', label: 'Learn' },
  ]

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        {/* 
          LOGO SECTION
          The logo doubles as a "home" button. Clicking it returns
          to the landing page. This is a standard UX convention.
        */}
        <button 
          className="header-logo" 
          onClick={() => onNavigate('landing')}
          aria-label="QR Studio — Go to home page"
        >
          <QrCode size={24} strokeWidth={2} />
          <span className="header-logo-text">QR Studio</span>
        </button>

        {/* 
          NAVIGATION
          role="navigation" and aria-label help screen readers
          understand this is the main site navigation.
        */}
        <nav className="header-nav" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`header-nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA — Primary call to action */}
        <div className="header-actions">
          {currentPage === 'landing' && (
            <button 
              className="header-cta"
              onClick={() => onNavigate('editor')}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
