import { useState } from 'react'
import { QrCode, Menu, X } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navigation items — defined as data so we can map over them
  // This avoids repeating the same JSX structure for each link
  const navItems = [
    { id: 'editor', label: 'Create' },
    { id: 'recent', label: 'Recent' },
    { id: 'presets', label: 'Presets' },
    { id: 'learn', label: 'Learn' },
  ]

  const handleNavClick = (id) => {
    onNavigate(id)
    setMobileMenuOpen(false) // Close mobile menu after navigating
  }

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
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA — Primary call to action (Desktop) */}
        <div className="header-actions">
          {currentPage === 'landing' && (
            <button 
              className="header-cta desktop-only"
              onClick={() => handleNavClick('editor')}
            >
              Get Started
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay">
          <nav className="mobile-nav-list">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
            {currentPage === 'landing' && (
              <button 
                className="mobile-nav-cta"
                onClick={() => handleNavClick('editor')}
              >
                Get Started
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
