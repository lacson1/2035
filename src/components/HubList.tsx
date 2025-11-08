import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Building2,
  Users,
  Activity,
  Calendar,
  ArrowUpDown,
  CheckCircle2,
  CheckSquare,
  Square
} from 'lucide-react';
import HubBulkOperations from './HubBulkOperations';
import { Hub } from '../data/hubs';
import { getHubColorClass } from '../data/hubs';
import { filterPatientsByHub, getHubStats } from '../utils/hubIntegration';
import { Patient } from '../types/patient';

interface HubListProps {
  hubs: Hub[];
  patients: Patient[];
  selectedHub: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onHubSelect: (hubId: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  filters: {
    specialty: string;
    patientCount: string;
    activityLevel: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    specialty: string;
    patientCount: string;
    activityLevel: string;
  }>>;
  sortBy: "name" | "patients" | "activity" | "created";
  sortOrder: "asc" | "desc";
  setSortBy: (sort: "name" | "patients" | "activity" | "created") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  selectedHubIndex: number;
  setSelectedHubIndex: (index: number) => void;
  onClearFilters: () => void;
  // Bulk operations
  bulkModeEnabled?: boolean;
  selectedHubsForBulk?: string[];
  onBulkSelectionChange?: (hubIds: string[]) => void;
  onBulkModeToggle?: () => void;
  // Loading state
  isLoading?: boolean;
}

export default function HubList({
  hubs,
  patients,
  selectedHub,
  searchTerm,
  onSearchChange,
  onHubSelect,
  showAdvancedFilters,
  setShowAdvancedFilters,
  filters,
  setFilters,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  selectedHubIndex,
  setSelectedHubIndex,
  onClearFilters,
  bulkModeEnabled = false,
  selectedHubsForBulk = [],
  onBulkSelectionChange,
  onBulkModeToggle,
  isLoading = false
}: HubListProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort hubs
  const filteredHubs = useMemo(() => {
    // Safety check: if no hubs, return empty array
    if (!hubs || !Array.isArray(hubs) || hubs.length === 0) {
      console.warn('⚠️ HubList: No hubs received in props');
      return [];
    }
    
    console.log(`🔍 HubList: Filtering ${hubs.length} hubs`, { 
      hubsReceived: hubs.length,
      hubNames: hubs.map(h => h?.name || 'Unknown'),
      searchTerm, 
      filters 
    });
    
    let filtered = hubs.filter(hub => {
      // Safety checks for hub properties
      if (!hub || !hub.name) {
        console.warn('⚠️ HubList: Invalid hub found', hub);
        return false;
      }
      
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = hub.name?.toLowerCase().includes(searchLower) || false;
        const matchesDescription = hub.description?.toLowerCase().includes(searchLower) || false;
        const matchesSpecialty = hub.specialties?.some(s => s.toLowerCase().includes(searchLower)) || false;
        if (!matchesName && !matchesDescription && !matchesSpecialty) {
          return false;
        }
      }

      // Specialty filter
      if (filters.specialty !== "all") {
        if (!hub.specialties || !Array.isArray(hub.specialties) || !hub.specialties.includes(filters.specialty)) {
          return false;
        }
      }

      // Patient count filter
      if (filters.patientCount !== "all") {
        const hubPatients = filterPatientsByHub(patients, hub.id);
        const patientCount = hubPatients.length;

        switch (filters.patientCount) {
          case "none":
            if (patientCount > 0) return false;
            break;
          case "1-5":
            if (patientCount < 1 || patientCount > 5) return false;
            break;
          case "6-20":
            if (patientCount < 6 || patientCount > 20) return false;
            break;
          case "21+":
            if (patientCount < 21) return false;
            break;
        }
      }

      // Activity level filter
      if (filters.activityLevel !== "all") {
        const stats = getHubStats(patients, hub.id);
        const activityScore = (stats?.totalPatients ?? 0) + (stats?.activeAppointments ?? 0) + (stats?.recentNotes ?? 0);

        switch (filters.activityLevel) {
          case "low":
            if (activityScore > 5) return false;
            break;
          case "medium":
            if (activityScore < 6 || activityScore > 15) return false;
            break;
          case "high":
            if (activityScore < 16) return false;
            break;
        }
      }

      return true;
    });

    console.log(`🔍 HubList: After filtering, ${filtered.length} hubs remain`);
    
    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case "patients":
          aValue = filterPatientsByHub(patients, a.id).length;
          bValue = filterPatientsByHub(patients, b.id).length;
          break;
        case "activity":
          const aStats = getHubStats(patients, a.id);
          const bStats = getHubStats(patients, b.id);
          aValue = (aStats?.totalPatients ?? 0) + (aStats?.activeAppointments ?? 0) + (aStats?.recentNotes ?? 0);
          bValue = (bStats?.totalPatients ?? 0) + (bStats?.activeAppointments ?? 0) + (bStats?.recentNotes ?? 0);
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    console.log(`🔍 HubList: After sorting, ${sorted.length} hubs ready to render`);
    return sorted;
  }, [hubs, patients, searchTerm, filters, sortBy, sortOrder]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== "" ||
           filters.specialty !== "all" ||
           filters.patientCount !== "all" ||
           filters.activityLevel !== "all";
  }, [searchTerm, filters]);

  // Get unique specialties for filter dropdown
  const availableSpecialties = useMemo(() => {
    const specialtySet = new Set<string>();
    hubs.forEach(hub => {
      hub.specialties.forEach(specialty => specialtySet.add(specialty));
    });
    return Array.from(specialtySet).sort();
  }, [hubs]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    onSearchChange("");
    setFilters({
      specialty: "all",
      patientCount: "all",
      activityLevel: "all",
    });
    setSortBy("name");
    setSortOrder("asc");
  };

  // Debug filtered hubs
  useEffect(() => {
    console.log(`🔍 HubList filteredHubs: ${filteredHubs.length} hubs after filtering`, {
      totalHubs: hubs.length,
      filteredCount: filteredHubs.length,
      hasActiveFilters,
      searchTerm,
      filters
    });
  }, [filteredHubs, hubs.length, hasActiveFilters, searchTerm, filters]);

  // Don't show empty state if still loading
  if (filteredHubs.length === 0 && !hasActiveFilters && !isLoading) {
    console.log(`⚠️ HubList: Showing empty state - hubs.length=${hubs.length}, filteredHubs.length=${filteredHubs.length}, hasActiveFilters=${hasActiveFilters}, isLoading=${isLoading}`);
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Medical Hubs Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are currently no medical hubs configured in the system. Contact your administrator to set up medical hubs.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Debug: Received {hubs.length} hubs from props
          </p>
        </div>
      </div>
    );
  }
  
  // Show loading skeleton if still loading and no hubs
  if (isLoading && hubs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Medical Hubs</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Specialized care centers organized by medical specialty areas. Add custom functions, notes, and resources to personalize each hub.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowUpDown size={16} />
            <span>↑↓ navigate • Enter select • ⌘K search</span>
          </div>
          <button
            onClick={onBulkModeToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              bulkModeEnabled
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <CheckSquare size={16} />
            {bulkModeEnabled ? 'Exit Bulk Mode' : 'Bulk Operations'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search hubs by name, specialty, or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                !
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialty
                </label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Specialties</option>
                  {availableSpecialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Count Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient Count
                </label>
                <select
                  value={filters.patientCount}
                  onChange={(e) => setFilters(prev => ({ ...prev, patientCount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="none">No patients</option>
                  <option value="1-5">1-5 patients</option>
                  <option value="6-20">6-20 patients</option>
                  <option value="21+">21+ patients</option>
                </select>
              </div>

              {/* Activity Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Level
                </label>
                <select
                  value={filters.activityLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, activityLevel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="low">Low activity</option>
                  <option value="medium">Medium activity</option>
                  <option value="high">High activity</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort by
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSortChange("name")}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      sortBy === "name"
                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Name {sortBy === "name" && (sortOrder === "asc" ? <SortAsc size={12} className="inline ml-1" /> : <SortDesc size={12} className="inline ml-1" />)}
                  </button>
                  <button
                    onClick={() => handleSortChange("patients")}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      sortBy === "patients"
                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Patients {sortBy === "patients" && (sortOrder === "asc" ? <SortAsc size={12} className="inline ml-1" /> : <SortDesc size={12} className="inline ml-1" />)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {filteredHubs.length} of {hubs.length} hubs
          {hasActiveFilters && (
            <span className="ml-2 text-teal-600 dark:text-teal-400">
              ({Object.values(filters).filter(v => v !== "all").length + (searchTerm ? 1 : 0)} filters applied)
            </span>
          )}
        </span>
        {sortBy !== "name" && (
          <span>
            Sorted by {sortBy} ({sortOrder === "asc" ? "ascending" : "descending"})
          </span>
        )}
      </div>

      {/* Hub Grid */}
      {filteredHubs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No hubs match your search
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHubs.map((hub, index) => {
            const hubPatients = filterPatientsByHub(patients, hub.id);
            const stats = getHubStats(patients, hub.id);
            const colorClass = getHubColorClass(hub.id);
            const isSelected = selectedHub === hub.id;
            const isKeyboardSelected = selectedHubIndex === index;

            return (
              <div
                key={hub.id}
                className={`p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:scale-[1.02] hover:-translate-y-1 text-left group relative ${colorClass} ${
                  isSelected ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                } ${
                  isKeyboardSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                } ${
                  bulkModeEnabled && selectedHubsForBulk.includes(hub.id) ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                }`}
              >
                {/* Bulk Selection Checkbox */}
                {bulkModeEnabled && (
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedHubsForBulk.includes(hub.id)) {
                          onBulkSelectionChange?.(selectedHubsForBulk.filter(id => id !== hub.id));
                        } else {
                          onBulkSelectionChange?.([...selectedHubsForBulk, hub.id]);
                        }
                      }}
                      className={`p-1 rounded border transition-colors ${
                        selectedHubsForBulk.includes(hub.id)
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                      }`}
                    >
                      {selectedHubsForBulk.includes(hub.id) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </div>
                )}

                <button
                  data-hub-index={index}
                  onClick={() => !bulkModeEnabled && onHubSelect(hub.id)}
                  className={`w-full text-left ${bulkModeEnabled ? 'cursor-default' : 'cursor-pointer'}`}
                  disabled={bulkModeEnabled}
                >
                {/* Hub Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {hub.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
                        <Building2 size={12} />
                        {hub.specialties[0].charAt(0).toUpperCase() + hub.specialties[0].slice(1)}
                        {hub.specialties.length > 1 && ` +${hub.specialties.length - 1}`}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={20} className="text-teal-500 flex-shrink-0" />
                  )}
                </div>

                {/* Hub Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {hub.description}
                </p>

                {/* Hub Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/40 dark:bg-gray-800/40 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {hubPatients.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <Users size={10} />
                      Patients
                    </div>
                  </div>
                  <div className="bg-white/40 dark:bg-gray-800/40 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {stats?.activeAppointments ?? 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <Calendar size={10} />
                      Active
                    </div>
                  </div>
                  <div className="bg-white/40 dark:bg-gray-800/40 rounded-lg p-3">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {stats?.recentNotes ?? 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <Activity size={10} />
                      Recent
                    </div>
                  </div>
                </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Operations */}
      {bulkModeEnabled && (
        <HubBulkOperations
          hubs={hubs}
          patients={patients}
          selectedHubs={selectedHubsForBulk}
          onSelectionChange={onBulkSelectionChange || (() => {})}
          onClose={() => {
            onBulkSelectionChange?.([]);
          }}
        />
      )}
    </div>
  );
}
