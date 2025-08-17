import { useState, useCallback, useEffect, useRef } from 'react';
import { useMetrics } from './useMetrics';
import { useErrorTracking } from './useErrorTracking';

interface SecurityIncident {
  id: string;
  type: 'csp_violation' | 'xss_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  details: Record<string, unknown>;
  userAgent: string;
  ip?: string;
  resolved: boolean;
}

interface SecurityMetrics {
  cspViolations: number;
  suspiciousRequests: number;
  authFailures: number;
  dataAccessAttempts: number;
  totalIncidents: number;
}

interface SecurityState {
  incidents: SecurityIncident[];
  metrics: SecurityMetrics;
  isMonitoring: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const MAX_INCIDENTS = 100;
const RISK_THRESHOLDS = {
  low: 0,
  medium: 5,
  high: 15,
  critical: 30,
};

export function useSecurityMonitor() {
  const metrics = useMetrics();
  const errorTracking = useErrorTracking();
  
  const [state, setState] = useState<SecurityState>({
    incidents: [],
    metrics: {
      cspViolations: 0,
      suspiciousRequests: 0,
      authFailures: 0,
      dataAccessAttempts: 0,
      totalIncidents: 0,
    },
    isMonitoring: true,
    riskLevel: 'low',
  });

  const reportQueue = useRef<SecurityIncident[]>([]);
  const lastRiskAssessment = useRef<number>(0);

  // Create security incident
  const createIncident = useCallback((
    type: SecurityIncident['type'],
    severity: SecurityIncident['severity'],
    details: Record<string, unknown>
  ): SecurityIncident => {
    return {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      severity,
      timestamp: new Date().toISOString(),
      details,
      userAgent: navigator.userAgent,
      resolved: false,
    };
  }, []);

  // Report security incident
  const reportIncident = useCallback((
    type: SecurityIncident['type'],
    severity: SecurityIncident['severity'],
    details: Record<string, unknown>
  ) => {
    if (!state.isMonitoring) return;

    const incident = createIncident(type, severity, details);
    
    console.warn(`[SecurityMonitor] ${severity.toUpperCase()} ${type}:`, details);
    
    setState(prev => {
      const newIncidents = [incident, ...prev.incidents].slice(0, MAX_INCIDENTS);
      const newMetrics = { ...prev.metrics };
      
      // Update metrics
      switch (type) {
        case 'csp_violation':
          newMetrics.cspViolations++;
          break;
        case 'unauthorized_access':
          newMetrics.authFailures++;
          break;
        case 'suspicious_activity':
          newMetrics.suspiciousRequests++;
          break;
        case 'data_breach_attempt':
          newMetrics.dataAccessAttempts++;
          break;
      }
      
      newMetrics.totalIncidents++;
      
      return {
        ...prev,
        incidents: newIncidents,
        metrics: newMetrics,
      };
    });

    // Send to monitoring systems
    metrics.incrementCounter('security_incidents', 1, { type, severity });
    errorTracking.trackError(
      new Error(`Security incident: ${type}`),
      'security',
      { type, severity, ...details }
    );

    // Queue for external reporting
    reportQueue.current.push(incident);
    
    // Immediate alert for critical incidents
    if (severity === 'critical') {
      handleCriticalIncident(incident);
    }
  }, [state.isMonitoring, createIncident, metrics, errorTracking]);

  // Handle critical security incidents
  const handleCriticalIncident = useCallback((incident: SecurityIncident) => {
    console.error('🚨 CRITICAL SECURITY INCIDENT:', incident);
    
    // Show user notification for critical incidents
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Security Alert', {
        body: 'Critical security incident detected. Please check the security dashboard.',
        icon: '/favicon.ico',
        tag: 'security-alert',
      });
    }
    
