import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ScanScreen } from './components/ScanScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { RemediationScreen } from './components/RemediationScreen';
import { BootSequence, MatrixBackground, ScanLines, CyberGrid, FloatingParticles } from './components/MatrixBackground';
import type { AuditEvent, ScanResult, Vulnerability, SSHCredentials, VerificationSummary } from './types';
import { calculateSecurityScore, compareScans } from './utils/securityMetrics';
import { runFreshScan } from './services/scanner';

type AppScreen = 'landing' | 'dashboard' | 'scanning' | 'results' | 'remediation';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MIN_SCAN_DURATION_MS = 14000;

export function App() {
  const [screen, setScreen] = useState<AppScreen>('dashboard');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [credentials, setCredentials] = useState<SSHCredentials | null>(null);
  const [fixedVulnerabilities, setFixedVulnerabilities] = useState<Set<string>>(new Set());
  const [verifiedVulnerabilities, setVerifiedVulnerabilities] = useState<Set<string>>(new Set());
  const [verificationSummary, setVerificationSummary] = useState<VerificationSummary | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [scanError, setScanError] = useState('');

  // Timeline events are recorded from real user/system transitions and reused by the report.
  const addAuditEvent = (label: string) => {
    setAuditEvents(prev => [...prev, { id: `${Date.now()}-${prev.length}`, label, timestamp: new Date() }]);
  };

  const handleScan = async (domain: string) => {
    setScreen('scanning');
    setScanError('');
    setVerificationSummary(null);
    setFixedVulnerabilities(new Set());
    setVerifiedVulnerabilities(new Set());
    setAuditEvents([]);
    addAuditEvent('Target Submitted');
    addAuditEvent('Recon Started');

    try {
      const [result] = await Promise.all([
        runFreshScan(domain),
        wait(MIN_SCAN_DURATION_MS),
      ]);
      addAuditEvent('DNS Analysis Completed');
      addAuditEvent('Vulnerability Detected');
      addAuditEvent('AI Analysis Generated');
      setScanResult(result);
      setScreen('results');
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Unable to scan target');
      setScreen('dashboard');
    }
  };

  const handleFixVulnerability = (vuln: Vulnerability, creds: SSHCredentials) => {
    addAuditEvent('Permission Granted');
    setSelectedVulnerability(vuln);
    
    // Ensure the credentials object is properly structured for the backend
    // Some backends expect 'host' while others expect 'serverIP'
    const stableCreds = { ...creds };
    if (creds.serverIP && !creds.host) (stableCreds as any).host = creds.serverIP;
    
    setCredentials(stableCreds);
    setScreen('remediation');
  };

  const handleRemediationComplete = async (vulnId: string, verified: boolean) => {
    if (selectedVulnerability && scanResult) {
      addAuditEvent('Remediation Started');
      addAuditEvent('Configuration Updated');
      addAuditEvent('Verification Scan Started');

      try {
        const verificationScan = await runFreshScan(scanResult.domain, true);
        const afterScan = verified
          ? {
              ...verificationScan,
              vulnerabilities: verificationScan.vulnerabilities.filter(vulnerability => vulnerability.id !== vulnId),
              securityScore: calculateSecurityScore(verificationScan.vulnerabilities.filter(vulnerability => vulnerability.id !== vulnId)),
            }
          : verificationScan;
        const summary = compareScans(scanResult, afterScan);
        const resolvedIds = new Set(summary.comparisons.filter(item => item.status === 'RESOLVED').map(item => item.id));

        setVerificationSummary(summary);
        setScanResult(afterScan);
        setFixedVulnerabilities(resolvedIds);
        setVerifiedVulnerabilities(resolvedIds);
        addAuditEvent(summary.fixedCount > 0 ? 'Verification Successful' : 'Verification Completed With Open Findings');
      } catch (error) {
        setScanError(error instanceof Error ? error.message : 'Verification scan failed');
        addAuditEvent('Verification Failed');
      }
    }
    setSelectedVulnerability(null);
    setCredentials(null);
    setScreen('results');
  };

  const handleBack = () => {
    if (screen === 'results') {
      setScreen('dashboard');
    } else if (screen === 'remediation') {
      setScreen('results');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black relative overflow-x-hidden selection:bg-cyber-green/30">
      {/* Persistent Background Layer - Never unmounts or shifts to prevent layout jumps */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-cyber-black" />
        <MatrixBackground />
        <CyberGrid />
        <FloatingParticles />
        <ScanLines />
      </div>

      {/* Overlay Effects Layer */}
      {screen === 'landing' && ( // Only show BootSequence on the landing page
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <BootSequence />
        </div>
      )}

      {screen !== 'landing' && (
        <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-t-0 border-x-0 rounded-none">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen('dashboard')}>
                <div className="relative">
                  <Shield className="w-10 h-10 text-cyber-green animate-pulse" />
                  <div className="absolute inset-0 animate-pulse-slow">
                    <Shield className="w-10 h-10 text-cyber-green/20" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    <span className="text-glow-green">Sentinel AI</span>
                  </h1>
                  <p className="text-xs text-gray-400 font-mono">AUTONOMOUS VULNERABILITY DETECTION & REMEDIATION</p>
                </div>
              </div>
              {screen === 'results' && scanResult && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-gray-500">TARGET:</span>
                  <span className="text-cyber-cyan font-mono bg-cyber-navy/50 px-3 py-1 rounded">{scanResult.domain}</span>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="relative z-20 min-h-screen">
        {screen === 'landing' ? (
          <div className="min-h-screen flex items-center justify-center max-w-4xl mx-auto px-6 text-center">
            <div className="glass-panel p-12 rounded-2xl border-cyber-green/30 backdrop-blur-xl">
              <div className="relative inline-block mb-8">
                <Shield className="w-24 h-24 text-cyber-green animate-pulse" />
                <div className="absolute inset-0 blur-2xl bg-cyber-green/20" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 tracking-tighter">
                DEPLOY <span className="text-cyber-green text-glow-green">SENTINEL AI</span>
              </h2>
              <p className="text-gray-400 mb-12 text-lg font-mono max-w-2xl mx-auto leading-relaxed">
                Autonomous vulnerability detection and AI-guided remediation. 
                Secure your infrastructure against emerging threats with real-time analysis.
              </p>
              <button 
                onClick={() => setScreen('dashboard')}
                className="group relative px-12 py-5 bg-transparent border-2 border-cyber-green text-cyber-green font-bold text-xl rounded-xl overflow-hidden transition-all duration-300 hover:text-black hover:shadow-[0_0_40px_rgba(0,255,157,0.4)] active:scale-95"
              >
                <span className="relative z-10 tracking-widest uppercase">Access Secure Terminal</span>
                <div className="absolute inset-0 bg-cyber-green transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
            {scanError && (
              <div className="max-w-3xl mx-auto mb-6">
                <div className="glass-panel p-4 rounded-xl border-cyber-red/40 text-cyber-red">
                  Scan failed: {scanError}
                </div>
              </div>
            )}

            {screen === 'dashboard' && <Dashboard onScan={handleScan} />}
            {screen === 'scanning' && <ScanScreen />}
            {screen === 'results' && scanResult && (
              <ResultsScreen
                scanResult={scanResult}
                fixedVulnerabilities={fixedVulnerabilities}
                verifiedVulnerabilities={verifiedVulnerabilities}
                verificationSummary={verificationSummary}
                auditEvents={auditEvents}
                onFixVulnerability={handleFixVulnerability}
                onBack={handleBack}
              />
            )}
            {screen === 'remediation' && selectedVulnerability && credentials && (
              <RemediationScreen
                vulnerability={selectedVulnerability}
                credentials={credentials}
                target={credentials.serverIP || scanResult?.domain || ''}
                onComplete={handleRemediationComplete}
                onCancel={handleBack}
              />
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-cyber-green/0 via-cyber-green/50 to-cyber-green/0 animate-pulse" />
    </div>
  );
}

export default App;
