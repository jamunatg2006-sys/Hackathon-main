import { useState } from 'react';
import { AlertTriangle, Cpu, Globe, Search, Shield, Terminal, Zap } from 'lucide-react';

interface DashboardProps {
  onScan: (domain: string) => void;
}

const scanModules = [
  { icon: 'DNS', label: 'DNS Enumeration' },
  { icon: 'SSL', label: 'SSL Inspection' },
  { icon: 'HDR', label: 'Header Analysis' },
  { icon: 'PRT', label: 'Port Discovery' },
  { icon: 'SUB', label: 'Subdomain Scan' },
  { icon: 'WAF', label: 'WAF Detection' },
  { icon: 'TEC', label: 'Tech Fingerprinting' },
  { icon: 'AUT', label: 'Auth Testing' },
];

export function Dashboard({ onScan }: DashboardProps) {
  const [domain, setDomain] = useState('https://example.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onScan(domain.trim());
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 animate-ping">
              <Shield className="w-28 h-28 text-cyber-red/30 mx-auto" />
            </div>
            <Shield className="w-28 h-28 text-cyber-red mx-auto relative z-10 animate-pulse" />
            <div className="absolute -inset-6 bg-cyber-red/20 blur-3xl rounded-full" />
          </div>
          <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
            <span className="text-glow-green">SENTINEL AI</span>
          </h2>
          <p className="text-cyber-red-bright text-lg mb-6 font-mono uppercase tracking-[0.18em]">
            Autonomous Vulnerability Detection & Remediation
          </p>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Enter a target domain to perform comprehensive security assessment with live evidence,
            AI-powered analysis, and SSH-based remediation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-20">
          <div className="glass-panel p-8 rounded-2xl border-cyber-red/40 animate-glow-pulse">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-cyber-red" />
              <span className="text-cyber-red font-mono text-sm">TARGET_ACQUISITION</span>
            </div>
            <label className="block text-sm font-medium text-gray-100 mb-3">
              Target Domain or IP Address
            </label>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyber-red transition-colors" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="https://target.example.com"
                  className="cyber-input pl-12 text-lg font-mono"
                />
              </div>
              <button type="submit" className="cyber-btn cyber-btn-primary whitespace-nowrap px-8 text-lg">
                <Search className="w-5 h-5" />
                <span>SCAN</span>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyber-red animate-pulse" />
                Ready to scan
              </span>
              <span>|</span>
              <span>8 security modules armed</span>
              <span>|</span>
              <span>SSH remediation enabled</span>
            </div>
          </div>
        </form>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="cyber-card group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyber-red/20">
                <AlertTriangle className="w-6 h-6 text-cyber-red" />
              </div>
              <h3 className="text-lg font-semibold text-white">Vulnerability Scanning</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Deep inspection of headers, TLS, ports, DNS exposure, and visible attack surface.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-red">XSS</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-orange">TLS</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-cyan">DNS</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-yellow">PORTS</span>
            </div>
          </div>

          <div className="cyber-card group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyber-red/20">
                <Cpu className="w-6 h-6 text-cyber-red-bright" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI-Powered Analysis</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Findings are translated into risk, plain-language explanation, and remediation evidence.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-cyan">AI</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-red">CVSS</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-orange">RISK</span>
            </div>
          </div>

          <div className="cyber-card group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyber-red/20">
                <Zap className="w-6 h-6 text-cyber-red" />
              </div>
              <h3 className="text-lg font-semibold text-white">Auto Remediation</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Secure SSH-based fixes with sudo support, fresh verification scans, and proof reports.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-red">SSH</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-cyan">SUDO</span>
              <span className="px-2 py-1 rounded bg-black/40 text-cyber-orange">VERIFY</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-cyber-red/30">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-5 h-5 text-cyber-red" />
            <h3 className="text-lg font-semibold text-white">Scan Modules</h3>
            <span className="ml-auto text-xs text-cyber-red font-mono">8 ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scanModules.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-black/35 border border-cyber-red/20 hover:border-cyber-red/60 transition-all group cursor-pointer"
              >
                <span className="text-xs font-mono text-cyber-red border border-cyber-red/35 rounded px-2 py-1 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-100 block truncate">{item.label}</span>
                  <span className="text-xs text-cyber-red font-mono">READY</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
