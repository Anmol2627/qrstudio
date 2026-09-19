import { DEFAULT_QR_CONFIG } from './constants'

/*
  QR PRESETS
  ==========
  
  Predefined visual styles that users can apply with one click.
  Each preset is just a partial configuration object that gets
  merged into the active QR config.
  
  By storing these here rather than hardcoding them in the UI component,
  we separate DATA from PRESENTATION. The UI component just loops
  over this array to render the buttons.
*/

export const PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean & default',
    config: {
      foregroundColor: '#1B4332',
      backgroundColor: '#FFFFFF',
      errorCorrection: 'H',
      margin: 4,
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'High contrast',
    config: {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      errorCorrection: 'H',
      margin: 4,
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'White on dark',
    config: {
      foregroundColor: '#FFFFFF',
      backgroundColor: '#2D2D2D',
      errorCorrection: 'H',
      margin: 4,
    }
  },
  {
    id: 'colorful',
    name: 'Ocean',
    description: 'Blue aesthetic',
    config: {
      foregroundColor: '#023E8A',
      backgroundColor: '#CAF0F8',
      errorCorrection: 'Q',
      margin: 4,
    }
  },
  {
    id: 'warm',
    name: 'Sunset',
    description: 'Warm aesthetic',
    config: {
      foregroundColor: '#780000',
      backgroundColor: '#FDF0D5',
      errorCorrection: 'Q',
      margin: 4,
    }
  },
]
