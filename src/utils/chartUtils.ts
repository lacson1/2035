import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

// Chart color schemes for consistency
export const chartColors = {
  primary: '#0ea5e9', // Sky Blue
  secondary: '#6b9b8a', // Sage Green
  accent: '#a855f7', // Purple
  warning: '#e89b4a', // Amber
  danger: '#ef4444', // Red
  success: '#10b981', // Emerald
  info: '#3b82f6', // Blue
  neutral: '#6b7280', // Gray
};

// Chart themes for different contexts
export const chartThemes = {
  patientMetrics: [
    chartColors.primary,
    chartColors.secondary,
    chartColors.accent,
    chartColors.warning,
  ],
  appointments: [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.danger,
  ],
  outcomes: [
    chartColors.success,
    chartColors.primary,
    chartColors.warning,
    chartColors.danger,
  ],
  performance: [
    chartColors.primary,
    chartColors.secondary,
    chartColors.accent,
    chartColors.neutral,
  ],
};

// Utility functions for chart data processing
export const processChartData = {
  // Group data by date ranges
  groupByDate: (data: any[], dateField: string, groupBy: 'day' | 'week' | 'month' = 'day') => {
    const grouped: { [key: string]: any[] } = {};

    data.forEach(item => {
      const date = parseISO(item[dateField]);
      let key: string;

      switch (groupBy) {
        case 'week':
          key = format(startOfDay(date), 'yyyy-MM-dd'); // Start of week
          break;
        case 'month':
          key = format(date, 'yyyy-MM');
          break;
        default: // day
          key = format(startOfDay(date), 'yyyy-MM-dd');
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([date, items]) => ({
      date,
      count: items.length,
      items,
    }));
  },

  // Calculate trends and percentages
  calculateTrend: (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Format numbers for display
  formatNumber: (num: number, type: 'count' | 'percentage' | 'currency' = 'count') => {
    switch (type) {
      case 'percentage':
        return `${num.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(num);
      default:
        return num.toLocaleString();
    }
  },

  // Generate time series data
  generateTimeSeries: (days: number = 30) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        formattedDate: format(date, 'MMM dd'),
        day: format(date, 'dd'),
        month: format(date, 'MMM'),
      });
    }

    return data;
  },

  // Calculate moving averages
  movingAverage: (data: number[], window: number = 7) => {
    const result = [];
    for (let i = window - 1; i < data.length; i++) {
      const slice = data.slice(i - window + 1, i + 1);
      const average = slice.reduce((sum, val) => sum + val, 0) / window;
      result.push(Math.round(average * 100) / 100);
    }
    return result;
  },
};

// Chart configuration utilities
export const chartConfig = {
  common: {
    margin: { top: 20, right: 30, left: 20, bottom: 60 },
    responsive: true,
    animationDuration: 1000,
    animationEasing: 'ease-out',
  },

  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      fontSize: '14px',
    },
  },

  legend: {
    wrapperStyle: {
      paddingTop: '20px',
      fontSize: '14px',
    },
  },
};
