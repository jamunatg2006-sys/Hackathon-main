import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Globe,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { AuditEvent, ScanResult, Vulnerability, SSHCredentials, VerificationSummary } from '../types';
import { VulnerabilityTable } from './VulnerabilityTable';
import { SSHCredentialsModal } from './SSHCredentialsModal';
import { AISecurityAnalystPanel } from './AISecurityAnalystPanel';
import { generatePDFReport } from '../utils/pdfReport';
import { attackSurfaceValue, calculateSecurityScore, countBySeverity, formatAuditTime, riskLabel } from '../utils/securityMetrics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsScreenProps {
  scanResult: ScanResult;
  fixedVulnerabilities: Set<string>;
  verifiedVulnerabilities: Set<string>;
  verificationSummary: VerificationSummary | null;
  auditEvents: AuditEvent[];
  onFixVulnerability: (vuln: Vulnerability, creds: SSHCredentials) => void;
  onBack: () => void;
}

export function ResultsScreen({
  scanResult,
  fixedVulnerabilities,
  verifiedVulnerabilities,
  verificationSummary,
  auditEvents,
  onFixVulnerability,
  onBack,
}: ResultsScreenProps) {
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [vulnToFix, setVulnToFix] = useState<Vulnerability | null>(null);

  const critical = scanResult.vulnerabilities.filter(v => v.severity === 'critical' && !fixedVulnerabilities.has(v.id)).length;
  const high = scanResult.vulnerabilities.filter(v => v.severity === 'high' && !fixedVulnerabilities.has(v.id)).length;
  const medium = scanResult.vulnerabilities.filter(v => v.severity === 'medium' && !fixedVulnerabilities.has(v.id)).length;
  const low = scanResult.vulnerabilities.filter(v => v.severity === 'low' && !fixedVulnerabilities.has(v.id)).length;

  // All score and reduction values come from scan findings, never from hardcoded increments.
  const fixedCount = verificationSummary?.fixedCount ?? fixedVulnerabilities.size;
  const totalVulns = scanResult.vulnerabilities.length;
  const initialScore = verificationSummary ? calculateSecurityScore(verificationSummary.beforeScan.vulnerabilities) : scanResult.securityScore;
  const currentScore = calculateSecurityScore(scanResult.vulnerabilities);
  const scoreImprovement = Math.max(0, currentScore - initialScore);
  const improvementPercent = initialScore > 0 ? Math.round((scoreImprovement / initialScore) * 100) : 0;
  const beforeCounts = verificationSummary ? countBySeverity(verificationSummary.beforeScan.vulnerabilities) : countBySeverity(scanResult.vulnerabilities);
  const afterCounts = countBySeverity(scanResult.vulnerabilities);
  const attackSurfaceBefore = verificationSummary ? attackSurfaceValue(verificationSummary.beforeScan) : attackSurfaceValue(scanResult);
  const attackSurfaceAfter = attackSurfaceValue(scanResult);

  const doughnutData = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Fixed'],
    datasets: [{
      data: [critical, high, medium, low, fixedCount],
      backgroundColor: [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#00ff88',
        '#22c55e',
      ],
      borderColor: [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#00ff88',
        '#22c55e',
      ],
      borderWidth: 0,
    }],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cyber-green';
    if (score >= 60) return 'text-cyber-yellow';
    if (score >= 40) return 'text-cyber-orange';
    return 'text-cyber-red';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Secure';
    if (score >= 60) return 'Moderate Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
  };

  const handleFixClick = (vuln: Vulnerability) => {
    setVulnToFix(vuln);
    setShowCredentialsModal(true);
  };

  const handleCredentialsSubmit = (creds: SSHCredentials) => {
    if (vulnToFix) {
      onFixVulnerability(vulnToFix, creds);
    }
    setShowCredentialsModal(false);
    setVulnToFix(null);
  };

  const handleDownloadReport = () => {
    generatePDFReport(scanResult, fixedVulnerabilities, currentScore, verificationSummary, auditEvents);
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="cyber-btn cyber-btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button onClick={handleDownloadReport} className="cyber-btn cyber-btn-primary">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="stat-card border-cyber-red/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-red/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-cyber-red" />
                <span className="text-cyber-red text-sm font-medium">Critical</span>
              </div>
              <p className="text-3xl font-bold text-cyber-red">{critical}</p>
              {fixedVulnerabilities.size > 0 && critical === 0 && (
                <span className="text-xs text-cyber-green flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" /> All fixed!
                </span>
              )}
            </div>
          </div>

          <div className="stat-card border-cyber-orange/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-orange/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-cyber-orange" />
                <span className="text-cyber-orange text-sm font-medium">High</span>
              </div>
              <p className="text-3xl font-bold text-cyber-orange">{high}</p>
            </div>
          </div>

          <div className="stat-card border-cyber-yellow/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-yellow/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-cyber-yellow" />
                <span className="text-cyber-yellow text-sm font-medium">Medium</span>
              </div>
              <p className="text-3xl font-bold text-cyber-yellow">{medium}</p>
            </div>
          </div>

          <div className="stat-card border-cyber-green/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-green/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-cyber-green" />
                <span className="text-cyber-green text-sm font-medium">Low</span>
              </div>
              <p className="text-3xl font-bold text-cyber-green">{low}</p>
            </div>
          </div>

          <div className="stat-card col-span-2 md:col-span-1 border-cyber-cyan/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-cyan/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-cyber-cyan" />
                <span className="text-gray-400 text-sm font-medium">Security Score</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}</p>
              <p className={`text-xs ${getScoreColor(currentScore)}`}>{getScoreLabel(currentScore)}</p>
              {scoreImprovement > 0 && (
                <p className="text-xs text-cyber-green mt-1">+{scoreImprovement} after verification</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyber-cyan" />
              Security Score Improvement
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-3xl font-bold ${getScoreColor(initialScore)}`}>{initialScore}</span>
              <span className="text-gray-500">→</span>
              <span className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-cyber-navy/50">
                <p className="text-gray-400">Improvement</p>
                <p className="text-cyber-green font-bold">{improvementPercent}%</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-navy/50">
                <p className="text-gray-400">Fixed</p>
                <p className="text-cyber-green font-bold">{fixedCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-cyan" />
              Impact Dashboard
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-navy/50">
                <span className="text-gray-400">Attack Surface</span>
                <span className="text-white font-mono">{attackSurfaceBefore} → {attackSurfaceAfter}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-navy/50">
                <span className="text-gray-400">Risk Level</span>
                <span className="text-cyber-green font-mono">{riskLabel(initialScore)} → {riskLabel(currentScore)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-navy/50">
                <span className="text-gray-400">Critical Reduced</span>
                <span className="text-cyber-green font-mono">{Math.max(0, beforeCounts.critical - afterCounts.critical)}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyber-cyan" />
              System Status
            </h3>
            {[
              ['Recon Complete', scanResult.scanSteps.some(step => step.name.includes('DNS'))],
              ['Analysis Complete', scanResult.vulnerabilities.length >= 0],
              ['Remediation Complete', fixedCount > 0 || Boolean(verificationSummary)],
              ['Verification Complete', Boolean(verificationSummary)],
              ['Evidence Generated', auditEvents.length > 0],
              ['Security Restored', scanResult.vulnerabilities.length === 0],
            ].map(([label, done]) => (
              <div key={String(label)} className="flex items-center gap-2 mb-2 text-sm">
                <CheckCircle className={`w-4 h-4 ${done ? 'text-cyber-green' : 'text-gray-600'}`} />
                <span className={done ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {verificationSummary && (
          <div className="glass-panel p-6 rounded-xl mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyber-cyan" />
              Before vs After Verification
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-light/30">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Vulnerability Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Before</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">After</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationSummary.comparisons.map(item => (
                    <tr key={item.id} className="border-b border-cyber-light/10">
                      <td className="py-3 px-4 text-white">{item.name}</td>
                      <td className="py-3 px-4 text-cyber-orange">{item.beforeStatus}</td>
                      <td className="py-3 px-4 text-cyber-green">{item.afterStatus}</td>
                      <td className={`py-3 px-4 font-mono ${item.status === 'RESOLVED' ? 'text-cyber-green' : 'text-cyber-red'}`}>
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-cyan" />
              Vulnerability Distribution
            </h3>
            <div className="h-48 flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#9ca3af',
                        padding: 15,
                        usePointStyle: true,
                      },
                    },
                  },
                  cutout: '60%',
                }}
              />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyber-cyan" />
              Attack Surface
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Open Ports</p>
                <div className="flex flex-wrap gap-2">
                  {scanResult.openPorts.map(port => (
                    <span
                      key={port}
                      className="px-3 py-1 bg-cyber-navy rounded-md text-cyber-red text-sm font-mono border border-cyber-red/30"
                    >
                      {port}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Subdomains ({scanResult.subdomains.length})</p>
                <div className="flex flex-wrap gap-2">
                  {scanResult.subdomains.slice(0, 4).map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyber-navy rounded-md text-gray-300 text-xs font-mono truncate max-w-full"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyber-cyan" />
              Technologies Detected
            </h3>
            <div className="space-y-2">
              {scanResult.technologies.map((tech, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-cyber-navy/50"
                >
                  <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                  <span className="text-sm text-gray-300 font-mono">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyber-cyan" />
            AI Recommendations
          </h3>
          <div className="glass-panel p-6 rounded-xl">
            <div className="space-y-3">
              {[
                'Immediately restrict access to the exposed admin endpoint to trusted IPs only',
                'Install and configure fail2ban to protect SSH from brute force attacks',
                'Update nginx to the latest stable version to patch known vulnerabilities',
                'Implement Content-Security-Policy headers to prevent XSS attacks',
                'Enable HSTS to prevent SSL stripping attacks',
              ].map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-cyber-navy/50 border-l-2 border-cyber-green hover:bg-cyber-navy/70 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-green/20 text-cyber-green flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-gray-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyber-cyan" />
              Autonomous Security Timeline
            </h3>
            <div className="space-y-2">
              {auditEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-cyber-navy/50">
                  <span className="text-cyber-cyan font-mono text-xs w-14">[{formatAuditTime(event)}]</span>
                  <span className="text-sm text-gray-300">{event.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-cyan" />
              Why Sentinel AI Is Different
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-cyber-navy/50">
                <p className="text-xs text-gray-400">Found</p>
                <p className="text-xl font-bold text-cyber-orange">{verificationSummary?.beforeScan.vulnerabilities.length ?? totalVulns}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-navy/50">
                <p className="text-xs text-gray-400">Fixed</p>
                <p className="text-xl font-bold text-cyber-green">{fixedCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-navy/50">
                <p className="text-xs text-gray-400">Time Saved</p>
                <p className="text-xl font-bold text-cyber-cyan">{Math.max(1, fixedCount * 4)}h</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                <p className="text-gray-400 mb-2">Traditional Security Workflow</p>
                <p className="text-gray-300">Detect → Analyze → Fix → Verify</p>
                <p className="text-cyber-orange mt-1">Hours or Days</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-navy/50 border border-cyber-green/30">
                <p className="text-gray-400 mb-2">Sentinel AI Workflow</p>
                <p className="text-gray-300">Detect → Analyze → Fix → Verify</p>
                <p className="text-cyber-green mt-1">Minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyber-cyan" />
              Vulnerabilities Found ({totalVulns})
            </h3>
            <span className="text-sm text-gray-400">
              {fixedCount} fixed | {verifiedVulnerabilities.size} verified
            </span>
          </div>
          <VulnerabilityTable
            vulnerabilities={scanResult.vulnerabilities}
            fixedVulnerabilities={fixedVulnerabilities}
            verifiedVulnerabilities={verifiedVulnerabilities}
            onFix={handleFixClick}
            onSelect={setSelectedVuln}
            selectedVuln={selectedVuln}
          />
        </div>

        {selectedVuln && (
          <AISecurityAnalystPanel vulnerability={selectedVuln} />
        )}
      </div>

      {showCredentialsModal && vulnToFix && (
        <SSHCredentialsModal
          vulnerability={vulnToFix}
          onSubmit={handleCredentialsSubmit}
          onClose={() => {
            setShowCredentialsModal(false);
            setVulnToFix(null);
          }}
        />
      )}
    </div>
  );
}
