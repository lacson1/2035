import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Calendar,
} from 'recharts';
import { Calendar as CalendarIcon, Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { chartColors, chartThemes, processChartData } from '../../utils/chartUtils';

interface AppointmentAnalyticsProps {
  className?: string;
}

interface AppointmentData {
  date: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

interface DepartmentData {
  department: string;
  appointments: number;
  utilization: number;
}

interface ProviderData {
  provider: string;
  appointments: number;
  satisfaction: number;
}

const AppointmentAnalytics: React.FC<AppointmentAnalyticsProps> = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Appointment data - should be loaded from API
  const appointmentData: AppointmentData[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/appointments?range=${timeRange})
    return [];
  }, [timeRange]);

  // Department utilization data - should be loaded from API
  const departmentData: DepartmentData[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/departments)
    return [];
  }, []);

  // Provider performance data - should be loaded from API
  const providerData: ProviderData[] = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/providers)
    return [];
  }, []);

  // Appointment status distribution - should be loaded from API
  const statusData = useMemo(() => {
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/appointment-status)
    return [];
  }, []);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalAppointments = statusData.reduce((sum, item) => sum + item.value, 0);
    const completedAppointments = statusData.find(item => item.name === 'Completed')?.value || 0;
    const scheduledAppointments = statusData.find(item => item.name === 'Scheduled')?.value || 0;
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const avgAppointmentsPerDay = totalAppointments > 0 ? Math.round(totalAppointments / 30) : 0;

    return [
      {
        title: 'Total Appointments',
        value: totalAppointments.toLocaleString(),
        change: 0,
        icon: <CalendarIcon size={24} className="text-white" />,
        color: 'bg-primary-500',
      },
      {
        title: 'Completion Rate',
        value: completionRate > 0 ? `${completionRate.toFixed(1)}%` : 'N/A',
        change: 0,
        icon: <CheckCircle size={24} className="text-white" />,
        color: 'bg-green-500',
      },
      {
        title: 'Avg Daily Appointments',
        value: avgAppointmentsPerDay.toString(),
        change: 0,
        icon: <Clock size={24} className="text-white" />,
        color: 'bg-blue-500',
      },
      {
        title: 'Pending Appointments',
        value: scheduledAppointments.toLocaleString(),
        change: 0,
        icon: <Users size={24} className="text-white" />,
        color: 'bg-orange-500',
      },
    ];
  }, [statusData]);

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
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const DepartmentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.department}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Appointments: {data.appointments}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Utilization: {data.utilization}%
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Appointment Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Track appointment scheduling, completion rates, and department utilization</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Range:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{metric.value}</p>
                <div className={`flex items-center mt-2 text-sm ${
                  metric.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.change >= 0 ? '↗' : '↘'}
                  <span className="ml-1">{Math.abs(metric.change).toFixed(1)}%</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      {appointmentData.length === 0 && departmentData.length === 0 && providerData.length === 0 && statusData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No appointment analytics data available. Data will appear here once loaded from the API.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Trends */}
          {appointmentData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appointment Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentData}>
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
              <Bar dataKey="completed" stackId="a" fill={chartColors.success} name="Completed" />
              <Bar dataKey="scheduled" stackId="a" fill={chartColors.primary} name="Scheduled" />
              <Bar dataKey="cancelled" stackId="a" fill={chartColors.warning} name="Cancelled" />
              <Bar dataKey="noShow" stackId="a" fill={chartColors.danger} name="No Show" />
            </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Appointment Status Distribution */}
          {statusData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appointment Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const total = statusData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {data.value} appointments ({percentage}%)
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

          {/* Department Utilization */}
          {departmentData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Department Utilization</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    stroke="#6b7280"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip content={<DepartmentTooltip />} />
                  <Bar
                    dataKey="utilization"
                    fill={chartColors.primary}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Provider Performance */}
          {providerData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Provider Performance</h3>
              <div className="space-y-4">
                {providerData.map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{provider.provider}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{provider.appointments} appointments</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {provider.satisfaction}/5.0
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">satisfaction</p>
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(provider.satisfaction / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentAnalytics;
