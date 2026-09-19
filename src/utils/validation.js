import { QR_TYPES } from '../data/constants'

/*
  VALIDATION UTILITIES
  ====================
  
  Pure functions for validating user input.
  Separating validation logic from UI components makes it:
  1. Reusable (we can use the same logic in the AI Content Assistant)
  2. Testable (pure functions are easy to unit test)
  
  Each function returns an error string if invalid, or null if valid.
*/

// Basic URL validation
export const validateUrl = (url) => {
  if (!url) return 'URL is required'
  try {
    new URL(url)
    return null
  } catch (e) {
    // If it doesn't have a protocol, try adding https:// and test again
    // We allow users to just type "example.com"
    try {
      new URL(`https://${url}`)
      return null
    } catch (e2) {
      return 'Please enter a valid URL'
    }
  }
}

export const validateText = (text) => {
  if (!text || text.trim().length === 0) return 'Text is required'
  // QR codes have a max capacity. ~3000 chars for alphanumeric.
  if (text.length > 2000) return 'Text is too long for a reliable QR code'
  return null
}

// Basic email format validation
export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  // Simple regex for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

// Basic phone number validation (allows +, -, spaces, parentheses)
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required'
  const phoneRegex = /^[\d\s\+\-\(\)]+$/
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 3) {
    return 'Please enter a valid phone number'
  }
  return null
}

export const validateWifi = (data) => {
  if (!data.ssid || data.ssid.trim() === '') return 'Network name (SSID) is required'
  
  // WEP and WPA require passwords
  if ((data.security === 'WEP' || data.security === 'WPA') && !data.password) {
    return 'Password is required for secured networks'
  }
  
  return null
}

/*
  Main validation router.
  Takes a QR type and its data, returns an object of errors.
  If empty object {}, the data is valid.
*/
export const validateQrData = (type, data) => {
  const errors = {}

  switch (type) {
    case QR_TYPES.URL: {
      const err = validateUrl(data.url)
      if (err) errors.url = err
      break
    }
    case QR_TYPES.TEXT: {
      const err = validateText(data.text)
      if (err) errors.text = err
      break
    }
    case QR_TYPES.EMAIL: {
      const err = validateEmail(data.email)
      if (err) errors.email = err
      break
    }
    case QR_TYPES.PHONE: {
      const err = validatePhone(data.phone)
      if (err) errors.phone = err
      break
    }
    case QR_TYPES.WIFI: {
      const err = validateWifi(data)
      // For Wi-Fi, we attach the error to the field that caused it
      if (err) {
        if (err.includes('SSID')) errors.ssid = err
        else if (err.includes('Password')) errors.password = err
        else errors.general = err
      }
      break
    }
  }

  return errors
}
