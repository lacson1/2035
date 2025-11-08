import { useState, useMemo } from "react";
import { Calendar, FileText, Scan, Pill, Stethoscope, TestTube, Filter } from "lucide-react";
import { Patient } from "../types";

interface PatientTimelineProps {
  patient: Patient;
}

const TIMELINE_TYPES = [
  "all",
  "appointment",
  "note",
  "imaging",
  "medication",
  "lab",
  "referral",
  "consent",
  "surgery",
  "nutrition",
  "vaccination",
] as const;

const DATE_RANGES = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "This Year" },
] as const;

export default function PatientTimeline({ patient }: PatientTimelineProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar size={12} className="text-teal-600 dark:text-teal-400" />;
      case "note":
        return <FileText size={12} className="text-purple-600 dark:text-purple-400" />;
      case "imaging":
        return <Scan size={12} className="text-green-600 dark:text-green-400" />;
      case "medication":
        return <Pill size={12} className="text-orange-600 dark:text-orange-400" />;
      case "lab":
        return <TestTube size={12} className="text-red-600 dark:text-red-400" />;
      default:
        return <Stethoscope size={12} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "border-teal-500 bg-teal-50 dark:bg-teal-900/20";
      case "note":
        return "border-purple-500 bg-purple-50 dark:bg-purple-900/20";
      case "imaging":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
      case "medication":
        return "border-orange-500 bg-orange-50 dark:bg-orange-900/20";
      case "lab":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-800";
    }
  };

  const getDateRangeDates = (range: string): { start: Date | null; end: Date | null } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: now };
      case "month":
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case "3months":
        return { start: new Date(now.getFullYear(), now.getMonth() - 3, 1), end: now };
      case "6months":
        return { start: new Date(now.getFullYear(), now.getMonth() - 6, 1), end: now };
      case "year":
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: null, end: null };
    }
  };

  // Build timeline from patient data
  const timelineEvents = patient.timeline || [];

  // Filter and sort timeline events
  const filteredTimeline = useMemo(() => {
    let filtered = [...timelineEvents];

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((event) => event.type === typeFilter);
    }

    // Filter by date range
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRangeDates(dateRangeFilter);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        if (start && eventDate < start) return false;
        if (end && eventDate > end) return false;
        return true;
      });
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timelineEvents, typeFilter, dateRangeFilter]);

  return (
    <div className="p-3 border rounded-lg dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Patient Timeline</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {filteredTimeline.length} {filteredTimeline.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {TIMELINE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <select
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value)}
          className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {DATE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {filteredTimeline.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>

          <div className="space-y-2">
            {filteredTimeline.map((event) => (
              <div key={event.id} className="relative flex gap-2">
                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex-shrink-0">
                  {getIcon(event.type)}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 p-2 rounded-md border-l-2 ${getTypeColor(
                    event.type
                  )} text-xs`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </h4>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-xs">
          {timelineEvents.length === 0
            ? "No timeline events available"
            : "No events match the selected filters"}
        </p>
      )}
    </div>
  );
}

