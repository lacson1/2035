import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users, Heart, Scale } from 'lucide-react';
import { chartColors, chartThemes, processChartData } from '../../utils/chartUtils';

interface PatientMetricsProps {
  className?: string;
}

interface VitalsData {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
}

interface DemographicsData {
  age: string;
  count: number;
  percentage: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const PatientMetrics: React.FC<PatientMetricsProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Vitals data - should be loaded from API
  const vitalsData: VitalsData[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/vitals?range=${timeRange})
    return [];
  }, [timeRange]);

  // Demographics data - should be loaded from API
  const demographicsData: DemographicsData[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/demographics)
    return [];
  }, []);

  // Patient status data - should be loaded from API
  const patientStatusData = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/patient-status)
    return [];
  }, []);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalPatients = 0; // TODO: Load from API
    const activePatients = 0; // TODO: Load from API
    const avgBloodPressure = vitalsData.length > 0
      ? vitalsData[vitalsData.length - 1].systolic + '/' + vitalsData[vitalsData.length - 1].diastolic
      : 'N/A';
    const avgHeartRate = vitalsData.length > 0
      ? Math.round(vitalsData.slice(-7).reduce((sum, d) => sum + d.heartRate, 0) / Math.min(7, vitalsData.length))
      : 0;

    return [
      {
        title: 'Total Patients',
        value: totalPatients.toLocaleString(),
        change: 0,
        icon: <Users size={24} className="text-white" />,
        color: 'bg-primary-500',
      },
      {
        title: 'Active Patients',
        value: activePatients.toLocaleString(),
        change: 0,
        icon: <Activity size={24} className="text-white" />,
        color: 'bg-green-500',
      },
      {
        title: 'Avg Blood Pressure',
        value: avgBloodPressure,
        change: 0,
        icon: <Heart size={24} className="text-white" />,
        color: 'bg-red-500',
      },
      {
        title: 'Avg Heart Rate',
        value: avgHeartRate > 0 ? `${avgHeartRate} bpm` : 'N/A',
        change: 0,
        icon: <Activity size={24} className="text-white" />,
        color: 'bg-blue-500',
      },
    ];
  }, [vitalsData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === 'heartRate' ? ' bpm' :
               entry.dataKey === 'temperature' ? '°F' :
               entry.dataKey === 'weight' ? ' lbs' : ''}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Patient Metrics</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor patient health trends and demographics</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Range:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Grid */}
      {vitalsData.length === 0 && demographicsData.length === 0 && patientStatusData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No patient metrics data available. Data will appear here once loaded from the API.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vitals Trends Chart */}
          {vitalsData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vitals Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitalsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke={chartColors.danger}
                strokeWidth={2}
                name="Systolic BP"
                dot={{ fill: chartColors.danger, strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke={chartColors.warning}
                strokeWidth={2}
                name="Diastolic BP"
                dot={{ fill: chartColors.warning, strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke={chartColors.primary}
                strokeWidth={2}
                name="Heart Rate"
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 3 }}
              />
            </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Demographics Chart */}
          {demographicsData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Patient Demographics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="age" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                            <p className="font-medium text-gray-900 dark:text-gray-100">Age: {label}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Count: {data.count} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Patient Status Distribution */}
          {patientStatusData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Patient Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {patientStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const total = patientStatusData.reduce((sum, item) => sum + item.value, 0);
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {data.value} patients ({total > 0 ? Math.round((data.value / total) * 100) : 0}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weight and Temperature Trends */}
          {vitalsData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Weight & Temperature Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stackId="1"
                    stroke={chartColors.secondary}
                    fill={chartColors.secondary}
                    fillOpacity={0.3}
                    name="Weight (lbs)"
                  />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stackId="2"
                    stroke={chartColors.warning}
                    fill={chartColors.warning}
                    fillOpacity={0.3}
                    name="Temperature (°F)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientMetrics;
