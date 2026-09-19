import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { QR_TYPES } from '../../data/constants'
import { validateQrData } from '../../utils/validation'
import './QRForm.css'

/*
  QR FORM COMPONENT
  =================
  
  WHAT IT DOES:
  Renders the appropriate input fields based on the selected QR type.
  - URL type → shows a URL input
  - Email type → shows email, subject, body inputs
  - Phone type → shows a phone number input
  - Wi-Fi type → shows SSID, password, security type inputs
  - Text type → shows a textarea
  
  PROPS:
  - type: string — the active QR type (e.g., 'url')
  - data: object — the current form data for this type
  - onDataChange: function — called with partial updates to form data
  
  CONTROLLED COMPONENTS
  ---------------------
  Every input field is a "controlled component" — its value comes from
  React state (via the `data` prop), and changes are sent back up via
  `onDataChange`.
  
  Why controlled?
  1. React is always the single source of truth for the input value.
  2. We can validate, transform, or prevent changes before they happen.
  3. The value is always accessible without querying the DOM.
  
  The alternative is "uncontrolled components" where the DOM owns the
  value and you read it with refs. Controlled is preferred in most cases.
  
  WHY renderForm() INSTEAD OF SEPARATE COMPONENTS?
  -------------------------------------------------
  Each form is relatively simple (a few inputs). Creating 5 separate
  component files would add file management overhead without much benefit.
  If a form grows complex (e.g., Wi-Fi with many options), we can
  extract it into its own component later.
*/
function QRForm({ type, data, onDataChange }) {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Run validation whenever data or type changes
  useEffect(() => {
    const currentErrors = validateQrData(type, data)
    setErrors(currentErrors)
  }, [type, data])

  // Reset touched state when type changes
  useEffect(() => {
    setTouched({})
  }, [type])

  // Helper: creates an onChange handler for a specific field
  const handleChange = (field) => (e) => {
    onDataChange({ [field]: e.target.value })
  }

  // Helper: creates an onBlur handler to mark a field as touched
  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // Helper: safely renders an error message if the field is touched and invalid
  const renderError = (field) => {
    if (touched[field] && errors[field]) {
      return (
        <div className="form-error">
          <AlertCircle size={14} />
          <span>{errors[field]}</span>
        </div>
      )
    }
    return null
  }

  // Renders the form fields for the current QR type
  const renderForm = () => {
    switch (type) {
      case QR_TYPES.URL:
        return (
          <div className="form-section">
            <h2 className="form-title">Website URL</h2>
            <p className="form-description">Enter a URL to create your QR code.</p>
            <div className="form-group">
              <label htmlFor="qr-url" className="form-label">URL</label>
              <input
                id="qr-url"
                type="url"
                className={`form-input ${touched.url && errors.url ? 'error' : ''}`}
                placeholder="https://example.com"
                value={data.url || ''}
                onChange={handleChange('url')}
                onBlur={handleBlur('url')}
                autoComplete="url"
              />
              {renderError('url')}
            </div>
          </div>
        )

      case QR_TYPES.TEXT:
        return (
          <div className="form-section">
            <h2 className="form-title">Plain Text</h2>
            <p className="form-description">Enter any text content for your QR code.</p>
            <div className="form-group">
              <label htmlFor="qr-text" className="form-label">Text</label>
              <textarea
                id="qr-text"
                className={`form-input form-textarea ${touched.text && errors.text ? 'error' : ''}`}
                placeholder="Enter your text here..."
                value={data.text || ''}
                onChange={handleChange('text')}
                onBlur={handleBlur('text')}
                rows={4}
              />
              {renderError('text')}
            </div>
          </div>
        )

      case QR_TYPES.EMAIL:
        return (
          <div className="form-section">
            <h2 className="form-title">Email</h2>
            <p className="form-description">Create a QR code that opens an email composer.</p>
            <div className="form-group">
              <label htmlFor="qr-email" className="form-label">Email Address</label>
              <input
                id="qr-email"
                type="email"
                className={`form-input ${touched.email && errors.email ? 'error' : ''}`}
                placeholder="hello@example.com"
                value={data.email || ''}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                autoComplete="email"
              />
              {renderError('email')}
            </div>
            <div className="form-group">
              <label htmlFor="qr-email-subject" className="form-label">
                Subject <span className="form-optional">(optional)</span>
              </label>
              <input
                id="qr-email-subject"
                type="text"
                className="form-input"
                placeholder="Meeting Request"
                value={data.subject || ''}
                onChange={handleChange('subject')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="qr-email-body" className="form-label">
                Body <span className="form-optional">(optional)</span>
              </label>
              <textarea
                id="qr-email-body"
                className="form-input form-textarea"
                placeholder="Hi, I would like to..."
                value={data.body || ''}
                onChange={handleChange('body')}
                rows={3}
              />
            </div>
          </div>
        )

      case QR_TYPES.PHONE:
        return (
          <div className="form-section">
            <h2 className="form-title">Phone Number</h2>
            <p className="form-description">Create a QR code that dials a phone number.</p>
            <div className="form-group">
              <label htmlFor="qr-phone" className="form-label">Phone Number</label>
              <input
                id="qr-phone"
                type="tel"
                className={`form-input ${touched.phone && errors.phone ? 'error' : ''}`}
                placeholder="+1 (555) 123-4567"
                value={data.phone || ''}
                onChange={handleChange('phone')}
                onBlur={handleBlur('phone')}
                autoComplete="tel"
              />
              {renderError('phone')}
            </div>
          </div>
        )

      case QR_TYPES.WIFI:
        return (
          <div className="form-section">
            <h2 className="form-title">Wi-Fi Network</h2>
            <p className="form-description">
              Enter your Wi-Fi details to generate a QR code.
            </p>
            <div className="form-group">
              <label htmlFor="qr-wifi-ssid" className="form-label">Network Name (SSID)</label>
              <input
                id="qr-wifi-ssid"
                type="text"
                className={`form-input ${touched.ssid && errors.ssid ? 'error' : ''}`}
                placeholder="MyNetwork"
                value={data.ssid || ''}
                onChange={handleChange('ssid')}
                onBlur={handleBlur('ssid')}
              />
              {renderError('ssid')}
            </div>
            <div className="form-group">
              <label htmlFor="qr-wifi-password" className="form-label">Password</label>
              <input
                id="qr-wifi-password"
                type="password"
                className={`form-input ${touched.password && errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={data.password || ''}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              {renderError('password')}
            </div>
            <div className="form-group">
              <label htmlFor="qr-wifi-security" className="form-label">Security Type</label>
              <select
                id="qr-wifi-security"
                className="form-input form-select"
                value={data.security || 'WPA'}
                onChange={handleChange('security')}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
            <p className="form-hint">
              This will create a QR code that lets others connect to your 
              Wi-Fi without typing the password.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="qr-form">
      {renderForm()}
    </div>
  )
}

export default QRForm
