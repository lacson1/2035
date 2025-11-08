import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Users,
  Calendar,
  Activity,
  Zap,
  FileText,
  BookOpen,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  ClipboardList,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Pill
} from 'lucide-react';
import { Hub } from '../data/hubs';
import { Patient } from '../types/patient';
import { filterPatientsByHub, getHubStats } from '../utils/hubIntegration';
import { getHubConditions, getHubTreatments } from '../utils/hubConditions';
import { getQuestionnairesByHub } from '../data/questionnaires';
import HubAnalytics from './HubAnalytics';

interface HubDetailViewProps {
  hub: Hub;
  patients: Patient[];
  allHubs: Hub[];
  onBack: () => void;
  activeTab: "overview" | "functions" | "notes" | "resources" | "team" | "stats" | "questionnaires" | "templates" | "surgical-notes";
  onTabChange: (tab: "overview" | "functions" | "notes" | "resources" | "team" | "stats" | "questionnaires" | "templates" | "surgical-notes") => void;
}

export default function HubDetailView({
  hub,
  patients,
  allHubs,
  onBack,
  activeTab,
  onTabChange
}: HubDetailViewProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    patients: false,
    conditions: false,
    treatments: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate hub statistics
  const hubPatients = useMemo(() => filterPatientsByHub(patients, hub.id), [patients, hub.id]);
  const stats = useMemo(() => getHubStats(patients, hub.id), [patients, hub.id]);
  const conditions = useMemo(() => getHubConditions(hub.id), [hub.id]);
  const treatments = useMemo(() => getHubTreatments(hub.id), [hub.id]);
  const availableQuestionnaires = useMemo(() => getQuestionnairesByHub(hub.id), [hub.id]);

  const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "functions", label: "Functions", icon: Zap },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "stats", label: "Stats", icon: Activity },
    { id: "questionnaires", label: "Questionnaires", icon: ClipboardList },
    { id: "templates", label: "Templates", icon: Settings }
  ] as const;

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case 'cardiology':
      case 'cardiovascular':
        return Heart;
      case 'neurology':
        return Brain;
      case 'orthopedics':
      case 'orthopedic':
        return Bone;
      case 'internal medicine':
      case 'general medicine':
        return Stethoscope;
      default:
        return Pill;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
      {/* Hub Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Hubs
        </button>
        <div className="flex items-center gap-3">
          {hub.specialties.map((specialty, index) => {
            const IconComponent = getSpecialtyIcon(specialty);
            return (
              <span key={specialty} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                <IconComponent size={14} />
                {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Hub Title and Description */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {hub.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {hub.description}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {hubPatients.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Patients</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.activeAppointments ?? 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Appointments</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-500" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.recentNotes ?? 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Clinical Notes</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-orange-500" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {(stats?.totalPatients ?? 0) + (stats?.activeAppointments ?? 0) + (stats?.recentNotes ?? 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Activity Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patients Section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleSection('patients')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users size={20} className="text-blue-500" />
                  Patients ({hubPatients.length})
                </h3>
                <span className={`transform transition-transform ${collapsedSections.patients ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {!collapsedSections.patients && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {hubPatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No patients currently assigned to this hub</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {hubPatients.slice(0, 12).map((patient) => (
                        <div key={patient.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Age: {patient.age} • MRN: {patient.mrn}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Condition: {patient.condition}
                          </div>
                        </div>
                      ))}
                      {hubPatients.length > 12 && (
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            +{hubPatients.length - 12} more patients
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Common Conditions */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleSection('conditions')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Heart size={20} className="text-red-500" />
                  Common Conditions ({conditions.length})
                </h3>
                <span className={`transform transition-transform ${collapsedSections.conditions ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {!collapsedSections.conditions && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {conditions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Heart size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No common conditions defined for this specialty</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {conditions.map((condition, index) => (
                        <div key={index} className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium text-center">
                          {condition}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Common Treatments */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleSection('treatments')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Pill size={20} className="text-green-500" />
                  Common Treatments ({treatments.length})
                </h3>
                <span className={`transform transition-transform ${collapsedSections.treatments ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {!collapsedSections.treatments && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {treatments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Pill size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No common treatments defined for this specialty</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {treatments.map((treatment, index) => (
                        <div key={index} className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium text-center">
                          {treatment}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Available Questionnaires */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList size={20} className="text-teal-500" />
                  Available Questionnaires ({availableQuestionnaires.length})
                </h3>
              </div>
              <div className="p-4">
                {availableQuestionnaires.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No questionnaires available for this specialty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableQuestionnaires.slice(0, 6).map((questionnaire) => (
                      <div key={questionnaire.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {questionnaire.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {questionnaire.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {questionnaire.estimatedTime} min • {questionnaire.questions.length} questions
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "functions" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hub Functions</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                <Plus size={16} />
                Add Function
              </button>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p>Custom functions for this hub will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Clinical Notes</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                <Plus size={16} />
                Add Note
              </button>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Clinical notes for this hub will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resources</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                <Plus size={16} />
                Add Resource
              </button>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>Resources for this hub will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <HubAnalytics
            hub={hub}
            patients={patients}
            allHubs={allHubs}
          />
        )}

        {activeTab === "questionnaires" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Questionnaires</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                <Plus size={16} />
                Start Assessment
              </button>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
              <p>Available questionnaires for this hub will appear here</p>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Consultation Templates</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                <Plus size={16} />
                Generate Template
              </button>
            </div>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <p>Generated templates for this hub will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
