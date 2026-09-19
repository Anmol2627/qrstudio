import { Globe, Type, Mail, Phone, Wifi } from 'lucide-react'
import { QR_TYPES, QR_TYPE_LABELS } from '../../data/constants'
import './QRTypeSelector.css'

/*
  QR TYPE SELECTOR COMPONENT
  ==========================
  
  WHAT IT DOES:
  A vertical list of QR code types (URL, Text, Email, Phone, Wi-Fi).
  Clicking one tells the Editor to switch to that type.
  
  PROPS:
  - selectedType: string — the currently active QR type (e.g., 'url')
  - onTypeSelect: function — called with the new type when user clicks
  
  DESIGN PATTERN: Data-Driven Rendering
  --------------------------------------
  Instead of writing five separate <button> blocks, we define an array
  of type data and use .map() to render them. This is:
  1. DRY (Don't Repeat Yourself) — add a new type by adding one object
  2. Consistent — every type button has identical structure
  3. Maintainable — change the button layout in one place
  
  WHY does each item need a `key` prop?
  React uses keys to efficiently update lists. Without a key, React
  would re-render the entire list when one item changes. With a unique
  key, React knows exactly which item changed and only updates that one.
*/
function QRTypeSelector({ selectedType, onTypeSelect }) {
  // Each type gets an icon from lucide-react and a description
  const types = [
    { 
      id: QR_TYPES.URL, 
      icon: <Globe size={18} />,
      description: 'Website links',
    },
    { 
      id: QR_TYPES.TEXT, 
      icon: <Type size={18} />,
      description: 'Plain text content',
    },
    { 
      id: QR_TYPES.EMAIL, 
      icon: <Mail size={18} />,
      description: 'Email addresses',
    },
    { 
      id: QR_TYPES.PHONE, 
      icon: <Phone size={18} />,
      description: 'Phone numbers',
    },
    { 
      id: QR_TYPES.WIFI, 
      icon: <Wifi size={18} />,
      description: 'Wi-Fi networks',
    },
  ]

  return (
    <nav className="qr-type-selector" aria-label="QR code type">
      <h2 className="qr-type-selector-title">QR Type</h2>
      <ul className="qr-type-list" role="list">
        {types.map((type) => (
          <li key={type.id}>
            <button
              className={`qr-type-item ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => onTypeSelect(type.id)}
              aria-current={selectedType === type.id ? 'true' : undefined}
              aria-label={`Create ${QR_TYPE_LABELS[type.id]} QR code`}
            >
              <span className="qr-type-icon">{type.icon}</span>
              <span className="qr-type-info">
                <span className="qr-type-label">{QR_TYPE_LABELS[type.id]}</span>
                <span className="qr-type-desc">{type.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default QRTypeSelector
