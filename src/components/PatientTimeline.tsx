import { Calendar, FileText, Scan, Pill, Stethoscope, TestTube } from "lucide-react";
import { Patient } from "../types";

interface PatientTimelineProps {
  patient: Patient;
}

export default function PatientTimeline({ patient }: PatientTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar size={18} className="text-blue-600 dark:text-blue-400" />;
      case "note":
        return <FileText size={18} className="text-purple-600 dark:text-purple-400" />;
      case "imaging":
        return <Scan size={18} className="text-green-600 dark:text-green-400" />;
      case "medication":
        return <Pill size={18} className="text-orange-600 dark:text-orange-400" />;
      case "lab":
        return <TestTube size={18} className="text-red-600 dark:text-red-400" />;
      default:
        return <Stethoscope size={18} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
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

  // Build timeline from patient data
  const timelineEvents = patient.timeline || [];

  // Sort by date (most recent first)
  const sortedTimeline = [...timelineEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-4 border rounded-lg dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Patient Timeline</h3>

      {sortedTimeline.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>

          <div className="space-y-4">
            {sortedTimeline.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700">
                  {getIcon(event.type)}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 p-4 rounded-lg border-l-4 ${getTypeColor(
                    event.type
                  )} mb-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No timeline events available
        </p>
      )}
    </div>
  );
}

