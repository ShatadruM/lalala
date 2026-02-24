import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. The Sync Function: Talks to your Node Backend
  const fetchUserStatus = async (token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      // Connect to your new backend endpoint
      const response = await fetch(`${apiUrl}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Pass the JWT
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Backend failed to verify user')
      }

      const data = await response.json()
      
      // Update state with the clean data from the server
      setUser(data.user)
      setProfile(data.profile) // This handles nulls automatically
      
    } catch (error) {
      console.error("Backend Sync Error:", error.message)
      // Optional: You could set an error state here to show a "Server Down" message
    }
  }

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // 2. Get the Session from Supabase Auth (Local)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error;

        if (session?.access_token) {
          // 3. If we have a token, ask the backend "Who is this?"
          await fetchUserStatus(session.access_token)
        }
      } catch (err) {
        console.error("Auth Init Failed:", err)
      } finally {
        // 🚨 THE FIX: Check if Supabase is currently processing an OAuth redirect in the URL
        const isRedirecting = window.location.hash.includes('access_token=') || window.location.hash.includes('error=');
        
        // Only stop loading if we are NOT waiting for the URL to be parsed
        if (mounted && !isRedirecting) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // 4. Listen for real-time Login/Logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT' || !session) {
        // Clear everything instantly
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // If they just signed in from a URL redirect, keep loading true while we sync
        setLoading(true)
        
        // Re-sync with backend to ensure data is fresh
        await fetchUserStatus(session.access_token)
        
        // NOW we can safely reveal the dashboard
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    setProfile, // Exported so Register.jsx can update the UI immediately after saving
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
           {/* Simple Spinner */}
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
           <p className="text-gray-500 font-medium">Connecting to Server...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)