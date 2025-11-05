import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePatientSearch } from '../usePatientSearch';
import { Patient } from '../../types';

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bp: '120/80',
    condition: 'Diabetes',
    risk: 65,
    medications: [],
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    bp: '110/70',
    condition: 'Hypertension',
    risk: 45,
    medications: [],
  },
  {
    id: '3',
    name: 'Bob Johnson',
    age: 28,
    gender: 'Male',
    bp: '130/85',
    condition: 'Diabetes',
    risk: 75,
    medications: [],
  },
];

describe('usePatientSearch', () => {
  it('filters patients by search query', () => {
    const { result } = renderHook(() => usePatientSearch({ patients: mockPatients }));

    act(() => {
      result.current.updateFilter({ searchQuery: 'John' });
    });

    expect(result.current.filteredAndSortedPatients).toHaveLength(1);
    expect(result.current.filteredAndSortedPatients[0].name).toBe('John Doe');
  });

  it('filters patients by risk level', () => {
    const { result } = renderHook(() => usePatientSearch({ patients: mockPatients }));

    act(() => {
      result.current.updateFilter({ filterRisk: 'high' });
    });

    expect(result.current.filteredAndSortedPatients.length).toBeGreaterThan(0);
    expect(result.current.filteredAndSortedPatients.every(p => p.risk >= 60)).toBe(true);
  });

  it('filters patients by condition', () => {
    const { result } = renderHook(() => usePatientSearch({ patients: mockPatients }));

    act(() => {
      result.current.updateFilter({ filterCondition: 'Diabetes' });
    });

    expect(result.current.filteredAndSortedPatients).toHaveLength(2);
    expect(result.current.filteredAndSortedPatients.every(p => p.condition === 'Diabetes')).toBe(true);
  });

  it('sorts patients by name', () => {
    const { result } = renderHook(() => usePatientSearch({ patients: mockPatients }));

    act(() => {
      result.current.updateFilter({ sortBy: 'name' });
    });

    const names = result.current.filteredAndSortedPatients.map(p => p.name);
    expect(names).toEqual(['Bob Johnson', 'Jane Smith', 'John Doe']);
  });

  it('sorts patients by risk', () => {
    const { result } = renderHook(() => usePatientSearch({ patients: mockPatients }));

    act(() => {
      result.current.updateFilter({ sortBy: 'risk' });
    });

    const risks = result.current.filteredAndSortedPatients.map(p => p.risk);
    expect(risks).toEqual([75, 65, 45]);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => usePatientSearch({ patients: mockPatients }));

    act(() => {
      result.current.updateFilter({ searchQuery: 'John', filterRisk: 'high' });
    });

    expect(result.current.filteredAndSortedPatients.length).toBeLessThan(mockPatients.length);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filterState.searchQuery).toBe('');
    expect(result.current.filterState.filterRisk).toBe('all');
    expect(result.current.filteredAndSortedPatients).toHaveLength(mockPatients.length);
  });
});

