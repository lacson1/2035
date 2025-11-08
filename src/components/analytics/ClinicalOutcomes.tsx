import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { chartColors, chartThemes, processChartData } from '../../utils/chartUtils';

interface ClinicalOutcomesProps {
  className?: string;
}

interface OutcomeData {
  month: string;
  recoveryRate: number;
  readmissionRate: number;
  patientSatisfaction: number;
  treatmentEfficacy: number;
  avgLengthOfStay: number;
  mortalityRate: number;
}

interface QualityMetric {
  name: string;
  current: number;
  target: number;
  benchmark: number;
  trend: number;
  unit: string;
}

const ClinicalOutcomes: React.FC<ClinicalOutcomesProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '2y'>('1y');
  const [isLoading, setIsLoading] = useState(false);

  // Clinical outcome data - should be loaded from API
  const outcomeData: OutcomeData[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/clinical-outcomes?range=${timeRange})
    return [];
  }, [timeRange]);

  // Quality metrics with targets and benchmarks - should be loaded from API
  const qualityMetrics: QualityMetric[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/quality-metrics)
    return [];
  }, []);

  // Calculate key performance indicators
  const kpis = useMemo(() => {
    const latestData = outcomeData[outcomeData.length - 1];
    const previousData = outcomeData[outcomeData.length - 2] || outcomeData[outcomeData.length - 1];

    return [
      {
        title: 'Recovery Rate',
        value: `${latestData?.recoveryRate || 0}%`,
        change: processChartData.calculateTrend(latestData?.recoveryRate || 0, previousData?.recoveryRate || 0),
        icon: <CheckCircle size={24} className="text-white" />,
        color: 'bg-green-500',
        status: 'good',
      },
      {
        title: 'Readmission Rate',
        value: `${latestData?.readmissionRate || 0}%`,
        change: processChartData.calculateTrend(latestData?.readmissionRate || 0, previousData?.readmissionRate || 0),
        icon: <AlertCircle size={24} className="text-white" />,
        color: 'bg-red-500',
        status: 'warning',
      },
      {
        title: 'Patient Satisfaction',
        value: `${latestData?.patientSatisfaction || 0}/5.0`,
        change: processChartData.calculateTrend(latestData?.patientSatisfaction || 0, previousData?.patientSatisfaction || 0),
        icon: <Award size={24} className="text-white" />,
        color: 'bg-blue-500',
        status: 'good',
      },
      {
        title: 'Treatment Efficacy',
        value: `${latestData?.treatmentEfficacy || 0}%`,
        change: processChartData.calculateTrend(latestData?.treatmentEfficacy || 0, previousData?.treatmentEfficacy || 0),
        icon: <Target size={24} className="text-white" />,
        color: 'bg-purple-500',
        status: 'good',
      },
    ];
  }, [outcomeData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey.includes('Rate') || entry.dataKey.includes('Efficacy') ? '%' :
               entry.dataKey.includes('Satisfaction') ? '/5.0' :
               entry.dataKey.includes('Stay') ? ' days' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const QualityTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current: {data.current}{data.unit}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Target: {data.target}{data.unit}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Benchmark: {data.benchmark}{data.unit}
          </p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clinical Outcomes</h2>
          <p className="text-gray-600 dark:text-gray-400">Track patient recovery rates, satisfaction, and quality metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Range:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['6m', '1y', '2y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {range === '6m' ? '6 Months' : range === '1y' ? '1 Year' : '2 Years'}
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
                  kpi.change >= 0 && kpi.status === 'good' ? 'text-green-600 dark:text-green-400' :
                  kpi.change < 0 && kpi.status === 'warning' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {kpi.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
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
        {/* Recovery and Readmission Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recovery & Readmission Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="recoveryRate" fill={chartColors.success} name="Recovery Rate (%)" />
              <Line yAxisId="right" type="monotone" dataKey="readmissionRate" stroke={chartColors.danger} strokeWidth={3} name="Readmission Rate (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Satisfaction and Treatment Efficacy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Satisfaction & Efficacy Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="patientSatisfaction"
                stroke={chartColors.primary}
                strokeWidth={3}
                name="Patient Satisfaction (/5.0)"
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="treatmentEfficacy"
                stroke={chartColors.secondary}
                strokeWidth={3}
                name="Treatment Efficacy (%)"
                dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Metrics Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quality Metrics vs Targets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityMetrics} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                width={120}
              />
              <Tooltip content={<QualityTooltip />} />
              <Legend />
              <Bar dataKey="current" fill={chartColors.primary} name="Current" />
              <Bar dataKey="target" fill={chartColors.secondary} name="Target" />
              <Bar dataKey="benchmark" fill={chartColors.neutral} name="Benchmark" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Length of Stay and Mortality */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Length of Stay & Mortality</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgLengthOfStay"
                stackId="1"
                stroke={chartColors.warning}
                fill={chartColors.warning}
                fillOpacity={0.6}
                name="Avg Length of Stay (days)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="mortalityRate"
                stackId="2"
                stroke={chartColors.danger}
                fill={chartColors.danger}
                fillOpacity={0.6}
                name="Mortality Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality Metrics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detailed Quality Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Benchmark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {qualityMetrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {metric.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {metric.current}{metric.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {metric.target}{metric.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {metric.benchmark}{metric.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center ${
                      metric.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="ml-1">{Math.abs(metric.trend).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      metric.current >= metric.target
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : metric.current >= metric.benchmark
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {metric.current >= metric.target ? 'Exceeding' :
                       metric.current >= metric.benchmark ? 'Meeting' : 'Below'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClinicalOutcomes;
