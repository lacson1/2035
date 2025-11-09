import { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Patient } from '../types';

interface SimpleSearchPanelProps {
  patients: Patient[];
  onResultsChange: (results: Patient[]) => void;
}

export default function SimpleSearchPanel({ patients, onResultsChange }: SimpleSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique conditions
  const uniqueConditions = Array.from(
    new Set(patients.map(p => p.condition).filter(Boolean))
  ).sort();

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = patient.name?.toLowerCase().includes(query);
        const matchesCondition = patient.condition?.toLowerCase().includes(query);
        const matchesPhone = patient.phone?.toLowerCase().includes(query);
        const matchesEmail = patient.email?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesCondition && !matchesPhone && !matchesEmail) {
          return false;
        }
      }

      // Risk filter
      if (riskFilter !== 'all') {
        if (riskFilter === 'high' && patient.risk < 60) return false;
        if (riskFilter === 'medium' && (patient.risk < 40 || patient.risk >= 60)) return false;
        if (riskFilter === 'low' && patient.risk >= 40) return false;
      }

      // Condition filter
      if (conditionFilter !== 'all' && patient.condition !== conditionFilter) {
        return false;
      }

      return true;
    });
  }, [patients, searchQuery, riskFilter, conditionFilter]);

  // Update parent when filters change
  useEffect(() => {
    onResultsChange(filteredPatients);
  }, [filteredPatients, onResultsChange]);

  const hasActiveFilters = riskFilter !== 'all' || conditionFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setRiskFilter('all');
    setConditionFilter('all');
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">Search Patients</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {filteredPatients.length} of {patients.length} patients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, condition, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 pb-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Risk Level
              </label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk (≥60%)</option>
                <option value="medium">Medium Risk (40-59%)</option>
                <option value="low">Low Risk (&lt;40%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Condition
              </label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="all">All Conditions</option>
                {uniqueConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

