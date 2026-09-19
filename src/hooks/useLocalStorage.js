import { useState, useEffect } from 'react'

/*
  CUSTOM HOOK: useLocalStorage
  ============================
  
  WHAT IT DOES:
  Works exactly like React's `useState`, but it also automatically
  saves the value to the browser's LocalStorage. When the component
  first loads, it initializes from LocalStorage if data exists.
  
  WHY A CUSTOM HOOK?
  ------------------
  Hooks allow us to extract stateful logic and reuse it across multiple
  components. Instead of writing localStorage.getItem and setItem in
  every component, we just do:
  
  const [data, setData] = useLocalStorage('my-key', defaultValue)
  
  ERROR HANDLING:
  LocalStorage can fail (e.g., storage full, private browsing mode,
  or corrupted JSON data). The try/catch blocks ensure the app
  doesn't crash; it just gracefully falls back to the default value.
*/
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error (e.g. corrupted JSON), return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the quota exceeded error,
      // but for this app, simply catching it prevents a crash.
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
