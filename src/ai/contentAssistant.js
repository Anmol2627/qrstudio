import { QR_TYPES } from '../data/constants'

/*
  SMART CONTENT ASSISTANT — Heuristic NLP Engine
*/

export const parseNaturalLanguageInput = (input) => {
  if (!input || input.trim() === '') return null

  const text = input.trim()
  const lowerText = text.toLowerCase()

  // 1. Entity Extraction (Regex)
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
  
  // URL matching (very basic, looks for http, https, www, or domain extensions)
  const urlMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|me|dev)[^\s]*)/)
  
  // Phone matching (looks for +, numbers, dashes, min 7 digits)
  const phoneMatch = text.match(/(\+?[\d\s-]{7,20})/)
  
  // 2. Intent Classification & Context Parsing
  
  // Rule A: If user explicitly mentions Wi-Fi or we see SSID/Password keywords
  if (lowerText.includes('wi-fi') || lowerText.includes('wifi') || lowerText.includes('network')) {
    // Attempt to extract SSID and Password using simple natural language patterns
    // e.g., "network is MyHomeNetwork" or "ssid: MyHomeNetwork"
    let ssid = ''
    let password = ''
    
    const ssidMatch = text.match(/(?:ssid|network|named)[\s:]+(['"]?)([^'"\s,]+)\1/i)
    if (ssidMatch) ssid = ssidMatch[2]
      
    const passMatch = text.match(/(?:password|pass)[\s:]+(['"]?)([^'"\s,]+)\1/i)
    if (passMatch) password = passMatch[2]
      
    return {
      type: QR_TYPES.WIFI,
      data: {
        ssid: ssid || '',
        password: password || '',
        security: password ? 'WPA' : 'nopass'
      },
      confidence: 0.8
    }
  }
  
  // Rule B: If we found an email
  if (emailMatch) {
    const email = emailMatch[1]
    let subject = ''
    
    // Look for "subject [is/:/for] something"
    const subjectMatch = text.match(/(?:subject|titled|about)[\s:]+(['"]?)([^'"\.,]+)\1/i)
    if (subjectMatch) subject = subjectMatch[2].trim()
      
    return {
      type: QR_TYPES.EMAIL,
      data: {
        email,
        subject,
        body: ''
      },
      confidence: 0.9
    }
  }
  
  // Rule C: If we found a URL
  if (urlMatch) {
    let url = urlMatch[1]
    // Ensure protocol
    if (!url.startsWith('http')) {
      url = `https://${url}`
    }
    
    return {
      type: QR_TYPES.URL,
      data: { url },
      confidence: 0.9
    }
  }
  
  // Rule D: If we found a phone number (and it's not just a string of numbers inside a URL)
  if (phoneMatch && !urlMatch) {
    const phone = phoneMatch[1].trim()
    // Make sure it actually has digits, not just dashes
    if (phone.replace(/\D/g, '').length >= 7) {
      return {
        type: QR_TYPES.PHONE,
        data: { phone },
        confidence: 0.8
      }
    }
  }
  
  // Fallback: If no structured entities are found, treat it as plain text
  return {
    type: QR_TYPES.TEXT,
    data: { text },
    confidence: 1.0 // It's definitely text, but maybe not what they wanted
  }
}
