import { QrCode, Type, Mail, Phone, Wifi, ArrowRight, Sparkles, Palette, Globe } from 'lucide-react'
import './LandingPage.css'

/*
  LANDING PAGE COMPONENT
  ======================
  
  WHAT IT DOES:
  The first thing users see when they visit QR Studio.
  Its job is to:
  1. Clearly communicate what QR Studio does
  2. Make a strong first visual impression
  3. Encourage the user to start creating
  
  PROPS:
  - onGetStarted: function — called when user clicks the CTA button.
    This navigates them to the editor view.
  
  DESIGN DECISIONS:
  -----------------
  1. The hero section uses a large heading + short description + CTA.
     This is a standard "hero pattern" — proven to be effective for
     tool landing pages.
  
  2. Feature highlights are shown as small cards with icons.
     They answer the user's immediate questions:
     "What can this tool do?" and "Why should I use it?"
  
  3. A small QR code preview gives visual context — the user 
     immediately understands this is about QR codes.
  
  4. The page is intentionally minimal. We don't need to explain
     every feature on the landing page. The editor does that.
*/
function LandingPage({ onGetStarted }) {
  // Feature cards data — defined separately for clean JSX
  const features = [
    {
      icon: <Globe size={20} />,
      title: 'Multiple QR Types',
      description: 'URL, Text, Email, Phone, Wi-Fi',
    },
    {
      icon: <Palette size={20} />,
      title: 'Customize Freely',
      description: 'Colors, Size, Styles & more',
    },
    {
      icon: <Sparkles size={20} />,
      title: 'AI Assistant',
      description: 'Smarter. Faster. Better.',
    },
    {
      icon: <Wifi size={20} />,
      title: 'Works Offline',
      description: 'All in your browser',
    },
  ]

  return (
    <div className="landing">
      {/* --- Hero Section --- */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-tagline">Your ideas, one scan away</p>
          
          <h1 className="landing-title">
            QR Studio
          </h1>
          
          <p className="landing-subtitle">
            Create. Customize. Scan.
          </p>
          
          <p className="landing-description">
            A simple, powerful, and smart QR code generator for 
            everything you care about.
          </p>

          <button 
            className="landing-cta" 
            onClick={onGetStarted}
            aria-label="Start creating QR codes"
          >
            Start Creating
            <ArrowRight size={18} />
          </button>
        </div>

        {/* 
          HERO VISUAL
          A decorative preview that hints at the QR editor.
          Uses a simple arrangement of QR type icons to create
          visual interest without needing an actual image.
        */}
        <div className="landing-hero-visual">
          <div className="landing-preview-card">
            <div className="landing-preview-badge">
              <span>Small codes.</span>
              <span>Big possibilities.</span>
            </div>
            <div className="landing-preview-qr">
              <QrCode size={160} strokeWidth={1} />
            </div>
            <div className="landing-preview-types">
              <span className="landing-type-chip"><Globe size={14} /> URL</span>
              <span className="landing-type-chip"><Type size={14} /> Text</span>
              <span className="landing-type-chip"><Mail size={14} /> Email</span>
              <span className="landing-type-chip"><Phone size={14} /> Phone</span>
              <span className="landing-type-chip"><Wifi size={14} /> Wi-Fi</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="landing-features" aria-label="Features">
        {features.map((feature, index) => (
          <div className="landing-feature-card" key={index}>
            <div className="landing-feature-icon">
              {feature.icon}
            </div>
            <h3 className="landing-feature-title">{feature.title}</h3>
            <p className="landing-feature-desc">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default LandingPage
