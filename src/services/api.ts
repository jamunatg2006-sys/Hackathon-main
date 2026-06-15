// API base URL - uses Vite proxy in development
export const API_BASE = '';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch {
    return false;
  }
}
