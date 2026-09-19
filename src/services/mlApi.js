/**
 * QR Studio AI/ML API Service
 * 
 * Centralized service for communicating with the FastAPI backend.
 * Contains gracefully degrading fallbacks if the backend is offline.
 */

const API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000/api'

// Helper function to handle fetch with timeout and error checking
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return await response.json()
  } finally {
    clearTimeout(id)
  }
}

/**
 * Check if the ML Backend is available.
 */
export const checkHealth = async () => {
  try {
    return await fetchWithTimeout(`${API_URL}/health`, {}, 2000)
  } catch (error) {
    console.warn("ML Backend is currently unavailable.", error)
    return { status: "offline" }
  }
}

/**
 * Predict content intent and extract entities using the NLP model.
 */
export const classifyContent = async (text) => {
  try {
    return await fetchWithTimeout(`${API_URL}/ai/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
  } catch (error) {
    console.warn("ML Content analysis failed. Falling back to heuristics.", error)
    return null
  }
}

/**
 * Generate a ThemeSpec from a natural language prompt.
 */
export const generateTheme = async (prompt) => {
  try {
    return await fetchWithTimeout(`${API_URL}/ai/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })
  } catch (error) {
    console.warn("ML Theme generation failed. Falling back to heuristics.", error)
    return null
  }
}

// TODO: Implement other endpoints (reliability) as we build them on the backend.
