import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Save, Clock, Users, Calendar, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdvancedSearch, SearchFilters, SearchResult } from '../hooks/useAdvancedSearch';
import { Patient } from '../types';
import { useToast } from '../context/ToastContext';

interface AdvancedSearchPanelProps {
  patients: Patient[];
  onResultsChange: (results: SearchResult[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  patients,
  onResultsChange,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const toast = useToast();
  const {
    filters,
    setFilters,
    searchResults,
    savedSearches,
    searchHistory,
    saveSearch,
    loadSearch,
    resetFilters,
    addToHistory,
    quickFilters,
    totalResults,
    hasActiveFilters,
  } = useAdvancedSearch(patients);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Update parent with search results
  useEffect(() => {
    onResultsChange(searchResults);
  }, [searchResults, onResultsChange]);

  // Add to search history when query changes
  useEffect(() => {
    if (filters.query.trim()) {
      addToHistory(filters.query);
    }
  }, [filters.query, addToHistory]);

  const handleSaveSearch = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the saved search');
      return;
    }

    saveSearch(saveName);
    setSaveName('');
    setShowSaveDialog(false);
    toast.success(`Search "${saveName}" saved successfully`);
  };

  const handleLoadSearch = (search: SearchFilters) => {
    loadSearch(search);
    setShowSaved(false);
    toast.success('Search loaded successfully');
  };

  const handleQuickFilter = (filterName: keyof typeof quickFilters) => {
    quickFilters[filterName]();
    toast.success(`${filterName.replace(/([A-Z])/g, ' $1').toLowerCase()} filter applied`);
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateAgeRange = (index: 0 | 1, value: number) => {
    setFilters(prev => ({
      ...prev,
      ageRange: index === 0
        ? [value, prev.ageRange[1]]
        : [prev.ageRange[0], value]
    }));
  };

  const toggleCondition = (condition: string) => {
    setFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const commonConditions = [
    'Hypertension', 'Diabetes', 'Asthma', 'COPD', 'Depression',
    'Anxiety', 'Arthritis', 'Heart Disease', 'Cancer', 'Obesity'
  ];

  const insuranceProviders = [
    'Blue Cross', 'Aetna', 'United Healthcare', 'Cigna', 'Medicare', 'Medicaid'
  ];

  return (
    <div className={`transition-all duration-300 ${
      isCollapsed ? 'h-14' : 'min-h-20'
    }`}>
      {/* Professional Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                Advanced Search
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Filter and find patients efficiently
              </p>
            </div>
          </div>

          {totalResults !== patients.length && (
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg px-3 py-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {totalResults} results
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasActiveFilters}
            title="Save Search"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-6 py-6 space-y-6">
          {/* Professional Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Search Patients
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Name, ID, condition, phone, or email..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
              />
            </div>
          </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent Searches</span>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {showHistory && (
                  <div className="max-h-40 overflow-y-auto">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => updateFilter('query', query)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{query}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Filters */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickFilter('recentVisits')}
                className="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Recent Visits
              </button>
              <button
                onClick={() => handleQuickFilter('highRisk')}
                className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                High Risk
              </button>
              <button
                onClick={() => handleQuickFilter('elderly')}
                className="px-4 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Elderly
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Age Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Age Range
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.ageRange[0]}
                    onChange={(e) => updateAgeRange(0, parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.ageRange[1]}
                    onChange={(e) => updateAgeRange(1, parseInt(e.target.value) || 120)}
                    className="w-20 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Risk Level
                </label>
                <select
                  value={filters.riskLevel}
                  onChange={(e) => updateFilter('riskLevel', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              {/* Insurance */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Insurance Provider
                </label>
                <select
                  value={filters.insurance || ''}
                  onChange={(e) => updateFilter('insurance', e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="">All Providers</option>
                  {insuranceProviders.map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sort Results
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  >
                    <option value="name">Name</option>
                    <option value="age">Age</option>
                    <option value="lastVisit">Last Visit</option>
                    <option value="risk">Risk Level</option>
                    <option value="condition">Condition</option>
                  </select>
                  <button
                    onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    title={filters.sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                  >
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Medical Conditions
              </label>
              <div className="flex flex-wrap gap-2">
                {commonConditions.map(condition => (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                      filters.conditions.includes(condition)
                        ? 'bg-slate-600 text-white border-slate-600 hover:bg-slate-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Saved Searches
                </label>
                <button
                  onClick={() => setShowSaved(!showSaved)}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:underline transition-colors"
                >
                  {showSaved ? 'Hide' : 'Show'} ({savedSearches.length})
                </button>
              </div>

              {showSaved && (
                <div className="space-y-3">
                  {savedSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex-1">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{search.name || `Search ${index + 1}`}</span>
                        {search.query && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">"{search.query}"</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleLoadSearch(search)}
                        className="px-4 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 hover:shadow-md active:scale-95"
                      >
                        Load Search
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Save className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Save Search</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Save this search configuration for future use</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., High Risk Elderly Patients"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveSearch}
                  disabled={!saveName.trim()}
                  className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-95 flex items-center justify-center"
                  title="Save Search"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchPanel;
