export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Vulnerability {
  id: string;
  name: string;
  severity: Severity;
  cvss: number;
  affectedAsset: string;
  description: string;
  recommendedFix: string;
  aiExplanation: {
    whatWasFound: string;
    whyItMatters: string;
    riskLevel: string;
    suggestedFix: string[];
  };
  remediationSteps: RemediationStep[];
}

export interface RemediationStep {
  id: string;
  action: string;
  fileToModify?: string;
  command?: string;
  serviceToRestart?: string;
  impact: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export interface SSHCredentials {
  serverIP: string;
  username: string;
  password?: string;
  sshKey?: string;
  port?: number;
  authorized: boolean;
}

export interface ScanResult {
  id: string;
  domain: string;
  timestamp: Date;
  vulnerabilities: Vulnerability[];
  securityScore: number;
  openPorts: number[];
  subdomains: string[];
  technologies: string[];
  scanSteps: ScanStep[];
}

export interface ScanStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  details?: string;
}

export interface SecurityScore {
  overall: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RemediationLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface AttackSurface {
  openPorts: number[];
  subdomains: string[];
  technologies: string[];
  exposedEndpoints: string[];
}

export interface RemediationStatus {
  status: 'pending' | 'running' | 'success' | 'failed';
  verified?: boolean;
  logs: Array<{
    time: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }>;
}

export interface VulnerabilityVerification {
  id: string;
  name: string;
  beforeStatus: 'Present' | 'Absent';
  afterStatus: 'Present' | 'Fixed';
  status: 'RESOLVED' | 'UNRESOLVED';
}

export interface AuditEvent {
  id: string;
  label: string;
  timestamp: Date;
}

export interface VerificationSummary {
  beforeScan: ScanResult;
  afterScan: ScanResult;
  comparisons: VulnerabilityVerification[];
  fixedCount: number;
  unresolvedCount: number;
}
