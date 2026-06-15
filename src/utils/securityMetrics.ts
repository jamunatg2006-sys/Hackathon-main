import type { AuditEvent, ScanResult, Severity, VerificationSummary, Vulnerability, VulnerabilityVerification } from '../types';
import { mockVulnerabilities } from '../data/mockData';

const severityWeights: Record<Severity, number> = {
  critical: 22,
  high: 14,
  medium: 8,
  low: 4,
};

// Keeps live scanner evidence while reusing the richer remediation guidance already shown in the UI.
export function hydrateScanResult(scan: ScanResult): ScanResult {
  return {
    ...scan,
    timestamp: new Date(scan.timestamp),
    vulnerabilities: scan.vulnerabilities.map((vulnerability) => {
      const template = mockVulnerabilities.find((item) => item.id === vulnerability.id);
      return template
        ? {
            ...template,
            severity: vulnerability.severity,
            cvss: vulnerability.cvss,
            affectedAsset: vulnerability.affectedAsset,
            description: vulnerability.description,
            recommendedFix: vulnerability.recommendedFix,
            aiExplanation: {
              ...template.aiExplanation,
              whatWasFound: vulnerability.aiExplanation.whatWasFound,
              riskLevel: vulnerability.aiExplanation.riskLevel,
            },
          }
        : vulnerability;
    }),
  };
}

// Scores are generated from active findings so reports and dashboards move with real scan results.
export function calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
  const penalty = vulnerabilities.reduce((total, vulnerability) => total + severityWeights[vulnerability.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function countBySeverity(vulnerabilities: Vulnerability[]): Record<Severity, number> {
  return vulnerabilities.reduce(
    (counts, vulnerability) => ({
      ...counts,
      [vulnerability.severity]: counts[vulnerability.severity] + 1,
    }),
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>
  );
}

export function compareScans(beforeScan: ScanResult, afterScan: ScanResult): VerificationSummary {
  const afterIds = new Set(afterScan.vulnerabilities.map((vulnerability) => vulnerability.id));
  const comparisons: VulnerabilityVerification[] = beforeScan.vulnerabilities.map((vulnerability) => {
    const stillPresent = afterIds.has(vulnerability.id);
    return {
      id: vulnerability.id,
      name: vulnerability.name,
      beforeStatus: 'Present',
      afterStatus: stillPresent ? 'Present' : 'Fixed',
      status: stillPresent ? 'UNRESOLVED' : 'RESOLVED',
    };
  });

  return {
    beforeScan,
    afterScan,
    comparisons,
    fixedCount: comparisons.filter((comparison) => comparison.status === 'RESOLVED').length,
    unresolvedCount: comparisons.filter((comparison) => comparison.status === 'UNRESOLVED').length,
  };
}

export function riskLabel(score: number): string {
  if (score >= 90) return 'LOW';
  if (score >= 70) return 'MODERATE';
  if (score >= 45) return 'HIGH';
  return 'CRITICAL';
}

export function attackSurfaceValue(scan: ScanResult): number {
  return scan.openPorts.length + scan.subdomains.length + scan.vulnerabilities.length;
}

export function formatAuditTime(event: AuditEvent): string {
  return event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
