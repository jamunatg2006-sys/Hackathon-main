import type { Vulnerability, ScanStep, ScanResult } from '../types';

export const scanSteps: ScanStep[] = [
  { id: '1', name: 'DNS Enumeration', status: 'pending' },
  { id: '2', name: 'SSL Inspection', status: 'pending' },
  { id: '3', name: 'Security Header Analysis', status: 'pending' },
  { id: '4', name: 'Open Port Discovery', status: 'pending' },
  { id: '5', name: 'Subdomain Enumeration', status: 'pending' },
  { id: '6', name: 'Web Application Security Checks', status: 'pending' },
  { id: '7', name: 'Technology Fingerprinting', status: 'pending' },
];

export const mockVulnerabilities: Vulnerability[] = [
  {
    id: 'vuln-1',
    name: 'Missing Content-Security-Policy Header',
    severity: 'high',
    cvss: 7.5,
    affectedAsset: 'HTTP Headers',
    description: 'The application does not implement Content-Security-Policy headers, leaving it vulnerable to cross-site scripting (XSS) attacks and data injection attacks.',
    recommendedFix: 'Add Content-Security-Policy header to all HTTP responses with appropriate directives.',
    aiExplanation: {
      whatWasFound: 'The Content-Security-Policy (CSP) header is missing from all HTTP responses. This header acts as a powerful security mechanism that helps prevent XSS attacks, clickjacking, and other code injection attacks by specifying which dynamic resources are allowed to load.',
      whyItMatters: 'Without CSP, attackers can inject malicious scripts into your web pages. This could lead to session hijacking, credential theft, malware distribution, or defacement of your website. For financial or healthcare applications, this could result in regulatory penalties and loss of customer trust.',
      riskLevel: 'High - Active exploitation can lead to complete account compromise',
      suggestedFix: [
        'Add the CSP header to your web server configuration',
        'Start with a restrictive policy: default-src \'self\'',
        'Gradually add directives for specific resource types',
        'Test thoroughly in report-only mode first',
        'Monitor CSP violation reports for legitimate resource needs'
      ]
    },
    remediationSteps: [
      {
        id: 'step-1-1',
        action: 'Add Content-Security-Policy header to nginx configuration',
        fileToModify: '/etc/nginx/nginx.conf',
        command: 'add_header Content-Security-Policy "default-src \'self\'; script-src \'self\'; style-src \'self\';"',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-1-2',
        action: 'Reload nginx to apply changes',
        command: 'sudo nginx -s reload',
        impact: 'low',
        estimatedTime: '30 seconds'
      }
    ]
  },
  {
    id: 'vuln-2',
    name: 'Missing HTTP Strict Transport Security (HSTS)',
    severity: 'medium',
    cvss: 6.5,
    affectedAsset: 'HTTP Headers',
    description: 'The server does not send the HSTS header, allowing potential man-in-the-middle attacks through SSL stripping.',
    recommendedFix: 'Enable HSTS with a minimum of 6-month max-age and include subdomains directive.',
    aiExplanation: {
      whatWasFound: 'HTTP Strict Transport Security (HSTS) is not configured. This security header tells browsers to only communicate with your server over HTTPS, preventing downgrade attacks.',
      whyItMatters: 'Without HSTS, attackers on the same network can intercept and modify traffic between users and your server. This is particularly dangerous on public WiFi networks where SSL stripping attacks are common.',
      riskLevel: 'Medium - Requires attacker to be in the network path',
      suggestedFix: [
        'Add Strict-Transport-Security header with max-age of at least 31536000 seconds (1 year)',
        'Include the includeSubDomains directive',
        'Consider preload directive for browser HSTS lists',
        'Ensure your SSL certificate is valid and properly configured'
      ]
    },
    remediationSteps: [
      {
        id: 'step-2-1',
        action: 'Add HSTS header to nginx configuration',
        fileToModify: '/etc/nginx/nginx.conf',
        command: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-2-2',
        action: 'Reload nginx service',
        command: 'sudo nginx -s reload',
        impact: 'low',
        estimatedTime: '30 seconds'
      }
    ]
  },
  {
    id: 'vuln-3',
    name: 'Open SSH Port (22) Exposed to Internet',
    severity: 'critical',
    cvss: 9.1,
    affectedAsset: 'Port 22/tcp',
    description: 'SSH service is accessible from the public internet without rate limiting or fail2ban protection, making it vulnerable to brute force attacks.',
    recommendedFix: 'Implement fail2ban, change default SSH port, use key-based authentication only, and restrict access by IP.',
    aiExplanation: {
      whatWasFound: 'SSH port 22 is openly accessible from the internet without any access controls or brute force protection. Scanners detect thousands of login attempts daily from automated botnets.',
      whyItMatters: 'Exposed SSH is the #1 entry point for server compromises. Credential stuffing, brute force, and zero-day exploits can give attackers full system access. Once compromised, your server becomes part of botnet operations or ransomware targets.',
      riskLevel: 'Critical - Direct path to complete system compromise',
      suggestedFix: [
        'Install and configure fail2ban for SSH protection',
        'Disable password authentication, require SSH keys only',
        'Change default SSH port to a non-standard port',
        'Restrict SSH access to specific IP addresses using firewall rules',
        'Set up 2FA for SSH authentication',
        'Disable root login via SSH'
      ]
    },
    remediationSteps: [
      {
        id: 'step-3-1',
        action: 'Install fail2ban',
        command: 'sudo apt-get install -y fail2ban',
        impact: 'low',
        estimatedTime: '2 minutes'
      },
      {
        id: 'step-3-2',
        action: 'Configure fail2ban jail for SSH',
        fileToModify: '/etc/fail2ban/jail.local',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-3-3',
        action: 'Disable password authentication in SSH config',
        fileToModify: '/etc/ssh/sshd_config',
        command: 'PasswordAuthentication no',
        impact: 'high',
        estimatedTime: '10 minutes'
      },
      {
        id: 'step-3-4',
        action: 'Restart SSH and fail2ban services',
        command: 'sudo systemctl restart sshd fail2ban',
        impact: 'medium',
        estimatedTime: '1 minute'
      }
    ]
  },
  {
    id: 'vuln-4',
    name: 'Weak TLS Configuration (TLS 1.0/1.1 Enabled)',
    severity: 'high',
    cvss: 8.0,
    affectedAsset: 'SSL/TLS Configuration',
    description: 'The server supports deprecated TLS 1.0 and TLS 1.1 protocols which have known cryptographic weaknesses.',
    recommendedFix: 'Disable TLS 1.0 and 1.1, ensure only TLS 1.2 and 1.3 are enabled.',
    aiExplanation: {
      whatWasFound: 'Your server accepts connections using outdated TLS 1.0 and TLS 1.1 protocols. These protocols have known vulnerabilities including BEAST, POODLE, and padding oracle attacks.',
      whyItMatters: 'Weak TLS allows attackers to decrypt sensitive data in transit, including passwords, credit cards, and personal information. Regulatory standards (PCI-DSS) require TLS 1.2 or higher.',
      riskLevel: 'High - Can lead to data interception and decryption',
      suggestedFix: [
        'Disable TLSv1.0 and TLSv1.1 in web server configuration',
        'Enable only TLSv1.2 and TLSv1.3',
        'Configure strong cipher suites (ECDHE, AES-GCM)',
        'Update SSL certificates to at least 2048-bit RSA or use ECDSA',
        'Test configuration with SSL Labs'
      ]
    },
    remediationSteps: [
      {
        id: 'step-4-1',
        action: 'Update nginx SSL configuration to disable TLS 1.0/1.1',
        fileToModify: '/etc/nginx/conf.d/ssl.conf',
        command: 'ssl_protocols TLSv1.2 TLSv1.3;',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-4-2',
        action: 'Configure modern cipher suites',
        fileToModify: '/etc/nginx/conf.d/ssl.conf',
        command: 'ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-4-3',
        action: 'Reload nginx',
        command: 'sudo nginx -s reload',
        impact: 'low',
        estimatedTime: '30 seconds'
      }
    ]
  },
  {
    id: 'vuln-5',
    name: 'Exposed Admin Endpoint',
    severity: 'critical',
    cvss: 10.0,
    affectedAsset: '/admin/login',
    description: 'Administrative login page is publicly accessible without IP restriction or 2FA, presenting a high-value attack target.',
    recommendedFix: 'Restrict admin access to trusted IPs, implement 2FA, and move to non-standard URL path.',
    aiExplanation: {
      whatWasFound: 'The administration panel at /admin/login is publicly accessible. No IP restrictions, rate limiting, or multi-factor authentication is enabled.',
      whyItMatters: 'Admin panels are prime targets for attackers. A single compromised admin account can lead to complete system takeover, data exfiltration, or server destruction. Many breaches start with brute-forced admin credentials.',
      riskLevel: 'Critical - Attackers actively target admin panels',
      suggestedFix: [
        'Restrict admin panel access using firewall rules to specific IPs',
        'Implement rate limiting on login attempts',
        'Add multi-factor authentication for admin accounts',
        'Change admin URL to a non-obvious path',
        'Add CAPTCHA to login form',
        'Implement session timeout and IP binding'
      ]
    },
    remediationSteps: [
      {
        id: 'step-5-1',
        action: 'Restrict /admin path to trusted IPs',
        fileToModify: '/etc/nginx/sites-enabled/default',
        command: 'allow 10.0.0.0/8; deny all;',
        impact: 'high',
        estimatedTime: '10 minutes'
      },
      {
        id: 'step-5-2',
        action: 'Enable rate limiting for admin login',
        fileToModify: '/etc/nginx/nginx.conf',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-5-3',
        action: 'Reload nginx',
        command: 'sudo nginx -s reload',
        impact: 'low',
        estimatedTime: '30 seconds'
      }
    ]
  },
  {
    id: 'vuln-6',
    name: 'Outdated Software Version (nginx 1.18.0)',
    severity: 'medium',
    cvss: 5.5,
    affectedAsset: 'Web Server',
    description: 'The nginx web server version 1.18.0 has known vulnerabilities and should be updated to the latest stable release.',
    recommendedFix: 'Upgrade nginx to the latest stable version using system package manager.',
    aiExplanation: {
      whatWasFound: 'nginx version 1.18.0 is installed. This version has several published security advisories and is multiple releases behind the current stable version.',
      whyItMatters: 'Outdated software contains unpatched vulnerabilities that attackers can exploit. Security patches in newer versions address known exploits that are actively used in the wild.',
      riskLevel: 'Medium - Known vulnerabilities may be exploitable',
      suggestedFix: [
        'Check current nginx version and available updates',
        'Backup current configuration before upgrade',
        'Update nginx to latest stable version',
        'Verify configuration compatibility after update',
        'Monitor logs after update for any issues'
      ]
    },
    remediationSteps: [
      {
        id: 'step-6-1',
        action: 'Backup current nginx configuration',
        command: 'sudo cp -r /etc/nginx /etc/nginx.backup',
        impact: 'low',
        estimatedTime: '1 minute'
      },
      {
        id: 'step-6-2',
        action: 'Update nginx to latest version',
        command: 'sudo apt-get update && sudo apt-get upgrade nginx',
        impact: 'medium',
        estimatedTime: '5 minutes'
      },
      {
        id: 'step-6-3',
        action: 'Restart nginx and verify',
        command: 'sudo systemctl restart nginx && sudo nginx -v',
        impact: 'low',
        estimatedTime: '2 minutes'
      }
    ]
  }
];

