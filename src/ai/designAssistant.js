import { PRESETS } from '../data/presets'

/*
  DESIGN ASSISTANT — Heuristic Engine
*/

export const parseDesignIntent = (input) => {
  if (!input || input.trim() === '') return null

  const lowerText = input.trim().toLowerCase()
  
  // Keyword mapping to preset IDs
  const keywordMap = {
    'dark': 'dark',
    'black': 'dark',
    'night': 'dark',
    
    'minimal': 'minimal',
    'clean': 'minimal',
    'simple': 'minimal',
    'light': 'minimal',
    
    'professional': 'professional',
    'corporate': 'professional',
    'business': 'professional',
    'classic': 'professional',
    
    'blue': 'colorful',
    'ocean': 'colorful',
    'water': 'colorful',
    'colorful': 'colorful',
    
    'red': 'warm',
    'warm': 'warm',
    'sunset': 'warm',
    'orange': 'warm',
    'fire': 'warm'
  }

  // Tokenize the input into words
  const words = lowerText.match(/\b(\w+)\b/g) || []

  // Check if any word matches our keywords
  for (const word of words) {
    if (keywordMap[word]) {
      const presetId = keywordMap[word]
      const matchingPreset = PRESETS.find(p => p.id === presetId)
      if (matchingPreset) {
        return {
          preset: matchingPreset,
          confidence: 0.8
        }
      }
    }
  }

  // If they mention hex colors explicitly (e.g. #FF0000)
  const hexMatch = lowerText.match(/(#[0-9a-f]{6}|#[0-9a-f]{3})/i)
  if (hexMatch) {
    return {
      customConfig: {
        foregroundColor: hexMatch[1].toUpperCase(),
      },
      confidence: 0.9
    }
  }

  return null
}
