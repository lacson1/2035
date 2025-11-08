import { useState, useMemo, useEffect, memo } from "react";
import {
  Search,
  Filter,
  X,
  List,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { Patient } from "../types";
import { usePatientSearch } from "../hooks/usePatientSearch";
import PatientListItem from "./PatientList/PatientListItem";
import PatientGridItem from "./PatientList/PatientGridItem";
import PatientDetailItem from "./PatientList/PatientDetailItem";
import PatientListPagination from "./PatientList/PatientListPagination";

type ViewMode = "list" | "grid" | "detail";

interface PatientListProps {
  patients: Patient[];
  selectedPatient: Patient | null | undefined;
  onSelectPatient: (patient: Patient) => void;
}

const DEFAULT_ITEMS_PER_PAGE = 25;

function PatientList({
  patients,
  selectedPatient,
  onSelectPatient,
}: PatientListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const {
    filterState,
    filteredAndSortedPatients,
    uniqueConditions,
    updateFilter,
    clearFilters,
    resultCount,
    totalCount,
  } = usePatientSearch({ patients });

  // Pagination
  const totalPages = Math.ceil(resultCount / itemsPerPage);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedPatients.slice(startIndex, endIndex);
  }, [filteredAndSortedPatients, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState.searchQuery, filterState.filterRisk, filterState.filterCondition, filterState.sortBy]);

  const hasActiveFilters =
    filterState.filterRisk !== "all" ||
    filterState.filterCondition !== "all" ||
    filterState.searchQuery !== "";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search patients..."
          value={filterState.searchQuery}
          onChange={(e) => updateFilter({ searchQuery: e.target.value })}
          className="input-base pl-10 pr-10 py-2.5 text-sm min-h-[44px]"
        />
        {filterState.searchQuery && (
          <button
            onClick={() => updateFilter({ searchQuery: "" })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters & Sort */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                Active
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="List view"
                aria-label="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("detail")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "detail"
                    ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title="Detailed view"
                aria-label="Detailed view"
              >
                <FileText size={16} />
              </button>
            </div>
            <select
              value={filterState.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as "name" | "risk" | "recent" })}
              className="text-xs border rounded-lg px-2 py-1 dark:bg-gray-800 dark:border-gray-700 font-normal"
            >
              <option value="name">Sort: Name</option>
              <option value="risk">Sort: Risk</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 border dark:border-gray-700">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                Risk Level
              </label>
              <select
                value={filterState.filterRisk}
                onChange={(e) => updateFilter({ filterRisk: e.target.value })}
                className="w-full text-xs border rounded-lg px-2 py-1 dark:bg-gray-700 dark:border-gray-600 font-normal"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High (≥60%)</option>
                <option value="medium">Medium (40-59%)</option>
                <option value="low">Low (&lt;40%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                Condition
              </label>
              <select
                value={filterState.filterCondition}
                onChange={(e) => updateFilter({ filterCondition: e.target.value })}
                className="w-full text-xs border rounded-lg px-2 py-1 dark:bg-gray-700 dark:border-gray-600 font-normal"
              >
                <option value="all">All Conditions</option>
                {uniqueConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Patient Count */}
      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium px-1 py-1">
        {resultCount > 0 ? (
          <>
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min((currentPage - 1) * itemsPerPage + 1, resultCount)}</span>-
            <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(currentPage * itemsPerPage, resultCount)}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{resultCount}</span> patients
            {resultCount < totalCount && (
              <span className="text-gray-500 dark:text-gray-500"> (filtered from {totalCount} total)</span>
            )}
          </>
        ) : (
          <>
            No patients found{totalCount > 0 && (
              <span className="text-gray-500 dark:text-gray-500"> (from {totalCount} total)</span>
            )}
          </>
        )}
      </div>

      {/* Patient List/Grid/Detail */}
      <div className={`max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-500px)] overflow-y-auto ${
        viewMode === "list" || viewMode === "detail" ? "space-y-3" : ""
      }`}>
        {resultCount > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {paginatedPatients.map((patient) => (
                  <PatientGridItem
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onClick={() => onSelectPatient(patient)}
                  />
                ))}
              </div>
            ) : viewMode === "detail" ? (
              <div className="space-y-3">
                {paginatedPatients.map((patient) => (
                  <PatientDetailItem
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onClick={() => onSelectPatient(patient)}
                  />
                ))}
              </div>
            ) : (
              <>
                {paginatedPatients.map((patient) => (
                  <PatientListItem
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onClick={() => onSelectPatient(patient)}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            {filterState.searchQuery || hasActiveFilters ? (
              <div className="space-y-2">
                <p>No patients match your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Clear filters to see all patients
                </button>
              </div>
            ) : (
              "No patients available"
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {resultCount > itemsPerPage && (
        <PatientListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={resultCount}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
}

export default memo(PatientList);
