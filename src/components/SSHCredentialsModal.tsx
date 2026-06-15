import { useState } from 'react';
import { AlertTriangle, Key, Lock, Server, Terminal, X } from 'lucide-react';
import type { Vulnerability, SSHCredentials } from '../types';

interface SSHCredentialsModalProps {
  vulnerability: Vulnerability;
  onSubmit: (creds: SSHCredentials) => void;
  onClose: () => void;
}

export function SSHCredentialsModal({
  vulnerability,
  onSubmit,
  onClose,
}: SSHCredentialsModalProps) {
  const [serverIP, setServerIP] = useState('');
  const [username, setUsername] = useState('');
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');
  const [password, setPassword] = useState('');
  const [sshKey, setSSHKey] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!serverIP.trim()) {
      newErrors.serverIP = 'Server IP is required';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (authMethod === 'password' && !password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (authMethod === 'key' && !sshKey.trim()) {
      newErrors.sshKey = 'SSH Key is required';
    }

    if (!authorized) {
      newErrors.authorized = 'You must authorize Sentinel AI to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const creds: SSHCredentials = {
        serverIP,
        username,
        authorized,
        ...(authMethod === 'password' ? { password } : { sshKey }),
      };
      onSubmit(creds);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-cyber-green" />
            <h2 className="text-xl font-bold text-white">SSH Credentials Required</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 rounded-lg bg-cyber-navy border border-cyber-light/30 mb-6">
          <p className="text-sm text-gray-400 mb-2">Fixing vulnerability:</p>
          <p className="text-white font-medium">{vulnerability.name}</p>
          <p className="text-xs text-cyber-orange mt-1">Severity: {vulnerability.severity.toUpperCase()}</p>
        </div>

        <div className="bg-cyber-yellow/10 border border-cyber-yellow/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-cyber-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-cyber-yellow font-medium mb-1">
                Authorization Required
              </p>
              <p className="text-xs text-gray-400">
                Sentinel AI will only perform remediation actions after your explicit approval.
                All changes will be reviewed before execution.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Server className="w-4 h-4 inline-block mr-2" />
              Server IP Address
            </label>
            <input
              type="text"
              value={serverIP}
              onChange={(e) => setServerIP(e.target.value)}
              placeholder="192.168.1.100"
              className="cyber-input font-mono"
            />
            {errors.serverIP && (
              <p className="text-cyber-red text-xs mt-1">{errors.serverIP}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline-block mr-2" />
              SSH Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="root"
              className="cyber-input font-mono"
            />
            {errors.username && (
              <p className="text-cyber-red text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Authentication Method
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                authMethod === 'password'
                  ? 'bg-cyber-green/20 border border-cyber-green/50 text-cyber-green'
                  : 'bg-cyber-navy border border-cyber-light/30 text-gray-400'
              }`}>
                <input
                  type="radio"
                  name="authMethod"
                  value="password"
                  checked={authMethod === 'password'}
                  onChange={() => setAuthMethod('password')}
                  className="hidden"
                />
                <Lock className="w-4 h-4" />
                <span className="text-sm">Password</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                authMethod === 'key'
                  ? 'bg-cyber-green/20 border border-cyber-green/50 text-cyber-green'
                  : 'bg-cyber-navy border border-cyber-light/30 text-gray-400'
              }`}>
                <input
                  type="radio"
                  name="authMethod"
                  value="key"
                  checked={authMethod === 'key'}
                  onChange={() => setAuthMethod('key')}
                  className="hidden"
                />
                <Key className="w-4 h-4" />
                <span className="text-sm">SSH Key</span>
              </label>
            </div>
          </div>

          {authMethod === 'password' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SSH Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="cyber-input"
              />
              {errors.password && (
                <p className="text-cyber-red text-xs mt-1">{errors.password}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SSH Private Key
              </label>
              <textarea
                value={sshKey}
                onChange={(e) => setSSHKey(e.target.value)}
                placeholder="Paste your private key here..."
                className="cyber-input h-24 resize-none font-mono text-xs"
              />
              {errors.sshKey && (
                <p className="text-cyber-red text-xs mt-1">{errors.sshKey}</p>
              )}
            </div>
          )}

          <div className="bg-cyber-red/10 border border-cyber-red/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                className="rounded border-cyber-light/50 text-cyber-green focus:ring-cyber-green mt-1"
              />
              <span className="text-sm text-gray-300">
                I authorize Sentinel AI to perform remediation actions on this server.
                I understand that changes will be shown for approval before execution.
              </span>
            </label>
            {errors.authorized && (
              <p className="text-cyber-red text-xs mt-2">{errors.authorized}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cyber-btn cyber-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 cyber-btn cyber-btn-primary"
            >
              Connect & Fix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
