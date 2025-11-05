import { useState, useMemo, useCallback, useEffect } from "react";
import { Patient } from "../types";

interface UsePatientSearchOptions {
  patients: Patient[];
  debounceMs?: number;
}

interface FilterState {
  searchQuery: string;
  filterRisk: string;
  filterCondition: string;
  sortBy: "name" | "risk" | "recent";
}

export const usePatientSearch = ({ patients, debounceMs = 300 }: UsePatientSearchOptions) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: "",
    filterRisk: "all",
    filterCondition: "all",
    sortBy: "name",
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filterState.searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filterState.searchQuery, debounceMs]);

  // Create search index for faster lookups
  const searchIndex = useMemo(() => {
    return patients.map((patient) => ({
      id: patient.id,
      searchableText: [
        patient.name,
        patient.condition,
        patient.email,
        patient.phone,
        patient.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
      patient,
    }));
  }, [patients]);

  // Get unique conditions for filter dropdown
  const uniqueConditions = useMemo(
    () => Array.from(new Set(patients.map((p) => p.condition))).sort(),
    [patients]
  );

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = [...patients];

    // Search filter using indexed search
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const queryWords = query.split(/\s+/);
      
      const matchingIds = new Set(
        searchIndex
          .filter((item) => {
            // Match all query words
            return queryWords.every((word) => item.searchableText.includes(word));
          })
          .map((item) => item.id)
      );

      filtered = filtered.filter((p) => matchingIds.has(p.id));
    }

    // Risk filter
    if (filterState.filterRisk !== "all") {
      filtered = filtered.filter((p) => {
        if (filterState.filterRisk === "high") return p.risk >= 60;
        if (filterState.filterRisk === "medium") return p.risk >= 40 && p.risk < 60;
        if (filterState.filterRisk === "low") return p.risk < 40;
        return true;
      });
    }

    // Condition filter
    if (filterState.filterCondition !== "all") {
      filtered = filtered.filter((p) => p.condition === filterState.filterCondition);
    }

    // Sort
    filtered.sort((a, b) => {
      if (filterState.sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (filterState.sortBy === "risk") {
        return b.risk - a.risk;
      }
      if (filterState.sortBy === "recent") {
        const aRecent = a.timeline?.[0]?.date || "";
        const bRecent = b.timeline?.[0]?.date || "";
        return new Date(bRecent).getTime() - new Date(aRecent).getTime();
      }
      return 0;
    });

    return filtered;
  }, [patients, debouncedSearchQuery, filterState, searchIndex]);

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({
      searchQuery: "",
      filterRisk: "all",
      filterCondition: "all",
      sortBy: "name",
    });
  }, []);

  return {
    filterState,
    filteredAndSortedPatients,
    uniqueConditions,
    updateFilter,
    clearFilters,
    resultCount: filteredAndSortedPatients.length,
    totalCount: patients.length,
  };
};

