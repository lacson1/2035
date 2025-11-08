import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  chartColors,
  chartThemes,
  processChartData,
  chartConfig
} from '../chartUtils';

// Mock date-fns functions
vi.mock('date-fns', () => ({
  format: vi.fn((date, pattern) => {
    if (pattern === 'yyyy-MM-dd') return '2023-01-01';
    if (pattern === 'yyyy-MM') return '2023-01';
    if (pattern === 'MMM dd') return 'Jan 01';
    if (pattern === 'dd') return '01';
    if (pattern === 'MMM') return 'Jan';
    return 'formatted-date';
  }),
  parseISO: vi.fn((dateString) => new Date(dateString)),
  subDays: vi.fn((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }),
  startOfDay: vi.fn((date) => date),
  endOfDay: vi.fn((date) => date),
}));

describe('chartColors', () => {
  it('exports predefined color values', () => {
    expect(chartColors.primary).toBe('#0ea5e9');
    expect(chartColors.secondary).toBe('#6b9b8a');
    expect(chartColors.accent).toBe('#a855f7');
    expect(chartColors.warning).toBe('#e89b4a');
    expect(chartColors.danger).toBe('#ef4444');
    expect(chartColors.success).toBe('#10b981');
    expect(chartColors.info).toBe('#3b82f6');
    expect(chartColors.neutral).toBe('#6b7280');
  });
});

describe('chartThemes', () => {
  it('defines color arrays for different chart contexts', () => {
    expect(chartThemes.patientMetrics).toEqual([
      chartColors.primary,
      chartColors.secondary,
      chartColors.accent,
      chartColors.warning,
    ]);

    expect(chartThemes.appointments).toEqual([
      chartColors.primary,
      chartColors.success,
      chartColors.warning,
      chartColors.danger,
    ]);

    expect(chartThemes.outcomes).toEqual([
      chartColors.success,
      chartColors.primary,
      chartColors.warning,
      chartColors.danger,
    ]);

    expect(chartThemes.performance).toEqual([
      chartColors.primary,
      chartColors.secondary,
      chartColors.accent,
      chartColors.neutral,
    ]);
  });
});

describe('processChartData', () => {
  describe('groupByDate', () => {
    it('groups data by day', () => {
      const mockData = [
        { id: 1, date: '2023-01-01T10:00:00Z' },
        { id: 2, date: '2023-01-01T15:00:00Z' },
        { id: 3, date: '2023-01-02T10:00:00Z' },
      ];

      const result = processChartData.groupByDate(mockData, 'date', 'day');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2023-01-01',
        count: 2,
        items: [mockData[0], mockData[1]],
      });
      expect(result[1]).toEqual({
        date: '2023-01-01',
        count: 1,
        items: [mockData[2]],
      });
    });

    it('groups data by month', () => {
      const mockData = [
        { id: 1, date: '2023-01-01T10:00:00Z' },
        { id: 2, date: '2023-01-15T15:00:00Z' },
        { id: 3, date: '2023-02-01T10:00:00Z' },
      ];

      const result = processChartData.groupByDate(mockData, 'date', 'month');

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2023-01');
      expect(result[1].date).toBe('2023-01');
    });

    it('handles empty data array', () => {
      const result = processChartData.groupByDate([], 'date', 'day');
      expect(result).toEqual([]);
    });

    it('handles data without specified date field', () => {
      const mockData = [{ id: 1 }];
      expect(() => processChartData.groupByDate(mockData, 'nonexistent', 'day')).toThrow();
    });
  });

  describe('calculateTrend', () => {
    it('calculates positive trend', () => {
      const result = processChartData.calculateTrend(150, 100);
      expect(result).toBe(50);
    });

    it('calculates negative trend', () => {
      const result = processChartData.calculateTrend(75, 100);
      expect(result).toBe(-25);
    });

    it('handles zero previous value with positive current', () => {
      const result = processChartData.calculateTrend(50, 0);
      expect(result).toBe(100);
    });

    it('handles zero previous value with zero current', () => {
      const result = processChartData.calculateTrend(0, 0);
      expect(result).toBe(0);
    });

    it('handles equal values', () => {
      const result = processChartData.calculateTrend(100, 100);
      expect(result).toBe(0);
    });
  });

  describe('formatNumber', () => {
    it('formats count numbers', () => {
      const result = processChartData.formatNumber(1234, 'count');
      expect(result).toBe('1,234');
    });

    it('formats percentage numbers', () => {
      const result = processChartData.formatNumber(85.7, 'percentage');
      expect(result).toBe('85.7%');
    });

    it('formats currency numbers', () => {
      const result = processChartData.formatNumber(1234.56, 'currency');
      expect(result).toBe('$1,234.56');
    });

    it('defaults to count format', () => {
      const result = processChartData.formatNumber(1234);
      expect(result).toBe('1,234');
    });
  });

  describe('generateTimeSeries', () => {
    beforeEach(() => {
      // Mock Date constructor
      const mockDate = new Date('2023-01-31');
      vi.setSystemTime(mockDate);
    });

    it('generates time series for default 30 days', () => {
      const result = processChartData.generateTimeSeries();
      expect(result).toHaveLength(30);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].formattedDate).toBe('Jan 01');
    });

    it('generates time series for custom days', () => {
      const result = processChartData.generateTimeSeries(7);
      expect(result).toHaveLength(7);
    });

    it('includes proper date formatting', () => {
      const result = processChartData.generateTimeSeries(1);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('formattedDate');
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('month');
    });
  });

  describe('movingAverage', () => {
    it('calculates 7-day moving average by default', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = processChartData.movingAverage(data);
      expect(result).toHaveLength(4); // 10 - 7 + 1 = 4
      expect(result[0]).toBe(4); // (1+2+3+4+5+6+7)/7 = 4
    });

    it('calculates moving average with custom window', () => {
      const data = [1, 2, 3, 4, 5];
      const result = processChartData.movingAverage(data, 3);
      expect(result).toHaveLength(3); // 5 - 3 + 1 = 3
      expect(result[0]).toBe(2); // (1+2+3)/3 = 2
    });

    it('returns empty array for insufficient data', () => {
      const data = [1, 2];
      const result = processChartData.movingAverage(data, 7);
      expect(result).toEqual([]);
    });

    it('handles empty data array', () => {
      const result = processChartData.movingAverage([]);
      expect(result).toEqual([]);
    });

    it('rounds results to 2 decimal places', () => {
      const data = [1.1, 2.2, 3.3];
      const result = processChartData.movingAverage(data, 3);
      expect(result[0]).toBe(2.2); // (1.1+2.2+3.3)/3 = 2.2
    });
  });
});

describe('chartConfig', () => {
  it('defines common chart configuration', () => {
    expect(chartConfig.common).toEqual({
      margin: { top: 20, right: 30, left: 20, bottom: 60 },
      responsive: true,
      animationDuration: 1000,
      animationEasing: 'ease-out',
    });
  });

  it('defines tooltip configuration', () => {
    expect(chartConfig.tooltip.contentStyle).toBeDefined();
    expect(chartConfig.tooltip.contentStyle.backgroundColor).toBe('rgba(255, 255, 255, 0.95)');
  });

  it('defines legend configuration', () => {
    expect(chartConfig.legend.wrapperStyle).toBeDefined();
    expect(chartConfig.legend.wrapperStyle.fontSize).toBe('14px');
  });
});
