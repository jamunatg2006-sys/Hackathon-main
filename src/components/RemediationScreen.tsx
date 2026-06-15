import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  Server,
  Shield,
  ShieldCheck,
  Terminal,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { Vulnerability, SSHCredentials } from '../types';

interface RemediationScreenProps {
  vulnerability: Vulnerability;
  credentials: SSHCredentials;
  target: string;
  onComplete: (vulnId: string, verified: boolean) => void;
  onCancel: () => void;
}

type RemediationPhase = 'plan' | 'executing' | 'verifying' | 'complete' | 'error';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

// Use relative path - Vite proxy will forward to backend
const SOCKET_URL = window.location.origin;

export function RemediationScreen({
  vulnerability,
  credentials,
  target,
  onComplete,
  onCancel,
}: RemediationScreenProps) {
  const [phase, setPhase] = useState<RemediationPhase>('plan');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [verified, setVerified] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });

    socket.on('connect', () => {
      console.log('Connected to backend');
      setBackendConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
      setBackendConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
      setBackendConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const getVulnType = (vulnId: string): string => {
    const types: Record<string, string> = {
      'vuln-1': 'csp',
      'vuln-2': 'hsts',
      'vuln-3': 'ssh',
      'vuln-4': 'tls',
      'vuln-5': 'admin',
      'vuln-6': 'software',
    };
    return types[vulnId] || 'csp';
  };

  const executeRemediation = async () => {
    if (!socketRef.current || !backendConnected) {
      addLog({
        time: new Date().toISOString(),
        message: 'Backend not connected. Please start the server: cd backend && npm start',
        type: 'error'
      });
      return;
    }

    setPhase('executing');
    setLogs([]);

    const socket = socketRef.current;

    // Listen for logs
    socket.on('log', (log: LogEntry) => {
      addLog(log);
    });

    // Listen for completion
    socket.on('complete', (data: { verified: boolean; message: string }) => {
      setVerified(data.verified);
      setVerifyMessage(data.message);
      setPhase('complete');
    });

    // Start remediation
    socket.emit('remediate', {
      vulnType: getVulnType(vulnerability.id),
      target,
      credentials: {
        serverIP: credentials.serverIP,
        username: credentials.username,
        password: credentials.password,
        sshKey: credentials.sshKey,
        port: credentials.port || 22,
      },
    });
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-cyber-green flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-cyber-red flex-shrink-0" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-cyber-orange flex-shrink-0" />;
      default:
        return <Loader2 className="w-4 h-4 text-cyber-cyan animate-spin flex-shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={onCancel} className="cyber-btn cyber-btn-secondary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </button>

        {/* Status bar */}
        <div className="glass-panel p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {backendConnected ? (
              <Wifi className="w-5 h-5 text-cyber-green" />
            ) : (
              <WifiOff className="w-5 h-5 text-cyber-red" />
            )}
            <span className={`text-sm font-medium ${backendConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
              Backend: {backendConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-gray-400 font-mono">
            {credentials.username}@{credentials.serverIP}:22
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl mb-6 border-cyber-green/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-cyber-green/20">
              <Shield className="w-6 h-6 text-cyber-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Remediation: {vulnerability.name}
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                {vulnerability.id}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              vulnerability.severity === 'critical' ? 'bg-cyber-red/20 text-cyber-red animate-pulse' :
              vulnerability.severity === 'high' ? 'bg-cyber-orange/20 text-cyber-orange' :
              vulnerability.severity === 'medium' ? 'bg-cyber-yellow/20 text-cyber-yellow' :
              'bg-cyber-green/20 text-cyber-green'
            }`}>
              {vulnerability.severity.toUpperCase()}
            </span>
            <span className="text-sm text-gray-400">CVSS: {vulnerability.cvss}</span>
          </div>
        </div>

        {phase === 'plan' && (
          <>
            <div className="glass-panel p-6 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyber-cyan" />
                  <h3 className="text-lg font-semibold text-white">Proposed Actions</h3>
                </div>
              </div>
              <div className="space-y-3">
                {vulnerability.remediationSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20 hover:border-cyber-cyan/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center font-mono font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{step.action}</p>
                        {step.command && (
                          <code className="block mt-2 p-2 bg-cyber-black/50 rounded text-xs text-cyber-green font-mono overflow-x-auto">
                            $ sudo {step.command}
                          </code>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        step.impact === 'high' ? 'bg-cyber-red/20 text-cyber-red' :
                        step.impact === 'medium' ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                        'bg-cyber-green/20 text-cyber-green'
                      }`}>
                        {step.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Impact Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                  <p className="text-sm text-gray-400 mb-1">Files to Modify</p>
                  <p className="text-2xl font-bold text-cyber-cyan">
                    {vulnerability.remediationSteps.filter(s => s.fileToModify).length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                  <p className="text-sm text-gray-400 mb-1">Services to Restart</p>
                  <p className="text-2xl font-bold text-cyber-orange">
                    {vulnerability.remediationSteps.filter(s => s.serviceToRestart).length + 1}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                  <p className="text-sm text-gray-400 mb-1">Est. Time</p>
                  <p className="text-2xl font-bold text-cyber-green">~2m</p>
                </div>
              </div>
            </div>

            {!backendConnected && (
              <div className="bg-cyber-orange/10 border border-cyber-orange/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <WifiOff className="w-5 h-5 text-cyber-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-cyber-orange font-medium mb-1">Backend Not Connected</p>
                    <p className="text-xs text-gray-400 font-mono">
                      Run in a new terminal: cd backend && npm install && npm start
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-cyber-yellow font-medium mb-1">sudo Required</p>
                  <p className="text-xs text-gray-400">
                    Commands will run with sudo using the same password entered for SSH access.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={onCancel} className="flex-1 cyber-btn cyber-btn-secondary">
                Cancel
              </button>
              <button
                onClick={executeRemediation}
                disabled={!backendConnected}
                className={`flex-1 cyber-btn text-lg py-4 ${
                  backendConnected ? 'cyber-btn-primary' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Execute Remediation
              </button>
            </div>
          </>
        )}

        {(phase === 'executing' || phase === 'verifying' || phase === 'error') && (
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot bg-cyber-red" />
              <div className="terminal-dot bg-cyber-yellow" />
              <div className="terminal-dot bg-cyber-green" />
              <span className="ml-3 text-sm text-gray-400 font-mono">
                ssh {credentials.username}@{credentials.serverIP}
              </span>
              {phase === 'executing' && (
                <span className="ml-auto flex items-center gap-2 text-cyber-cyan text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  LIVE
                </span>
              )}
            </div>
            <div className="p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 mb-1 ${
                    log.type === 'success' ? 'terminal-success' :
                    log.type === 'error' ? 'terminal-error' :
                    log.type === 'warning' ? 'terminal-warning' :
                    'terminal-info'
                  }`}
                >
                  {getLogIcon(log.type)}
                  <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                    [{new Date(log.time).toLocaleTimeString()}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
              {phase === 'executing' && (
                <div className="h-4 w-3 inline-block bg-cyber-green animate-pulse" />
              )}
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <>
            <div className="terminal-window mb-6">
              <div className="terminal-header">
                <div className="terminal-dot bg-cyber-red" />
                <div className="terminal-dot bg-cyber-yellow" />
                <div className="terminal-dot bg-cyber-green" />
                <span className="ml-3 text-sm text-gray-400 font-mono">
                  ssh {credentials.username}@{credentials.serverIP}
                </span>
                <span className="ml-auto text-cyber-green text-xs">COMPLETED</span>
              </div>
              <div className="p-4 font-mono text-sm max-h-64 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 mb-1 ${
                      log.type === 'success' ? 'terminal-success' :
                      log.type === 'error' ? 'terminal-error' :
                      log.type === 'warning' ? 'terminal-warning' :
                      'terminal-info'
                    }`}
                  >
                    {getLogIcon(log.type)}
                    <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                      [{new Date(log.time).toLocaleTimeString()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`glass-panel p-8 rounded-xl text-center mb-6 ${verified ? 'border-cyber-green/50' : 'border-cyber-orange/50'}`}>
              {verified ? (
                <ShieldCheck className="w-20 h-20 text-cyber-green mx-auto mb-4" />
              ) : (
                <AlertCircle className="w-20 h-20 text-cyber-orange mx-auto mb-4" />
              )}
              <h3 className={`text-2xl font-bold mb-2 ${verified ? 'text-cyber-green' : 'text-cyber-orange'}`}>
                {verified ? 'Remediation Complete & Verified' : 'Remediation Complete - Review Required'}
              </h3>
              <p className="text-gray-400 mb-6">{verifyMessage}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                  <p className="text-sm text-gray-400 mb-1">Commands Run</p>
                  <p className="text-2xl font-bold text-cyber-cyan">
                    {logs.filter(l => l.type === 'info').length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                  <p className="text-sm text-gray-400 mb-1">Success</p>
                  <p className="text-2xl font-bold text-cyber-green">
                    {logs.filter(l => l.type === 'success').length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
                  <p className="text-sm text-gray-400 mb-1">Verification</p>
                  <p className={`text-2xl font-bold ${verified ? 'text-cyber-green' : 'text-cyber-orange'}`}>
                    {verified ? 'PASSED' : 'REVIEW'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onComplete(vulnerability.id, verified)}
              className="w-full cyber-btn cyber-btn-primary text-lg py-4"
            >
              <Terminal className="w-5 h-5" />
              Return to Results
            </button>
          </>
        )}
      </div>
    </div>
  );
}
