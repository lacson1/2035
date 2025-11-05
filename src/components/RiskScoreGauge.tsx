import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRiskLabel, getRiskColorHex } from "../utils/riskUtils";

interface RiskScoreGaugeProps {
  risk: number;
}

export default function RiskScoreGauge({ risk }: RiskScoreGaugeProps) {
  // Ensure valid risk value
  const validRisk = Math.max(0, Math.min(100, risk || 0));
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Wait for container to have dimensions before rendering chart
  useEffect(() => {
    if (!containerRef.current) return;

    const checkDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setIsReady(true);
        return true;
      }
      return false;
    };
    
    // Check immediately
    if (checkDimensions()) return;

    // Use ResizeObserver to detect when container gets dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setIsReady(true);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    // Fallback timeout
    const timeout = setTimeout(() => {
      if (checkDimensions()) {
        setIsReady(true);
      }
    }, 200);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  // Calculate the gauge data
  const data = [
    { name: "Risk", value: validRisk, fill: getRiskColorHex(validRisk) },
    { name: "Remaining", value: 100 - validRisk, fill: "#e5e7eb" },
  ];

  const renderCustomLabel = () => {
    return null; // We'll render the text outside the chart
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-full" 
        style={{ width: "100%", height: "200px", minHeight: "200px", minWidth: "200px" }}
      >
        {isReady ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                label={renderCustomLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-sm text-gray-400">Loading...</div>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-4xl font-bold"
            style={{ color: getRiskColorHex(validRisk) }}
          >
            {validRisk}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getRiskLabel(validRisk)} Risk
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Low (0-39%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Medium (40-59%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>High (60-100%)</span>
        </div>
      </div>
    </div>
  );
}

