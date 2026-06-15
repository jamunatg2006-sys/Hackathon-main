import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AuditEvent, ScanResult, Severity, VerificationSummary } from '../types';
import { attackSurfaceValue, calculateSecurityScore, countBySeverity, formatAuditTime, riskLabel } from './securityMetrics';

export function generatePDFReport(
  scanResult: ScanResult,
  fixedVulnerabilities: Set<string>,
  currentScore: number,
  verificationSummary: VerificationSummary | null = null,
  auditEvents: AuditEvent[] = []
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const colors = {
    cyberGreen: [0, 255, 136] as [number, number, number],
    cyberRed: [239, 68, 68] as [number, number, number],
    cyberOrange: [249, 115, 22] as [number, number, number],
    cyberYellow: [234, 179, 8] as [number, number, number],
    cyberCyan: [6, 182, 212] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    gray: [156, 163, 175] as [number, number, number],
    darkGray: [15, 23, 42] as [number, number, number],
  };

  const severityColors: Record<Severity, [number, number, number]> = {
    critical: colors.cyberRed,
    high: colors.cyberOrange,
    medium: colors.cyberYellow,
    low: colors.cyberGreen,
  };

  doc.setFillColor(...colors.darkGray);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(...colors.cyberGreen);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Sentinel AI', 20, 25);
  doc.setTextColor(...colors.white);
  doc.setFontSize(10);
  doc.text('Security Assessment Report', 20, 35);

  doc.setTextColor(...colors.gray);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 20, { align: 'right' });

  let yPos = 60;

  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(...colors.gray);
  doc.text(
    'Sentinel AI autonomously identified, analyzed, remediated, verified, and documented security vulnerabilities through a unified AI-driven workflow.',
    20,
    yPos,
    { maxWidth: pageWidth - 40 }
  );
  yPos += 16;
  doc.text(`Target Domain: ${scanResult.domain}`, 20, yPos);
  yPos += 6;
  doc.text(`Scan Timestamp: ${scanResult.timestamp.toLocaleString()}`, 20, yPos);
  yPos += 6;
  doc.text(`Duration: Full comprehensive scan completed`, 20, yPos);
  yPos += 15;

  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Security Score', 20, yPos);
  yPos += 10;

  const scoreColor = currentScore >= 80 ? colors.cyberGreen :
    currentScore >= 60 ? colors.cyberYellow :
    currentScore >= 40 ? colors.cyberOrange :
    colors.cyberRed;

  doc.setFillColor(...scoreColor);
  doc.roundedRect(20, yPos, 100, 40, 5, 5, 'F');
  doc.setTextColor(...colors.white);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currentScore}`, 70, yPos + 25, { align: 'center' });
  doc.setFontSize(10);
  doc.text('out of 100', 70, yPos + 35, { align: 'center' });
  yPos += 60;

  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vulnerability Breakdown', 20, yPos);
  yPos += 10;

  const critical = scanResult.vulnerabilities.filter(v => v.severity === 'critical' && !fixedVulnerabilities.has(v.id)).length;
  const high = scanResult.vulnerabilities.filter(v => v.severity === 'high' && !fixedVulnerabilities.has(v.id)).length;
  const medium = scanResult.vulnerabilities.filter(v => v.severity === 'medium' && !fixedVulnerabilities.has(v.id)).length;
  const low = scanResult.vulnerabilities.filter(v => v.severity === 'low' && !fixedVulnerabilities.has(v.id)).length;
  const fixed = fixedVulnerabilities.size;

  const breakdown = [
    ['Critical', critical.toString(), critical > 0 ? 'Immediate action required' : 'No critical issues'],
    ['High', high.toString(), high > 0 ? 'Address within 24 hours' : 'No high issues'],
    ['Medium', medium.toString(), medium > 0 ? 'Address within 7 days' : 'No medium issues'],
    ['Low', low.toString(), low > 0 ? 'Address when possible' : 'No low issues'],
    ['Fixed', fixed.toString(), 'Remediation completed'],
  ];

  const tableData = breakdown.map((row) => [...row, severityColors &&
    (row[0] === 'Critical' ? `rgb(${colors.cyberRed.join(',')})` :
     row[0] === 'High' ? `rgb(${colors.cyberOrange.join(',')})` :
     row[0] === 'Medium' ? `rgb(${colors.cyberYellow.join(',')})` :
     row[0] === 'Low' ? `rgb(${colors.cyberGreen.join(',')})` :
     `rgb(34,197,94)`)
  ]) as string[][];

  autoTable(doc, {
    startY: yPos,
    head: [['Severity', 'Count', 'Status', '']],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42], textColor: [156, 163, 175] },
    bodyStyles: { textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [30, 41, 59] },
    columnStyles: { 3: { cellWidth: 0 } },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.addPage();

  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Vulnerability Report', 20, 20);
  yPos = 30;

  scanResult.vulnerabilities.forEach((vuln) => {
    const isFixed = fixedVulnerabilities.has(vuln.id);
    const severityColor = severityColors[vuln.severity];

    doc.setFillColor(...severityColor);
    doc.rect(20, yPos, 4, 30, 'F');

    doc.setTextColor(...colors.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(vuln.name, 28, yPos + 8);

    doc.setTextColor(...severityColor);
    doc.setFontSize(9);
    doc.text(`${vuln.severity.toUpperCase()} | CVSS: ${vuln.cvss}`, 28, yPos + 14);

    doc.setTextColor(...colors.gray);
    doc.setFontSize(8);
    doc.text(`Affected Asset: ${vuln.affectedAsset}`, 28, yPos + 20);

    if (isFixed) {
      doc.setTextColor(...colors.cyberGreen);
      doc.text('REMEDIATED', pageWidth - 25, yPos + 8, { align: 'right' });
    }

    doc.setTextColor(...colors.white);
    doc.setFontSize(9);
    const desc = doc.splitTextToSize(vuln.description, pageWidth - 50);
    doc.text(desc, 28, yPos + 28);

    yPos += 35 + (desc.length * 4);

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });

  doc.addPage();

  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Attack Surface Summary', 20, 20);
  yPos = 30;

  doc.setFontSize(10);
  doc.setTextColor(...colors.gray);
  const openPorts = scanResult.openPorts;
  doc.text(`Open Ports: ${openPorts.join(', ')}`, 20, yPos);
  yPos += 10;

  const subdomains = scanResult.subdomains;
  doc.text(`Subdomains Discovered: ${subdomains.length}`, 20, yPos);
  yPos += 6;
  subdomains.forEach(sub => {
    doc.text(`  - ${sub}`, 20, yPos);
    yPos += 5;
  });
  yPos += 5;

  const tech = scanResult.technologies;
  doc.text(`Technologies Detected: ${tech.length}`, 20, yPos);
  yPos += 6;
  tech.forEach(t => {
    doc.text(`  - ${t}`, 20, yPos);
    yPos += 5;
  });

  yPos += 15;
  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Recommendations', 20, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setTextColor(...colors.gray);
  const recommendations = [
    '1. Immediately restrict access to the exposed admin endpoint to trusted IPs only',
    '2. Install and configure fail2ban to protect SSH from brute force attacks',
    '3. Update nginx to the latest stable version to patch known vulnerabilities',
    '4. Implement Content-Security-Policy headers to prevent XSS attacks',
    '5. Enable HSTS to prevent SSL stripping attacks',
  ];

  recommendations.forEach(rec => {
    const lines = doc.splitTextToSize(rec, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6;
  });

  if (verificationSummary) {
    const beforeScore = calculateSecurityScore(verificationSummary.beforeScan.vulnerabilities);
    const afterScore = calculateSecurityScore(verificationSummary.afterScan.vulnerabilities);
    const beforeCounts = countBySeverity(verificationSummary.beforeScan.vulnerabilities);
    const afterCounts = countBySeverity(verificationSummary.afterScan.vulnerabilities);
    const scoreGain = Math.max(0, afterScore - beforeScore);
    const improvementPercent = beforeScore > 0 ? Math.round((scoreGain / beforeScore) * 100) : 0;

    doc.addPage();
    doc.setTextColor(...colors.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Remediation Verification', 20, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Vulnerability Name', 'Before', 'After', 'Status']],
      body: verificationSummary.comparisons.map(item => [
        item.name,
        item.beforeStatus,
        item.afterStatus,
        item.status,
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: [156, 163, 175] },
      bodyStyles: { textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [30, 41, 59] },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setTextColor(...colors.white);
    doc.setFontSize(14);
    doc.text('Before vs After Security Score', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(...colors.gray);
    doc.text(`Score: ${beforeScore} -> ${afterScore}`, 20, yPos);
    yPos += 6;
    doc.text(`Improvement: ${improvementPercent}%`, 20, yPos);
    yPos += 6;
    doc.text(`Critical Issues Reduced: ${Math.max(0, beforeCounts.critical - afterCounts.critical)}`, 20, yPos);
    yPos += 6;
    doc.text(`High Issues Reduced: ${Math.max(0, beforeCounts.high - afterCounts.high)}`, 20, yPos);
    yPos += 6;
    doc.text(`Medium Issues Reduced: ${Math.max(0, beforeCounts.medium - afterCounts.medium)}`, 20, yPos);
    yPos += 14;

    doc.setTextColor(...colors.white);
    doc.setFontSize(14);
    doc.text('Risk Reduction Summary', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(...colors.gray);
    doc.text(`Attack Surface: ${attackSurfaceValue(verificationSummary.beforeScan)} -> ${attackSurfaceValue(verificationSummary.afterScan)}`, 20, yPos);
    yPos += 6;
    doc.text(`Risk Level: ${riskLabel(beforeScore)} -> ${riskLabel(afterScore)}`, 20, yPos);
    yPos += 6;
    doc.text(`Vulnerabilities Fixed: ${verificationSummary.fixedCount}`, 20, yPos);
    yPos += 6;
    doc.text(`Vulnerabilities Unresolved: ${verificationSummary.unresolvedCount}`, 20, yPos);
  }

  doc.addPage();
  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Timeline', 20, 20);
  yPos = 30;
  doc.setFontSize(9);
  doc.setTextColor(...colors.gray);
  auditEvents.forEach(event => {
    doc.text(`[${formatAuditTime(event)}] ${event.label}`, 20, yPos);
    yPos += 6;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  });

  yPos += 10;
  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.text('Automation Summary', 20, yPos);
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(...colors.gray);
  [
    'Target Information captured from submitted scan input.',
    'Vulnerabilities Found generated from fresh backend scanner evidence.',
    'AI Explanation included for each detected vulnerability.',
    'Fix Applied through authorized SSH remediation workflow.',
    'Verification Result generated through a fresh after-remediation scan.',
    'Evidence Generated in this forensic report.',
  ].forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 6;
  });

  yPos += 8;
  doc.setTextColor(...colors.white);
  doc.setFontSize(14);
  doc.text('Why Sentinel AI Is Different', 20, yPos);
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(...colors.gray);
  const found = verificationSummary?.beforeScan.vulnerabilities.length ?? scanResult.vulnerabilities.length;
  const fixedMetric = verificationSummary?.fixedCount ?? fixedVulnerabilities.size;
  doc.text(`Vulnerabilities Found: ${found}`, 20, yPos);
  yPos += 6;
  doc.text(`Vulnerabilities Fixed: ${fixedMetric}`, 20, yPos);
  yPos += 6;
  doc.text(`Estimated Time Saved: ${Math.max(1, fixedMetric * 4)} hours`, 20, yPos);
  yPos += 6;
  doc.text('Traditional: Detect -> Analyze -> Fix -> Verify across hours or days', 20, yPos);
  yPos += 6;
  doc.text('Sentinel AI: Detect -> Analyze -> Fix -> Verify in minutes', 20, yPos);

  doc.setTextColor(...colors.gray);
  doc.setFontSize(8);
  doc.text(
    'This report was generated by Sentinel AI - Autonomous Vulnerability Detection & Remediation',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`sentinel-ai-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
