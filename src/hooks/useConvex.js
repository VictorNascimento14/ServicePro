// Custom hook for Convex queries
// Uncomment when Convex is configured

// import { useQuery, useMutation } from 'convex/react'
// import { api } from '../../convex/_generated/api'

export function useConvexQuery(queryName, args) {
  // Uncomment when Convex is configured:
  // return useQuery(api[queryName], args)
  
  // Temporary mock for development
  return undefined
}

export function useConvexMutation(mutationName) {
  // Uncomment when Convex is configured:
  // return useMutation(api[mutationName])
  
  // Temporary mock for development
  return () => Promise.resolve()
}



