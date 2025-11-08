import React, { useState } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Activity, Tabs, Tab } from 'lucide-react';
import PatientMetrics from './analytics/PatientMetrics';
import AppointmentAnalytics from './analytics/AppointmentAnalytics';
import ClinicalOutcomes from './analytics/ClinicalOutcomes';
import PerformanceDashboard from './analytics/PerformanceDashboard';

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments' | 'outcomes' | 'performance'>('overview');

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: BarChart3,
      description: 'Comprehensive analytics overview',
    },
    {
      id: 'patients' as const,
      label: 'Patient Metrics',
      icon: Users,
      description: 'Patient demographics and vital trends',
    },
    {
      id: 'appointments' as const,
      label: 'Appointments',
      icon: Calendar,
      description: 'Appointment scheduling and utilization',
    },
    {
      id: 'outcomes' as const,
      label: 'Clinical Outcomes',
      icon: TrendingUp,
      description: 'Treatment efficacy and quality metrics',
    },
    {
      id: 'performance' as const,
      label: 'Performance',
      icon: Activity,
      description: 'System and provider performance metrics',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6 border border-primary-200 dark:border-primary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Total Patients</p>
              <p className="text-3xl font-bold text-primary-900 dark:text-primary-100">1,247</p>
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">+12% from last month</p>
            </div>
            <Users size={32} className="text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Appointments</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">423</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">98% completion rate</p>
            </div>
            <Calendar size={32} className="text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Recovery Rate</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">87%</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">+5% from last quarter</p>
            </div>
            <TrendingUp size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">System Uptime</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">99.9%</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Last 30 days</p>
            </div>
            <Activity size={32} className="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Mini Charts Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Patient admissions</span>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">+24 today</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Appointments completed</span>
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">156 this week</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Lab results processed</span>
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">89 pending</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">System alerts</span>
              </div>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">3 active</span>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Performance Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Patient Satisfaction</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">4.6/5</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Treatment Efficacy</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-11/12"></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">92%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Staff Efficiency</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">87%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Resource Utilization</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">76%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to Detailed Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Explore Detailed Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('patients')}
            className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-left"
          >
            <Users size={20} className="text-primary-600 dark:text-primary-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Patient Metrics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vitals, demographics, trends</p>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <Calendar size={20} className="text-green-600 dark:text-green-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Appointments</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Scheduling, utilization</p>
          </button>

          <button
            onClick={() => setActiveTab('outcomes')}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <TrendingUp size={20} className="text-blue-600 dark:text-blue-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Clinical Outcomes</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recovery, quality metrics</p>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
          >
            <Activity size={20} className="text-purple-600 dark:text-purple-400 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Performance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">System & provider metrics</p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'patients' && <PatientMetrics />}
        {activeTab === 'appointments' && <AppointmentAnalytics />}
        {activeTab === 'outcomes' && <ClinicalOutcomes />}
        {activeTab === 'performance' && <PerformanceDashboard />}
      </div>
    </div>
  );
};

export default Analytics;
