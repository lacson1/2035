/**
 * Basic metrics collection utility
 * For production, consider using Prometheus client
 */

interface Metrics {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  };
  responseTimes: number[];
  errors: number;
  startTime: Date;
}

class MetricsCollector {
  private metrics: Metrics;

  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
      },
      responseTimes: [],
      errors: 0,
      startTime: new Date(),
    };
  }

  recordRequest(method: string, statusCode: number, responseTime: number) {
    this.metrics.requests.total++;
    
    // Count by method
    this.metrics.requests.byMethod[method] = 
      (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // Count by status code
    const statusGroup = `${Math.floor(statusCode / 100)}xx`;
    this.metrics.requests.byStatus[statusGroup] = 
      (this.metrics.requests.byStatus[statusGroup] || 0) + 1;
    
    // Record response time (keep last 1000)
    this.metrics.responseTimes.push(responseTime);
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
    
    // Count errors (4xx and 5xx)
    if (statusCode >= 400) {
      this.metrics.errors++;
    }
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;

    const sortedResponseTimes = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
    const p95ResponseTime = sortedResponseTimes[p95Index] || 0;

    return {
      ...this.metrics,
      calculated: {
        averageResponseTime: Math.round(avgResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        errorRate: this.metrics.requests.total > 0
          ? (this.metrics.errors / this.metrics.requests.total) * 100
          : 0,
        uptime: Math.floor((Date.now() - this.metrics.startTime.getTime()) / 1000),
      },
    };
  }

  reset() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
      },
      responseTimes: [],
      errors: 0,
      startTime: new Date(),
    };
  }
}

export const metricsCollector = new MetricsCollector();

