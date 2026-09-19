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

// TODO: Implement other endpoints (content, theme, reliability) as we build them on the backend.
