import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface FormProgressIndicatorProps {
  sections: {
    id: string;
    label: string;
    fields: string[];
  }[];
  formData: Record<string, any>;
  requiredFields?: string[];
}

export default function FormProgressIndicator({
  sections,
  formData,
  requiredFields = [],
}: FormProgressIndicatorProps) {
  const progress = useMemo(() => {
    let totalFields = 0;
    let completedFields = 0;

    sections.forEach((section) => {
      section.fields.forEach((field) => {
        totalFields++;
        const value = formData[field];
        const isRequired = requiredFields.includes(field);
        
        if (value && (typeof value === 'string' ? value.trim().length > 0 : true)) {
          completedFields++;
        } else if (!isRequired) {
          // Optional fields count as completed if empty
          completedFields++;
        }
      });
    });

    return {
      completed: completedFields,
      total: totalFields,
      percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0,
    };
  }, [sections, formData, requiredFields]);

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Form Progress
        </span>
        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          {progress.completed}/{progress.total} fields
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            progress.percentage === 100
              ? "bg-green-500"
              : progress.percentage >= 50
              ? "bg-teal-500"
              : "bg-yellow-500"
          }`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {sections.map((section) => {
          const sectionCompleted = section.fields.every((field) => {
            const value = formData[field];
            const isRequired = requiredFields.includes(field);
            return value && (typeof value === 'string' ? value.trim().length > 0 : true) || !isRequired;
          });

          return (
            <div
              key={section.id}
              className="flex items-center gap-1 text-xs"
            >
              {sectionCompleted ? (
                <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
              ) : (
                <Circle size={12} className="text-gray-400 dark:text-gray-500" />
              )}
              <span className={sectionCompleted ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"}>
                {section.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

