import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getMeasurementSystem, convertTemperatureForDisplay } from "../utils/measurements";

interface VitalsDataPoint {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSat: number;
}

interface VitalsTrendChartProps {
  data: VitalsDataPoint[];
}

export default function VitalsTrendChart({ data }: VitalsTrendChartProps) {
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const [isReady1, setIsReady1] = useState(false);
  const [isReady2, setIsReady2] = useState(false);
  const [measurementSystem, setMeasurementSystem] = useState(() => getMeasurementSystem());

  // Listen for measurement system changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMeasurementSystem(getMeasurementSystem());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = getMeasurementSystem();
      if (current !== measurementSystem) {
        setMeasurementSystem(current);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [measurementSystem]);

  // Wait for containers to have dimensions before rendering charts
  useEffect(() => {
    const checkDimensions = (ref: React.RefObject<HTMLDivElement>): boolean => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          return true;
        }
      }
      return false;
    };

    const setupObserver = (
      ref: React.RefObject<HTMLDivElement>,
      setIsReady: (val: boolean) => void
    ) => {
      if (!ref.current) return () => {};

      // Check immediately
      if (checkDimensions(ref)) {
        setIsReady(true);
        return () => {};
      }

      // Use ResizeObserver to detect when container gets dimensions
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            setIsReady(true);
          }
        }
      });

      resizeObserver.observe(ref.current);

      // Fallback timeout
      const timeout = setTimeout(() => {
        if (checkDimensions(ref)) {
          setIsReady(true);
        }
      }, 200);

      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeout);
      };
    };

    const cleanup1 = setupObserver(containerRef1, setIsReady1);
    const cleanup2 = setupObserver(containerRef2, setIsReady2);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  // Don't render if no data
  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">No data available</div>;
  }

  // Convert temperature data for display based on measurement system
  const chartData = data.map(item => ({
    ...item,
    temperature: convertTemperatureForDisplay(item.temperature, measurementSystem),
  }));

  return (
    <div className="space-y-6">
      {/* Blood Pressure Chart */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Blood Pressure (mmHg)
        </h4>
        <div 
          ref={containerRef1}
          style={{ width: "100%", height: "200px", minHeight: "200px", minWidth: "200px" }}
        >
          {isReady1 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200}>
            <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#ef4444"
              strokeWidth={2}
              name="Systolic"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Diastolic"
              dot={{ r: 4 }}
            />
          </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-sm text-gray-400">Loading...</div>
            </div>
          )}
        </div>
      </div>

      {/* Heart Rate & Other Vitals */}
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Heart Rate, Temperature &amp; O2 Saturation
        </h4>
        <div 
          ref={containerRef2}
          style={{ width: "100%", height: "200px", minHeight: "200px", minWidth: "200px" }}
        >
          {isReady2 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200}>
            <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#10b981"
              strokeWidth={2}
              name="Heart Rate (bpm)"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              name={`Temperature (${measurementSystem === "uk" ? "°C" : "°F"})`}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="oxygenSat"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="O2 Saturation (%)"
              dot={{ r: 4 }}
            />
          </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-sm text-gray-400">Loading...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

