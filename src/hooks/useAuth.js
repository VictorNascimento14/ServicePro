// Custom hook for authentication
// Uncomment when Clerk is configured

// import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react'

export function useAuth() {
  // Uncomment when Clerk is configured:
  // const { user, isLoaded } = useUser()
  // const { signOut } = useClerkAuth()
  
  // return {
  //   user,
  //   isLoaded,
  //   isAuthenticated: !!user,
  //   signOut,
  // }

  // Temporary mock for development
  return {
    user: null,
    isLoaded: true,
    isAuthenticated: false,
    signOut: () => {},
  }
}


