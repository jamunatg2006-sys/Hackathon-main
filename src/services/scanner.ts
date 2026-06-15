import type { ScanResult } from '../types';
import { hydrateScanResult } from '../utils/securityMetrics';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

// Requests a new backend scan every time so remediation verification never uses stale data.
export async function runFreshScan(target: string, verification = false): Promise<ScanResult> {
  const response = await fetch(`${API_BASE_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, verification }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Scan request failed' }));
    throw new Error(errorBody.error || 'Scan request failed');
  }

  return hydrateScanResult(await response.json());
}
