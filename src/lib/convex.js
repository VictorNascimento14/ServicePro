// Convex configuration
// Run: npx convex dev
// This will automatically set VITE_CONVEX_URL in your .env file

import { ConvexReactClient } from "convex/react";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

// Uncomment when Convex is configured
// if (!CONVEX_URL) {
//   throw new Error("Missing Convex URL. Please run: npx convex dev");
// }

// const convex = new ConvexReactClient(CONVEX_URL);
// export default convex;

// Usage in components:
// import { useQuery, useMutation } from "convex/react";
// import { api } from "../convex/_generated/api";
// import convex from "../lib/convex";
// 
// const data = useQuery(api.myFunction);
// const mutation = useMutation(api.myMutation);

