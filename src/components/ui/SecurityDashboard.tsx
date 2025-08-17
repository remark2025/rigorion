import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Eye,
  Lock,
  Activity,
  TrendingUp,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

interface SecurityMetricCardProps {
  title: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  icon: React.ReactNode;
}

function SecurityMetricCard({ title, value, trend, severity, icon }: SecurityMetricCardProps) {
  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-red-500" />;
    if (trend === 'down') return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
    return null;
  };

  return (
    <Card className={`border ${getSeverityColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {getTrendIcon()}
            </div>
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SecurityDashboard() {
  const securityMonitor = useSecurityMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'hour' | 'day' | 'week'>('hour');

  const refreshSecurity = async () => {
    setIsRefreshing(true);
    try {
      await securityMonitor.flushIncidentReports();
      // Trigger re-assessment
      setTimeout(() => setIsRefreshing(false), 1000);
    } catch (error) {
      console.error('Failed to refresh security data:', error);
      setIsRefreshing(false);
    }
  };

  const securitySummary = securityMonitor.getSecuritySummary();
  const currentPeriod = securitySummary.periods[selectedPeriod];

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <ShieldX className="h-6 w-6 text-red-600" />;
      case 'high': return <ShieldAlert className="h-6 w-6 text-orange-600" />;
      case 'medium': return <ShieldAlert className="h-6 w-6 text-yellow-600" />;
      case 'low': return <ShieldCheck className="h-6 w-6 text-green-600" />;
      default: return <Shield className="h-6 w-6 text-gray-600" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIncidentTypeIcon = (type: string) => {
    switch (type) {
      case 'csp_violation': return <Shield className="h-4 w-4" />;
      case 'xss_attempt': return <AlertTriangle className="h-4 w-4" />;
      case 'unauthorized_access': return <Lock className="h-4 w-4" />;
      case 'suspicious_activity': return <Eye className="h-4 w-4" />;
      case 'data_breach_attempt': return <ShieldAlert className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Dashboard
          </h2>
          <p className="text-gray-600">Real-time security monitoring and threat detection</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSecurity}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => securityMonitor.toggleMonitoring(!securityMonitor.isMonitoring)}
          >
            <Settings className="h-4 w-4" />
            {securityMonitor.isMonitoring ? 'Pause' : 'Resume'}
          </Button>
          <Badge variant={securityMonitor.isMonitoring ? 'default' : 'secondary'}>
            {securityMonitor.isMonitoring ? 'Monitoring' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Risk Level Overview */}
      <Card className={`border-2 ${getRiskLevelColor(securityMonitor.riskLevel)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Risk Level</h3>
              <div className="flex items-center gap-3">
                {getRiskLevelIcon(securityMonitor.riskLevel)}
                <span className="text-2xl font-bold capitalize">
                  {securityMonitor.riskLevel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Based on recent security incidents and threat patterns
              </p>
            </div>
            {securityMonitor.queuedReports > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Queued Reports</p>
                <p className="text-2xl font-bold">{securityMonitor.queuedReports}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {(['hour', 'day', 'week'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            Last {period}
          </Button>
        ))}
      </div>

      {/* Security Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Security Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SecurityMetricCard
            title="Total Incidents"
            value={currentPeriod?.total || 0}
            severity={currentPeriod?.total > 10 ? 'high' : currentPeriod?.total > 5 ? 'medium' : 'low'}
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          
          <SecurityMetricCard
            title="CSP Violations"
            value={currentPeriod?.byType?.csp_violation || 0}
            severity={currentPeriod?.byType?.csp_violation > 5 ? 'high' : 'low'}
            icon={<Shield className="h-6 w-6" />}
          />
          
          <SecurityMetricCard
            title="Auth Failures"
            value={currentPeriod?.byType?.unauthorized_access || 0}
            severity={currentPeriod?.byType?.unauthorized_access > 3 ? 'critical' : 'low'}
            icon={<Lock className="h-6 w-6" />}
          />
          
          <SecurityMetricCard
            title="XSS Attempts"
            value={currentPeriod?.byType?.xss_attempt || 0}
            severity={currentPeriod?.byType?.xss_attempt > 0 ? 'critical' : 'low'}
            icon={<ShieldAlert className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incident Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                const count = currentPeriod?.[severity] || 0;
                const total = currentPeriod?.total || 1;
                const percentage = Math.round((count / total) * 100);
                
                return (
                  <div key={severity}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{severity}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${
                        severity === 'critical' ? '[&>div]:bg-red-500' :
                        severity === 'high' ? '[&>div]:bg-orange-500' :
                        severity === 'medium' ? '[&>div]:bg-yellow-500' :
                        '[&>div]:bg-green-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Incident Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securitySummary.topIncidentTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIncidentTypeIcon(type)}
                    <span className="text-sm font-medium">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {securitySummary.topIncidentTypes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No security incidents detected
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {securityMonitor.incidents.slice(0, 20).map((incident) => (
              <div key={incident.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getIncidentTypeIcon(incident.type)}
                    <div>
                      <h4 className="font-medium text-sm">
                        {incident.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(incident.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      incident.severity === 'critical' ? 'destructive' :
                      incident.severity === 'high' ? 'destructive' :
                      incident.severity === 'medium' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {incident.severity}
                  </Badge>
                </div>
                
                {incident.details && Object.keys(incident.details).length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-20 text-xs">
                      {JSON.stringify(incident.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
            
            {securityMonitor.incidents.length === 0 && (
              <div className="text-center py-8">
                <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No security incidents detected</p>
                <p className="text-sm text-gray-400">Your application is secure</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {securityMonitor.riskLevel !== 'low' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-yellow-700 space-y-2">
              {securityMonitor.riskLevel === 'critical' && (
                <>
                  <li>• Immediate investigation required - Critical security threats detected</li>
                  <li>• Consider temporarily restricting access until threats are resolved</li>
                  <li>• Review and update Content Security Policy</li>
                </>
              )}
              {securityMonitor.riskLevel === 'high' && (
                <>
                  <li>• Review recent security incidents and patterns</li>
                  <li>• Strengthen input validation and sanitization</li>
                  <li>• Monitor for unusual user behavior</li>
                </>
              )}
              {securityMonitor.riskLevel === 'medium' && (
                <>
                  <li>• Continue monitoring security metrics</li>
                  <li>• Review Content Security Policy compliance</li>
                  <li>• Ensure all security measures are properly configured</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}