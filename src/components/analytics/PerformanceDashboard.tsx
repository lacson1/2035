import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Clock, Users, Zap, Server, TrendingUp } from 'lucide-react';
import { chartColors, chartThemes, processChartData } from '../../utils/chartUtils';

interface PerformanceDashboardProps {
  className?: string;
}

interface SystemMetrics {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

interface ProviderMetrics {
  provider: string;
  avgResponseTime: number;
  patientLoad: number;
  completionRate: number;
  satisfactionScore: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [isLoading, setIsLoading] = useState(false);

  // System performance data - should be loaded from API
  const systemMetrics: SystemMetrics[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/system-performance?range=${timeRange})
    return [];
  }, [timeRange]);

  // Provider performance data - should be loaded from API
  const providerMetrics: ProviderMetrics[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/provider-performance)
    return [];
  }, []);

  // System health indicators
  const systemHealth = useMemo(() => {
    const latest = systemMetrics[systemMetrics.length - 1] || {
      responseTime: 250,
      throughput: 95,
      errorRate: 1.2,
      cpuUsage: 55,
      memoryUsage: 65,
      uptime: 99.9,
    };

    return [
      {
        name: 'Response Time',
        value: latest.responseTime,
        unit: 'ms',
        status: latest.responseTime < 300 ? 'good' : latest.responseTime < 500 ? 'warning' : 'critical',
        target: 250,
      },
      {
        name: 'Throughput',
        value: latest.throughput,
        unit: 'req/min',
        status: latest.throughput > 80 ? 'good' : latest.throughput > 60 ? 'warning' : 'critical',
        target: 100,
      },
      {
        name: 'Error Rate',
        value: latest.errorRate,
        unit: '%',
        status: latest.errorRate < 2 ? 'good' : latest.errorRate < 5 ? 'warning' : 'critical',
        target: 1,
      },
      {
        name: 'CPU Usage',
        value: latest.cpuUsage,
        unit: '%',
        status: latest.cpuUsage < 70 ? 'good' : latest.cpuUsage < 85 ? 'warning' : 'critical',
        target: 60,
      },
      {
        name: 'Memory Usage',
        value: latest.memoryUsage,
        unit: '%',
        status: latest.memoryUsage < 75 ? 'good' : latest.memoryUsage < 90 ? 'warning' : 'critical',
        target: 70,
      },
      {
        name: 'Uptime',
        value: latest.uptime,
        unit: '%',
        status: latest.uptime > 99.5 ? 'good' : latest.uptime > 99 ? 'warning' : 'critical',
        target: 99.9,
      },
    ];
  }, [systemMetrics]);

  // Calculate key performance metrics
  const kpis = useMemo(() => {
    const avgResponseTime = systemMetrics.reduce((sum, m) => sum + m.responseTime, 0) / systemMetrics.length;
    const avgThroughput = systemMetrics.reduce((sum, m) => sum + m.throughput, 0) / systemMetrics.length;
    const avgErrorRate = systemMetrics.reduce((sum, m) => sum + m.errorRate, 0) / systemMetrics.length;
    const currentUptime = systemMetrics[systemMetrics.length - 1]?.uptime || 99.9;

    return [
      {
        title: 'Avg Response Time',
        value: `${avgResponseTime.toFixed(0)}ms`,
        change: -5.2,
        icon: <Clock size={24} className="text-white" />,
        color: 'bg-blue-500',
      },
      {
        title: 'System Throughput',
        value: `${avgThroughput.toFixed(0)} req/min`,
        change: 8.7,
        icon: <Activity size={24} className="text-white" />,
        color: 'bg-green-500',
      },
      {
        title: 'Error Rate',
        value: `${avgErrorRate.toFixed(2)}%`,
        change: -12.3,
        icon: <Zap size={24} className="text-white" />,
        color: 'bg-red-500',
      },
      {
        title: 'System Uptime',
        value: `${currentUptime.toFixed(1)}%`,
        change: 0.1,
        icon: <Server size={24} className="text-white" />,
        color: 'bg-purple-500',
      },
    ];
  }, [systemMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'critical': return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === 'responseTime' ? 'ms' :
               entry.dataKey === 'throughput' ? ' req/min' :
               entry.dataKey === 'errorRate' ? '%' :
               entry.dataKey.includes('Usage') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Performance Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor system performance, response times, and provider metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Range:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['1h', '24h', '7d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {range === '1h' ? '1 Hour' : range === '24h' ? '24 Hours' : '7 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpi.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  kpi.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  <TrendingUp size={16} className={kpi.change < 0 ? 'rotate-180' : ''} />
                  <span className="ml-1">{Math.abs(kpi.change).toFixed(1)}%</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">vs previous period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                stroke="#6b7280"
                fontSize={12}
                interval={timeRange === '7d' ? 23 : timeRange === '24h' ? 5 : 0}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke={chartColors.primary}
                strokeWidth={2}
                name="Response Time (ms)"
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke={chartColors.success}
                strokeWidth={2}
                name="Throughput (req/min)"
                dot={{ fill: chartColors.success, strokeWidth: 2, r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={systemMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                stroke="#6b7280"
                fontSize={12}
                interval={timeRange === '7d' ? 23 : timeRange === '24h' ? 5 : 0}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="cpuUsage"
                stackId="1"
                stroke={chartColors.warning}
                fill={chartColors.warning}
                fillOpacity={0.6}
                name="CPU Usage (%)"
              />
              <Area
                type="monotone"
                dataKey="memoryUsage"
                stackId="2"
                stroke={chartColors.secondary}
                fill={chartColors.secondary}
                fillOpacity={0.6}
                name="Memory Usage (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Health Indicators */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Health Indicators</h3>
          <div className="grid grid-cols-2 gap-4">
            {systemHealth.map((metric, index) => (
              <div key={index} className={`p-4 rounded-lg ${getStatusBg(metric.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.name}</h4>
                  <span className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((metric.value / metric.target) * 100, 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Target: {metric.target}{metric.unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Performance Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Provider Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={providerMetrics}>
              <PolarGrid />
              <PolarAngleAxis dataKey="provider" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} fontSize={10} />
              <Radar
                name="Satisfaction Score"
                dataKey="satisfactionScore"
                stroke={chartColors.primary}
                fill={chartColors.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Completion Rate (%)"
                dataKey="completionRate"
                stroke={chartColors.success}
                fill={chartColors.success}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detailed Provider Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {providerMetrics.map((provider, index) => {
                const performanceScore = (
                  (5 - provider.avgResponseTime / 3) * 0.3 +
                  (provider.patientLoad / 25) * 0.2 +
                  (provider.completionRate / 100) * 0.3 +
                  (provider.satisfactionScore / 5) * 0.2
                ) * 100;

                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {provider.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {provider.avgResponseTime} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {provider.patientLoad} patients
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {provider.completionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {provider.satisfactionScore}/5.0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              performanceScore >= 80 ? 'bg-green-500' :
                              performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(performanceScore, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {performanceScore.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
