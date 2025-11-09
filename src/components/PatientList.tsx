import { useState, useMemo, useEffect, memo } from "react";
import {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const {
    filterState,
    filteredAndSortedPatients,
    updateFilter,
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
  }, [filterState.sortBy]);

  return (
    <div className="space-y-4">

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-slate-300 dark:ring-slate-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/50"
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-slate-300 dark:ring-slate-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/50"
              }`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("detail")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "detail"
                  ? "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-slate-300 dark:ring-slate-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/50"
              }`}
              title="Detail view"
            >
              <FileText size={16} />
            </button>
          </div>
        </div>
        <select
          value={filterState.sortBy}
          onChange={(e) => updateFilter({ sortBy: e.target.value as "name" | "risk" | "recent" })}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="name">Sort: Name</option>
          <option value="risk">Sort: Risk</option>
          <option value="recent">Sort: Recent</option>
        </select>
      </div>

      {/* Patient Count */}
      <div className="flex items-center justify-between px-2 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {resultCount > 0 ? (
            <>
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min((currentPage - 1) * itemsPerPage + 1, resultCount)}</span>-
              <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, resultCount)}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{resultCount}</span> patients
              {resultCount < totalCount && (
                <span className="text-slate-500 dark:text-slate-500"> (filtered from {totalCount} total)</span>
              )}
            </>
          ) : (
            <>
              No patients found{totalCount > 0 && (
                <span className="text-slate-500 dark:text-slate-500"> (from {totalCount} total)</span>
              )}
            </>
          )}
        </div>

        {/* View Mode Indicator */}
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="capitalize">{viewMode} view</span>
        </div>
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
              <div className="space-y-3">
                {paginatedPatients.map((patient) => (
                  <PatientListItem
                    key={patient.id}
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onClick={() => onSelectPatient(patient)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
            No patients found
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
