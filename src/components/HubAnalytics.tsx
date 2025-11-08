import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Activity,
  Zap,
  BookOpen,
  ClipboardList,
  Settings
} from 'lucide-react';
import { Hub } from '../data/hubs';
import { Patient } from '../types/patient';
import { filterPatientsByHub, getHubStats } from '../utils/hubIntegration';

interface HubAnalyticsProps {
  hub: Hub;
  patients: Patient[];
  allHubs: Hub[];
}

export default function HubAnalytics({ hub, patients, allHubs }: HubAnalyticsProps) {
  // Calculate hub-specific analytics
  const hubAnalytics = useMemo(() => {
    const hubPatients = filterPatientsByHub(patients, hub.id);
    const stats = getHubStats(patients, hub.id);
    const patientCount = hubPatients.length;
    const activityScore = (stats?.totalPatients ?? 0) + (stats?.activeAppointments ?? 0) + (stats?.recentNotes ?? 0);

    // Calculate engagement rate
    const engagementRate = patientCount > 0 ? Math.min((activityScore / patientCount) * 100, 100) : 0;

    // Calculate activity distribution - should be loaded from API
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/hub-activity-distribution?hubId=${hubId})
    const activityDistribution = {
      functions: 0,
      resources: 0,
      notes: stats?.recentNotes ?? 0,
      questionnaires: 0,
      templates: 0
    };

    // Calculate performance metrics
    const totalActivity = Object.values(activityDistribution).reduce((sum, val) => sum + val, 0);
    const avgActivityPerPatient = patientCount > 0 ? totalActivity / patientCount : 0;

    // Patient demographics - should be loaded from API
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/hub-demographics?hubId=${hubId})
    const demographics = {
      ageGroups: {
        '18-30': 0,
        '31-50': 0,
        '51-70': 0,
        '71+': 0
      },
      conditions: hubPatients.slice(0, 5).map(p => p.condition) // Use actual patient data
    };

    // Documentation status - should be loaded from API
    // TODO: Load from API endpoint (e.g., /api/v1/analytics/hub-documentation-status?hubId=${hubId})
    const documentationStatus = {
      complete: 0,
      partial: 0,
      incomplete: 0
    };

    return {
      patientCount,
      activeAppointments: stats?.activeAppointments ?? 0,
      recentNotes: stats?.recentNotes ?? 0,
      activityScore,
      engagementRate,
      activityDistribution,
      totalActivity,
      avgActivityPerPatient,
      demographics,
      documentationStatus,
      performanceScore: Math.min(Math.round(engagementRate * 0.8 + (avgActivityPerPatient * 10)), 100)
    };
  }, [hub, patients]);

  // Calculate overview analytics for comparison
  const overviewAnalytics = useMemo(() => {
    const allHubPatients = allHubs.flatMap(h => filterPatientsByHub(patients, h.id));
    const totalPatients = allHubPatients.length;

    const topPerformingHubs = allHubs
      .map(h => {
        const hPatients = filterPatientsByHub(patients, h.id);
        const stats = getHubStats(patients, h.id);
        const activityScore = (stats?.totalPatients ?? 0) + (stats?.activeAppointments ?? 0) + (stats?.recentNotes ?? 0);
        const engagementRate = hPatients.length > 0 ? Math.min((activityScore / hPatients.length) * 100, 100) : 0;

        return {
          hub: h,
          score: Math.min(Math.round(engagementRate * 0.8 + ((activityScore / Math.max(hPatients.length, 1)) * 10)), 100)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      totalPatients,
      totalAppointments: allHubs.reduce((sum, h) => sum + (getHubStats(patients, h.id)?.activeAppointments ?? 0), 0),
      totalNotes: allHubs.reduce((sum, h) => sum + (getHubStats(patients, h.id)?.recentNotes ?? 0), 0),
      totalHubs: allHubs.length,
      topPerformingHubs
    };
  }, [allHubs, patients]);

  // Generate insights and recommendations
  const insights = useMemo(() => {
    const recommendations = [];

    if (hubAnalytics.engagementRate < 50) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        message: 'Low patient engagement detected. Consider increasing appointment frequency and follow-up communications.',
        action: 'Schedule more follow-ups'
      });
    }

    if (hubAnalytics.documentationStatus.incomplete > hubAnalytics.patientCount * 0.2) {
      recommendations.push({
        type: 'documentation',
        priority: 'medium',
        message: 'Many patient records are incomplete. Focus on completing medical histories and treatment plans.',
        action: 'Complete patient documentation'
      });
    }

    if (hubAnalytics.activityDistribution.templates < 3) {
      recommendations.push({
        type: 'templates',
        priority: 'low',
        message: 'Limited consultation templates available. Create specialty-specific templates to improve efficiency.',
        action: 'Create consultation templates'
      });
    }

    return recommendations;
  }, [hubAnalytics]);

  return (
    <div className="space-y-6">
      {/* Hub Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {hubAnalytics.performanceScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Performance Score</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {hubAnalytics.engagementRate.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {hubAnalytics.totalActivity}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Activity</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {hubAnalytics.avgActivityPerPatient.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Activity/Patient</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Distribution Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-teal-600 dark:text-teal-400" />
          Activity Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(hubAnalytics.activityDistribution).map(([key, value]) => {
            const icons = {
              functions: Zap,
              resources: BookOpen,
              notes: FileText,
              questionnaires: ClipboardList,
              templates: Settings
            };
            const IconComponent = icons[key as keyof typeof icons];

            return (
              <div key={key} className="text-center">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-2">
                  <IconComponent className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Patient Demographics</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Age Groups</span>
              </div>
              {Object.entries(hubAnalytics.demographics.ageGroups).map(([ageGroup, count]) => (
                <div key={ageGroup} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{ageGroup} years</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Documentation Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600 dark:text-green-400">Complete</span>
              <span className="text-sm font-medium">{hubAnalytics.documentationStatus.complete}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600 dark:text-yellow-400">Partial</span>
              <span className="text-sm font-medium">{hubAnalytics.documentationStatus.partial}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 dark:text-red-400">Incomplete</span>
              <span className="text-sm font-medium">{hubAnalytics.documentationStatus.incomplete}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
            Insights & Recommendations
          </h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.priority === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : insight.priority === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    insight.priority === 'high'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : insight.priority === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  }`}>
                    <TrendingUp size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {insight.message}
                    </p>
                    <button className="text-sm px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {insight.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison with Other Hubs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Hub Comparison</h3>
        <div className="space-y-3">
          {overviewAnalytics.topPerformingHubs.map((item, index) => (
            <div
              key={item.hub.id}
              className={`p-4 rounded-lg border transition-colors ${
                item.hub.id === hub.id
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{item.hub.name}</span>
                  {item.hub.id === hub.id && (
                    <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded">
                      Current Hub
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{item.score}</div>
                  <div className="text-xs text-gray-500">Performance Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
