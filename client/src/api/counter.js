import { api } from '../boot/axios';

export async function fetchCounter() {
  try {
    const response = await api.get('/api/count');
    return { count: response.data.count, message: response.data.message }; // Ensure both are returned
  } catch (error) {
    console.error('Error fetching counter:', error);
    throw error;
  }
}

// client/src/api/counter.ts
