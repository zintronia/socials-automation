import { fetchBaseQuery } from "@reduxjs/toolkit/query";

// Create a base query that will be enhanced with the auth token
export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  credentials: 'include', // Important for cookies
  prepareHeaders: async (headers) => {
    // Clerk will automatically handle the auth token via cookies
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});