export const generateMockScanResult = (domain: string): ScanResult => {
  return {
    id: `scan-${Date.now()}`,
    domain,
    timestamp: new Date(),
    vulnerabilities: mockVulnerabilities,
    securityScore: 42,
    openPorts: [22, 80, 443, 8080],
    subdomains: [
      domain,
      `api.${domain}`,
      `mail.${domain}`,
      `admin.${domain}`,
      `dev.${domain}`,
    ],
    technologies: [
      'nginx 1.18.0',
      'PHP 7.4.3',
      'MySQL 8.0',
      'Ubuntu 20.04 LTS',
      'WordPress 5.9',
    ],
    scanSteps: scanSteps.map(step => ({
      ...step,
      status: 'completed' as const,
      duration: Math.floor(Math.random() * 3000) + 500
    }))
  };
};

export const remediationLogs = [
  { timestamp: new Date(), message: 'Connecting via SSH...', type: 'info' as const },
  { timestamp: new Date(), message: 'Authentication successful', type: 'success' as const },
  { timestamp: new Date(), message: 'Backing up configuration files...', type: 'info' as const },
  { timestamp: new Date(), message: 'Configuration backup completed', type: 'success' as const },
  { timestamp: new Date(), message: 'Applying security updates...', type: 'info' as const },
  { timestamp: new Date(), message: 'Updating nginx configuration...', type: 'info' as const },
  { timestamp: new Date(), message: 'Content-Security-Policy header added', type: 'success' as const },
  { timestamp: new Date(), message: 'HSTS header enabled', type: 'success' as const },
  { timestamp: new Date(), message: 'TLS 1.0/1.1 disabled, TLS 1.2/1.3 only', type: 'success' as const },
  { timestamp: new Date(), message: 'fail2ban installed and configured', type: 'success' as const },
  { timestamp: new Date(), message: 'Restarting services...', type: 'warning' as const },
  { timestamp: new Date(), message: 'nginx restarted successfully', type: 'success' as const },
  { timestamp: new Date(), message: 'fail2ban service started', type: 'success' as const },
  { timestamp: new Date(), message: 'Running verification checks...', type: 'info' as const },
  { timestamp: new Date(), message: 'All security headers verified', type: 'success' as const },
  { timestamp: new Date(), message: 'SSH configuration verified', type: 'success' as const },
  { timestamp: new Date(), message: 'Remediation completed successfully!', type: 'success' as const },
];
