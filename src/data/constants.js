/* ===================================================================
   QR STUDIO — Application Constants
   ===================================================================
   
   WHY a constants file?
   ---------------------
   Constants are values that never change during the application's
   lifetime. Putting them in one file means:
   1. No "magic numbers" or "magic strings" scattered in components
   2. Easy to find and update values
   3. Multiple components can share the same constant
   4. Better readability — `QR_TYPES.URL` is clearer than `'url'`
   
   NAMING CONVENTION
   -----------------
   UPPER_SNAKE_CASE for constants is a common JavaScript convention.
   It visually distinguishes constants from regular variables.
   =================================================================== */

// The five QR types our app supports
export const QR_TYPES = {
  URL: 'url',
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  WIFI: 'wifi',
}

// Human-readable labels for each QR type
export const QR_TYPE_LABELS = {
  [QR_TYPES.URL]: 'URL',
  [QR_TYPES.TEXT]: 'Text',
  [QR_TYPES.EMAIL]: 'Email',
  [QR_TYPES.PHONE]: 'Phone',
  [QR_TYPES.WIFI]: 'Wi-Fi',
}

// Error correction levels determine how much damage a QR code can
// sustain and still be readable. Higher = more redundancy = more reliable.
// But higher levels also make the QR code denser (more modules).
export const ERROR_CORRECTION_LEVELS = {
  L: { value: 'L', label: 'L (Low)', description: '~7% recovery', recoveryPercent: 7 },
  M: { value: 'M', label: 'M (Medium)', description: '~15% recovery', recoveryPercent: 15 },
  Q: { value: 'Q', label: 'Q (Quartile)', description: '~25% recovery', recoveryPercent: 25 },
  H: { value: 'H', label: 'H (High)', description: '~30% recovery', recoveryPercent: 30 },
}

// Wi-Fi security types
export const WIFI_SECURITY_TYPES = {
  WPA: 'WPA',
  WEP: 'WEP',
  NONE: 'nopass',
}

// Default QR configuration — the starting state for a new QR code
export const DEFAULT_QR_CONFIG = {
  type: QR_TYPES.URL,
  data: {},          // Type-specific data (url, email, ssid, etc.)
  size: 300,         // Width/height in pixels
  foregroundColor: '#1B4332',   // Dark green — our brand color
  backgroundColor: '#FFFFFF',   // White background for best scan reliability
  errorCorrection: 'H',        // High — best scan reliability by default
  margin: 4,                    // Quiet zone modules around the QR
}

// Size constraints
export const QR_SIZE_MIN = 100
export const QR_SIZE_MAX = 1000

// Margin constraints (in QR modules, not pixels)
export const QR_MARGIN_MIN = 0
export const QR_MARGIN_MAX = 10

// LocalStorage keys
export const STORAGE_KEYS = {
  RECENT_QR_CODES: 'qrstudio_recent_codes',
  THEME: 'qrstudio_theme',
}

// Maximum number of recent QR codes to store
export const MAX_RECENT_CODES = 20
