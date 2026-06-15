import { Brain, AlertTriangle, CheckCircle, ChevronRight, Shield, ShieldAlert } from 'lucide-react';
import type { Vulnerability, Severity } from '../types';

interface AISecurityAnalystPanelProps {
  vulnerability: Vulnerability;
}

const severityColors: Record<Severity, { text: string; bg: string }> = {
  critical: { text: 'text-cyber-red', bg: 'bg-cyber-red/20' },
  high: { text: 'text-cyber-orange', bg: 'bg-cyber-orange/20' },
  medium: { text: 'text-cyber-yellow', bg: 'bg-cyber-yellow/20' },
  low: { text: 'text-cyber-green', bg: 'bg-cyber-green/20' },
};

export function AISecurityAnalystPanel({ vulnerability }: AISecurityAnalystPanelProps) {
  const style = severityColors[vulnerability.severity];

  return (
    <div className="glass-panel p-6 rounded-xl border-cyber-cyan/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyber-cyan/20">
          <Brain className="w-6 h-6 text-cyber-cyan" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Security Analyst</h3>
          <p className="text-xs text-gray-400">Powered by advanced threat intelligence</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className={`w-5 h-5 ${style.text}`} />
            <h4 className={`font-semibold ${style.text}`}>What Was Found</h4>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {vulnerability.aiExplanation.whatWasFound}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-cyber-navy/50 border border-cyber-light/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-cyber-orange" />
            <h4 className="font-semibold text-cyber-orange">Why It Matters</h4>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {vulnerability.aiExplanation.whyItMatters}
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-cyber-navy/80 border border-cyber-light/20">
          <div className="flex-shrink-0">
            <div className={`px-4 py-2 rounded-lg ${style.bg} font-bold uppercase ${style.text} tracking-wide`}>
              Risk Level
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            {vulnerability.aiExplanation.riskLevel}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-cyber-green/10 border border-cyber-green/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-cyber-green" />
            <h4 className="font-semibold text-cyber-green">Suggested Fix</h4>
          </div>
          <div className="space-y-2">
            {vulnerability.aiExplanation.suggestedFix.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2 rounded bg-cyber-navy/30"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyber-green/20 text-cyber-green flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-gray-300 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
            <Shield className="w-5 h-5 text-cyber-cyan" />
            Remediation Steps
          </h4>
          <div className="space-y-2">
            {vulnerability.remediationSteps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-cyber-navy/50 border border-cyber-light/20 hover:border-cyber-cyan/50 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center font-mono font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{step.action}</p>
                  {step.fileToModify && (
                    <p className="text-xs text-gray-500 font-mono truncate mt-1">
                      {step.fileToModify}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    step.impact === 'high' ? 'bg-cyber-red/20 text-cyber-red' :
                    step.impact === 'medium' ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                    'bg-cyber-green/20 text-cyber-green'
                  }`}>
                    {step.impact} impact
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{step.estimatedTime}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
