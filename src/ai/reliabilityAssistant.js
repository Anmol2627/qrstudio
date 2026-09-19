/*
  RELIABILITY ASSISTANT — Scoring Engine
  ======================================
  
  WHAT IT DOES:
  Evaluates the current QR configuration to ensure it will scan properly
  in the real world. QR codes can fail if:
  1. Contrast is too low (e.g. gray on gray)
  2. Foreground is lighter than background (inverted — some scanners fail)
  3. Size is too small for dense data
  
  HOW IT WORKS:
  Uses the WCAG relative luminance formula to calculate contrast ratio.
*/

// Helper: Convert hex to RGB
const hexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Helper: Calculate relative luminance (WCAG formula)
const getLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Calculate contrast ratio between two hex colors
export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 1 // Safe fallback

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lightest = Math.max(l1, l2)
  const darkest = Math.min(l1, l2)

  return (lightest + 0.05) / (darkest + 0.05)
}

/*
  evaluateReliability
  Returns an array of warnings (if any). If empty, the QR is perfect.
*/
export const evaluateReliability = (config) => {
  const warnings = []

  // 1. Contrast Check
  const contrast = getContrastRatio(config.foregroundColor, config.backgroundColor)
  
  // 2. Inversion Check
  const rgbFg = hexToRgb(config.foregroundColor)
  const rgbBg = hexToRgb(config.backgroundColor)
  
  let isInverted = false
  if (rgbFg && rgbBg) {
    const lFg = getLuminance(rgbFg.r, rgbFg.g, rgbFg.b)
    const lBg = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b)
    isInverted = lFg > lBg
  }

  // A standard QR code requires a contrast ratio of at least 4:1
  // though 3:1 is acceptable for very large QR codes.
  if (contrast < 3) {
    warnings.push({
      level: 'critical',
      message: 'Contrast is too low. The QR code may not scan.',
      fix: { foregroundColor: '#000000', backgroundColor: '#FFFFFF' }
    })
  } else if (isInverted) {
    warnings.push({
      level: 'warning',
      message: 'Background is darker than foreground. Some older scanners cannot read inverted QR codes.',
      fix: { 
        foregroundColor: config.backgroundColor, 
        backgroundColor: config.foregroundColor 
      }
    })
  }

  // 3. Size Check
  if (config.size < 150) {
    warnings.push({
      level: 'warning',
      message: 'Size is very small. It might be hard to print or scan.',
      fix: { size: 250 }
    })
  }

  // 4. Margin Check
  if (config.margin < 2) {
    warnings.push({
      level: 'warning',
      message: 'Margin is very small. Scanners need a quiet zone around the code.',
      fix: { margin: 4 }
    })
  }

  return warnings
}