    // TODO: Send immediate alert to security team
    // This could be an API call to your security monitoring service
  }, []);

  // Assess current risk level
  const assessRiskLevel = useCallback(() => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    // Count recent incidents
    const recentIncidents = state.incidents.filter(
      incident => new Date(incident.timestamp).getTime() > oneHourAgo
    );
    
    const criticalCount = recentIncidents.filter(i => i.severity === 'critical').length;
    const highCount = recentIncidents.filter(i => i.severity === 'high').length;
    const totalRecent = recentIncidents.length;
    
    // Calculate risk score
    let riskScore = 0;
    riskScore += criticalCount * 10;
    riskScore += highCount * 3;
    riskScore += totalRecent;
    
    // Determine risk level
    let newRiskLevel: SecurityState['riskLevel'] = 'low';
    if (riskScore >= RISK_THRESHOLDS.critical) {
      newRiskLevel = 'critical';
    } else if (riskScore >= RISK_THRESHOLDS.high) {
      newRiskLevel = 'high';
    } else if (riskScore >= RISK_THRESHOLDS.medium) {
      newRiskLevel = 'medium';
    }
    
    setState(prev => ({ ...prev, riskLevel: newRiskLevel }));
    
    return newRiskLevel;
  }, [state.incidents]);

  // Monitor CSP violations
  const monitorCSPViolations = useCallback(() => {
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      reportIncident('csp_violation', 'medium', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    
    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, [reportIncident]);

  // Monitor suspicious network activity
  const monitorNetworkActivity = useCallback(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Check for suspicious requests
      if (url.includes('javascript:') || url.includes('data:')) {
        reportIncident('suspicious_activity', 'high', {
          attemptedURL: url,
          method: init?.method || 'GET',
          reason: 'Dangerous URL scheme',
        });
        throw new Error('Blocked suspicious request');
      }
      
      // Monitor for unusual request patterns
      const suspiciousPatterns = [
        /\/admin/i,
        /\/config/i,
        /\/debug/i,
        /\/system/i,
        /\.\./,
        /%2e%2e/i,
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        reportIncident('unauthorized_access', 'medium', {
          attemptedURL: url,
          method: init?.method || 'GET',
          reason: 'Suspicious path pattern',
        });
      }
      
      return originalFetch.call(this, input, init);
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [reportIncident]);

  // Monitor local storage access
  const monitorStorageAccess = useCallback(() => {
    const sensitiveKeys = ['token', 'auth', 'session', 'key', 'secret'];
    
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    localStorage.setItem = function(key: string, value: string) {
      const isSensitive = sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      );
      
      if (isSensitive) {
        reportIncident('data_breach_attempt', 'medium', {
          operation: 'localStorage.setItem',
          key,
          reason: 'Attempt to store sensitive data in localStorage',
        });
      }
      
      return originalSetItem.call(this, key, value);
    };
    
    localStorage.getItem = function(key: string) {
      const isSensitive = sensitiveKeys.some(sensitive => 
        key.toLowerCase().includes(sensitive)
      );
      
      if (isSensitive) {
        reportIncident('data_breach_attempt', 'low', {
          operation: 'localStorage.getItem',
          key,
          reason: 'Access to potentially sensitive data',
        });
      }
      
      return originalGetItem.call(this, key);
    };
    
    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    };
  }, [reportIncident]);

  // Monitor DOM mutations for XSS attempts
  const monitorDOMMutations = useCallback(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for script injections
            if (element.tagName === 'SCRIPT') {
              reportIncident('xss_attempt', 'critical', {
                reason: 'Script element injection detected',
                innerHTML: element.innerHTML.substring(0, 200),
              });
            }
            
            // Check for event handlers
            Array.from(element.attributes || []).forEach((attr) => {
              if (attr.name.startsWith('on')) {
                reportIncident('xss_attempt', 'high', {
                  reason: 'Event handler attribute detected',
                  attribute: attr.name,
                  value: attr.value.substring(0, 200),
                });
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    
    return () => observer.disconnect();
  }, [reportIncident]);

  // Flush incident reports
  const flushIncidentReports = useCallback(async () => {
    if (reportQueue.current.length === 0) return;
    
    const incidents = [...reportQueue.current];
    reportQueue.current = [];
    
    try {
      // Store locally
      const existingIncidents = JSON.parse(
        localStorage.getItem('security_incidents') || '[]'
      );
      existingIncidents.push(...incidents);
      
      // Keep only recent incidents in storage
      if (existingIncidents.length > 200) {
        existingIncidents.splice(0, existingIncidents.length - 200);
      }
      
      localStorage.setItem('security_incidents', JSON.stringify(existingIncidents));
      
      // TODO: Send to security monitoring service
      console.log(`📊 Reported ${incidents.length} security incidents`);
      
    } catch (error) {
      console.error('Failed to flush security incidents:', error);
      // Re-queue failed reports
      reportQueue.current.unshift(...incidents);
    }
  }, []);

  // Get security summary
  const getSecuritySummary = useCallback(() => {
    const now = Date.now();
    const periods = {
      hour: now - 60 * 60 * 1000,
      day: now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000,
    };
    
    const summary: Record<string, any> = {};
    
    Object.entries(periods).forEach(([period, timestamp]) => {
      const incidents = state.incidents.filter(
        incident => new Date(incident.timestamp).getTime() > timestamp
      );
      
      summary[period] = {
        total: incidents.length,
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        low: incidents.filter(i => i.severity === 'low').length,
        byType: incidents.reduce((acc, incident) => {
          acc[incident.type] = (acc[incident.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    });
    
    return {
      riskLevel: state.riskLevel,
      metrics: state.metrics,
      periods: summary,
      topIncidentTypes: Object.entries(
        state.incidents.reduce((acc, incident) => {
          acc[incident.type] = (acc[incident.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort(([, a], [, b]) => b - a).slice(0, 5),
    };
  }, [state]);

  // Toggle monitoring
  const toggleMonitoring = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isMonitoring: enabled }));
  }, []);

  // Initialize monitoring
  useEffect(() => {
    if (!state.isMonitoring) return;
    
    console.log('🔒 Starting security monitoring...');
    
    const cleanupFunctions = [
      monitorCSPViolations(),
      monitorNetworkActivity(),
      monitorStorageAccess(),
      monitorDOMMutations(),
    ];
    
    return () => {
      console.log('🔒 Stopping security monitoring...');
      cleanupFunctions.forEach(cleanup => cleanup?.());
    };
  }, [state.isMonitoring, monitorCSPViolations, monitorNetworkActivity, monitorStorageAccess, monitorDOMMutations]);

  // Periodic risk assessment
  useEffect(() => {
    const interval = setInterval(() => {
      assessRiskLevel();
      flushIncidentReports();
    }, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [assessRiskLevel, flushIncidentReports]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      flushIncidentReports();
    };
  }, [flushIncidentReports]);

  return {
    // Incident reporting
    reportIncident,
    
    // Data access
    incidents: state.incidents,
    metrics: state.metrics,
    riskLevel: state.riskLevel,
    getSecuritySummary,
    
    // Management
    toggleMonitoring,
    flushIncidentReports,
    
    // State
    isMonitoring: state.isMonitoring,
    queuedReports: reportQueue.current.length,
  };
}