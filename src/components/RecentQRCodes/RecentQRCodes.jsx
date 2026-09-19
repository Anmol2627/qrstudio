import { Clock, Trash2, Edit2, ExternalLink } from 'lucide-react'
import { QR_TYPE_LABELS } from '../../data/constants'
import './RecentQRCodes.css'

/*
  RECENT QR CODES COMPONENT
  =========================
  
  WHAT IT DOES:
  Displays a list of previously saved QR code configurations.
  Allows the user to reuse (load into editor) or delete them.
  
  PROPS:
  - recentCodes: array — the list of saved items from LocalStorage
  - onReuse: function — called with the config object when "Reuse" is clicked
  - onDelete: function — called with the item's ID to remove it
  - onClearAll: function — called to delete all items
  
  DATA STRUCTURE:
  Each item in recentCodes looks like:
  {
    id: "1678901234",          // Timestamp or UUID
    createdAt: "2024-03-15...", // ISO date string
    type: "url",
    label: "https://example...",// A short summary for display
    config: { ... }            // The full QR configuration object
  }
*/
function RecentQRCodes({ recentCodes, onReuse, onDelete, onClearAll }) {
  
  if (!recentCodes || recentCodes.length === 0) {
    return (
      <div className="recent-empty">
        <Clock size={48} className="recent-empty-icon" />
        <h2 className="recent-empty-title">No recent QR codes</h2>
        <p className="recent-empty-desc">
          When you save a QR code in the editor, it will appear here 
          for easy access later.
        </p>
      </div>
    )
  }

  // Format date helper
  const formatDate = (isoString) => {
    const date = new Date(isoString)
    // Simple relative time approximation for learning purposes
    const diffHours = Math.floor((Date.now() - date) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  return (
    <div className="recent-container">
      <div className="recent-header">
        <div>
          <h1 className="recent-title">Recent QR Codes</h1>
          <p className="recent-subtitle">View and reuse your previously saved designs.</p>
        </div>
        <button 
          className="recent-clear-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all history?')) {
              onClearAll()
            }
          }}
        >
          Clear All
        </button>
      </div>

      <ul className="recent-list">
        {recentCodes.map((item) => (
          <li key={item.id} className="recent-card">
            <div className="recent-card-main">
              <div className="recent-card-icon">
                {/* Visual placeholder for the QR type icon */}
                <span className="recent-type-badge">{QR_TYPE_LABELS[item.type]}</span>
              </div>
              
              <div className="recent-card-info">
                <h3 className="recent-card-label" title={item.label}>
                  {item.label || 'Untitled QR'}
                </h3>
                <span className="recent-card-time">{formatDate(item.createdAt)}</span>
              </div>
            </div>

            <div className="recent-card-actions">
              <button 
                className="recent-action-btn primary"
                onClick={() => onReuse(item.config)}
                aria-label={`Reuse ${item.label}`}
              >
                <Edit2 size={16} />
                Reuse
              </button>
              <button 
                className="recent-action-btn danger"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.label}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecentQRCodes
