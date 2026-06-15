import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
import { scanSteps } from '../data/mockData';
import type { ScanStep } from '../types';

const liveScanLogs = [
  'Initializing Sentinel AI scan engine',
  'Normalizing target and preparing fresh scan context',
  'Starting DNS enumeration',
  'Resolving common subdomains: www, api, admin, mail, dev',
  'Inspecting SSL certificate and TLS negotiation',
  'Checking for deprecated TLS protocol support',
  'Fetching HTTP and HTTPS response headers',
  'Analyzing Content-Security-Policy and HSTS posture',
  'Probing common external ports: 22, 80, 443, 8080',
  'Fingerprinting visible server technologies',
  'Mapping findings to Sentinel AI vulnerability model',
  'Calculating dynamic security score from active findings',
  'Preparing remediation-ready evidence bundle',
  'Finalizing scan report',
];

export function ScanScreen() {
  const [steps, setSteps] = useState<ScanStep[]>(scanSteps);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<Array<{ time: Date; message: string }>>([]);

  useEffect(() => {
    const totalSteps = steps.length;
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex <= totalSteps) {
        setProgress(Math.min(96, (stepIndex / totalSteps) * 92));

        setSteps(prev => prev.map((step, idx) => {
          if (idx < stepIndex) {
            return { ...step, status: 'completed' as const };
          } else if (idx === stepIndex) {
            return { ...step, status: 'running' as const };
          }
          return step;
        }));

        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1700);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let logIndex = 0;

    const interval = setInterval(() => {
      setLogs(prev => [
        ...prev.slice(-8),
        { time: new Date(), message: liveScanLogs[logIndex] },
      ]);
      setProgress(prev => Math.min(96, Math.max(prev, ((logIndex + 1) / liveScanLogs.length) * 96)));
      logIndex = (logIndex + 1) % liveScanLogs.length;
    }, 950);

    return () => clearInterval(interval);
  }, []);

  const getStepIcon = (step: ScanStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-cyber-green" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-cyber-cyan animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-cyber-red" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />;
    }
  };

  const getStepClass = (step: ScanStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-cyber-green/50 bg-cyber-green/10';
      case 'running':
        return 'border-cyber-cyan/50 bg-cyber-cyan/10 animate-pulse';
      case 'failed':
        return 'border-cyber-red/50 bg-cyber-red/10';
      default:
        return 'border-gray-700/50 bg-cyber-navy/30';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-cyber-green/30 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-cyber-green animate-spin" />
            </div>
            <div className="absolute inset-0 animate-pulse-slow">
              <div className="w-32 h-32 rounded-full border-4 border-cyber-green/10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Scanning Target</h2>
          <p className="text-gray-400">Analyzing security posture...</p>
        </div>

        <div className="mb-8">
          <div className="progress-bar mb-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-sm text-cyber-green font-mono">
            {Math.round(progress)}%
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${getStepClass(step)}`}
              >
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    step.status === 'completed' ? 'text-cyber-green' :
                    step.status === 'running' ? 'text-cyber-cyan' :
                    'text-gray-400'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {step.status === 'running' && (
                  <span className="text-xs text-cyber-cyan animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="terminal-window mt-6">
          <div className="terminal-header">
            <div className="terminal-dot bg-cyber-red" />
            <div className="terminal-dot bg-cyber-yellow" />
            <div className="terminal-dot bg-cyber-green" />
            <span className="ml-3 text-sm text-gray-400 font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyber-cyan" />
              live-scan.log
            </span>
            <span className="ml-auto flex items-center gap-2 text-cyber-cyan text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              STREAMING
            </span>
          </div>
          <div className="p-4 font-mono text-sm max-h-52 overflow-hidden">
            {logs.map((log, idx) => (
              <div key={`${log.time.toISOString()}-${idx}`} className="flex items-center gap-2 mb-1 terminal-info">
                <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                  [{log.time.toLocaleTimeString()}]
                </span>
                <span>{log.message}</span>
              </div>
            ))}
            <div className="h-4 w-3 inline-block bg-cyber-green animate-pulse" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Running comprehensive security analysis
          </p>
        </div>
      </div>
    </div>
  );
}
