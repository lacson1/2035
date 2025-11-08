import { useState, useMemo, useCallback } from 'react';
import { Patient } from '../types';
import { useDebounce } from './useDebounce';

export interface SearchFilters {
  query: string;
  ageRange: [number, number];
  conditions: string[];
  lastVisitRange: { start: Date | null; end: Date | null };
  insurance: string | null;
  sortBy: 'name' | 'age' | 'lastVisit' | 'risk' | 'condition';
  sortOrder: 'asc' | 'desc';
  riskLevel: 'all' | 'low' | 'medium' | 'high';
  name?: string; // For saved searches
}

export interface SearchResult {
  patient: Patient;
  matchScore: number;
  matchedFields: string[];
}

const initialFilters: SearchFilters = {
  query: '',
  ageRange: [0, 120],
  conditions: [],
  lastVisitRange: { start: null, end: null },
  insurance: null,
  sortBy: 'name',
  sortOrder: 'asc',
  riskLevel: 'all',
};

export const useAdvancedSearch = (patients: Patient[]) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [savedSearches, setSavedSearches] = useState<SearchFilters[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounce search query for performance
  const debouncedQuery = useDebounce(filters.query, 300);

  // Calculate patient age
  const calculateAge = useCallback((dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, []);

  // Get last visit date from timeline
  const getLastVisitDate = useCallback((patient: Patient): Date | null => {
    if (!patient.timeline || patient.timeline.length === 0) return null;

    const visits = patient.timeline
      .filter(event => event.type === 'appointment' || event.type === 'note')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return visits.length > 0 ? new Date(visits[0].date) : null;
  }, []);

  // Calculate match score for search ranking
  const calculateMatchScore = useCallback((patient: Patient, query: string): { score: number; fields: string[] } => {
    if (!query.trim()) return { score: 1, fields: [] };

    const searchTerm = query.toLowerCase();
    let score = 0;
    const matchedFields: string[] = [];

    // Name matching (highest priority)
    const fullName = `${patient.name}`.toLowerCase();
    if (fullName.includes(searchTerm)) {
      score += 100;
      matchedFields.push('name');
      if (fullName.startsWith(searchTerm)) score += 50; // Exact prefix match
    }

    // MRN matching
    if (patient.id?.toLowerCase().includes(searchTerm)) {
      score += 80;
      matchedFields.push('id');
    }

    // Condition matching
    if (patient.condition?.toLowerCase().includes(searchTerm)) {
      score += 60;
      matchedFields.push('condition');
    }

    // Phone matching
    if (patient.phone?.includes(searchTerm.replace(/\D/g, ''))) {
      score += 40;
      matchedFields.push('phone');
    }

    // Email matching
    if (patient.email?.toLowerCase().includes(searchTerm)) {
      score += 30;
      matchedFields.push('email');
    }

    return { score, fields: matchedFields };
  }, []);

  // Filter and sort patients
  const searchResults = useMemo((): SearchResult[] => {
    let filtered = patients.filter(patient => {
      // Age range filter
      const age = calculateAge(patient.dob || '');
      if (age < filters.ageRange[0] || age > filters.ageRange[1]) return false;

      // Conditions filter
      if (filters.conditions.length > 0) {
        const patientConditions = patient.condition?.split(',').map(c => c.trim().toLowerCase()) || [];
        const hasMatchingCondition = filters.conditions.some(condition =>
          patientConditions.includes(condition.toLowerCase())
        );
        if (!hasMatchingCondition) return false;
      }

      // Last visit range filter
      if (filters.lastVisitRange.start || filters.lastVisitRange.end) {
        const lastVisit = getLastVisitDate(patient);
        if (!lastVisit) return false;

        if (filters.lastVisitRange.start && lastVisit < filters.lastVisitRange.start) return false;
        if (filters.lastVisitRange.end && lastVisit > filters.lastVisitRange.end) return false;
      }

      // Insurance filter
      if (filters.insurance && patient.insurance?.provider !== filters.insurance) return false;

      // Risk level filter
      if (filters.riskLevel !== 'all') {
        const riskScore = patient.risk || 0;
        let riskLevel: string;
        if (riskScore < 30) riskLevel = 'low';
        else if (riskScore < 70) riskLevel = 'medium';
        else riskLevel = 'high';

        if (riskLevel !== filters.riskLevel) return false;
      }

      return true;
    });

    // Apply text search and calculate scores
    const resultsWithScores = filtered.map(patient => {
      const { score, fields } = calculateMatchScore(patient, debouncedQuery);
      return {
        patient,
        matchScore: score,
        matchedFields: fields,
      };
    });

    // Sort results
    resultsWithScores.sort((a, b) => {
      // First sort by match score (descending)
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }

      // Then sort by selected field
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.patient.name.toLowerCase();
          bValue = b.patient.name.toLowerCase();
          break;
        case 'age':
          aValue = calculateAge(a.patient.dob || '');
          bValue = calculateAge(b.patient.dob || '');
          break;
        case 'lastVisit':
          aValue = getLastVisitDate(a.patient)?.getTime() || 0;
          bValue = getLastVisitDate(b.patient)?.getTime() || 0;
          break;
        case 'risk':
          aValue = a.patient.risk || 0;
          bValue = b.patient.risk || 0;
          break;
        case 'condition':
          aValue = a.patient.condition?.toLowerCase() || '';
          bValue = b.patient.condition?.toLowerCase() || '';
          break;
        default:
          aValue = a.patient.name.toLowerCase();
          bValue = b.patient.name.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return resultsWithScores;
  }, [patients, filters, debouncedQuery, calculateAge, calculateMatchScore, getLastVisitDate]);

  // Save search preset
  const saveSearch = useCallback((name: string) => {
    const searchToSave = { ...filters, name };
    setSavedSearches(prev => [...prev, searchToSave]);

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    saved.push(searchToSave);
    localStorage.setItem('savedSearches', JSON.stringify(saved));
  }, [filters]);

  // Load saved search
  const loadSearch = useCallback((search: SearchFilters) => {
    setFilters(search);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Update search history
  const addToHistory = useCallback((query: string) => {
    if (query.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(q => q !== query);
        const updated = [query, ...filtered].slice(0, 10); // Keep last 10
        localStorage.setItem('searchHistory', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Load search history on mount
  useState(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }

    const savedSearches = localStorage.getItem('savedSearches');
    if (savedSearches) {
      setSavedSearches(JSON.parse(savedSearches));
    }
  });

  // Quick filters for common searches
  const quickFilters = useMemo(() => ({
    recentVisits: () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      setFilters(prev => ({
        ...prev,
        lastVisitRange: { start: thirtyDaysAgo, end: new Date() },
      }));
    },
    highRisk: () => {
      setFilters(prev => ({ ...prev, riskLevel: 'high' }));
    },
    elderly: () => {
      setFilters(prev => ({ ...prev, ageRange: [65, 120] }));
    },
  }), []);

  return {
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
    totalResults: searchResults.length,
    hasActiveFilters: JSON.stringify(filters) !== JSON.stringify(initialFilters),
  };
};
