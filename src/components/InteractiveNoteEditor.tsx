import { useState, useEffect } from "react";
import { ChevronRight, Sparkles, X } from "lucide-react";
import { 
  commonSymptoms, 
  commonDiagnoses, 
  getPatientHistorySuggestions,
  AutocompleteOption,
  searchAutocomplete
} from "../utils/formHelpers";
import { Patient } from "../types";

interface SuggestionsDropdownProps {
  query: string;
  suggestions: AutocompleteOption[];
  onSelect: (suggestion: AutocompleteOption) => void;
}

function SuggestionsDropdown({ query, suggestions, onSelect }: SuggestionsDropdownProps) {
  const [filtered, setFiltered] = useState<AutocompleteOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const words = query.trim().split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    if (lastWord.length >= 1) {
      const results = searchAutocomplete(lastWord, suggestions, 5);
      setFiltered(results);
    } else {
      setFiltered([]);
    }
    setSelectedIndex(-1);
  }, [query, suggestions]);

  if (filtered.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
      {filtered.map((suggestion, index) => (
        <button
          key={suggestion.value}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {suggestion.label}
          </div>
          {suggestion.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {suggestion.category}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

interface NoteSection {
  id: string;
  title: string;
  placeholder: string;
  value: string;
  color: string;
  icon: string;
  suggestions: AutocompleteOption[];
}

interface InteractiveNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  patient: Patient;
  placeholder?: string;
}

export default function InteractiveNoteEditor({
  value,
  onChange,
  patient,
}: InteractiveNoteEditorProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sections, setSections] = useState<NoteSection[]>([
    {
      id: "chiefComplaint",
      title: "Chief Complaint",
      placeholder: "Primary reason for visit (e.g., chest pain, headache)",
      value: "",
      color: "teal",
      icon: "S",
      suggestions: [...commonSymptoms, ...getPatientHistorySuggestions("diagnosis", patient)],
    },
    {
      id: "hpi",
      title: "History of Present Illness",
      placeholder: "Detailed history, onset, duration, severity, associated symptoms...",
      value: "",
      color: "blue",
      icon: "H",
      suggestions: [...commonSymptoms, ...getPatientHistorySuggestions("diagnosis", patient)],
    },
    {
      id: "physicalExam",
      title: "Physical Examination",
      placeholder: "Physical exam findings, system review...",
      value: "",
      color: "orange",
      icon: "E",
      suggestions: [],
    },
    {
      id: "assessment",
      title: "Assessment & Diagnosis",
      placeholder: "Clinical assessment, differential diagnoses...",
      value: "",
      color: "green",
      icon: "A",
      suggestions: [...commonDiagnoses, ...getPatientHistorySuggestions("diagnosis", patient)],
    },
    {
      id: "plan",
      title: "Plan",
      placeholder: "Treatment plan, medications, tests ordered, referrals, follow-up...",
      value: "",
      color: "purple",
      icon: "P",
      suggestions: [],
    },
  ]);

  // Parse existing content into sections on mount
  useEffect(() => {
    if (value && value.trim()) {
      const parsed = parseContentToSections(value);
      setSections(prev => prev.map(section => ({
        ...section,
        value: parsed[section.id] || "",
      })));
    }
  }, []); // Only on mount

  // Update combined content when sections change
  useEffect(() => {
    const combined = combineSections();
    if (combined !== value) {
      onChange(combined);
    }
  }, [sections]);

  const parseContentToSections = (content: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const lines = content.split("\n");
    let currentSection: string | null = null;
    let currentText: string[] = [];

    for (const line of lines) {
      const upperLine = line.toUpperCase().trim();
      
      if (upperLine.includes("CHIEF COMPLAINT") || upperLine.startsWith("CC:")) {
        if (currentSection) result[currentSection] = currentText.join("\n").trim();
        currentSection = "chiefComplaint";
        currentText = [];
        continue;
      } else if (upperLine.includes("HISTORY OF PRESENT ILLNESS") || upperLine.includes("HPI:")) {
        if (currentSection) result[currentSection] = currentText.join("\n").trim();
        currentSection = "hpi";
        currentText = [];
        continue;
      } else if (upperLine.includes("PHYSICAL EXAM") || upperLine.includes("PE:")) {
        if (currentSection) result[currentSection] = currentText.join("\n").trim();
        currentSection = "physicalExam";
        currentText = [];
        continue;
      } else if (upperLine.includes("ASSESSMENT") || upperLine.includes("A:")) {
        if (currentSection) result[currentSection] = currentText.join("\n").trim();
        currentSection = "assessment";
        currentText = [];
        continue;
      } else if (upperLine.includes("PLAN") || upperLine.startsWith("P:")) {
        if (currentSection) result[currentSection] = currentText.join("\n").trim();
        currentSection = "plan";
        currentText = [];
        continue;
      }

      if (currentSection && line.trim()) {
        currentText.push(line);
      }
    }

    if (currentSection) {
      result[currentSection] = currentText.join("\n").trim();
    }

    return result;
  };

  const combineSections = (): string => {
    const parts: string[] = [];
    
    sections.forEach(section => {
      if (section.value.trim()) {
        parts.push(`${section.title.toUpperCase()}:`);
        parts.push(section.value);
        parts.push("");
      }
    });

    return parts.join("\n").trim();
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleSectionChange = (sectionId: string, newValue: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, value: newValue } : s
    ));
  };

  const handleCloseSection = () => {
    setActiveSection(null);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { subtle: string; active: string; border: string; text: string }> = {
      teal: {
        subtle: "bg-teal-50/30 dark:bg-teal-900/10 border-teal-200/30 dark:border-teal-800/30",
        active: "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700",
        border: "border-teal-300 dark:border-teal-600",
        text: "text-teal-700 dark:text-teal-300",
      },
      blue: {
        subtle: "bg-blue-50/30 dark:bg-blue-900/10 border-blue-200/30 dark:border-blue-800/30",
        active: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",
        border: "border-blue-300 dark:border-blue-600",
        text: "text-blue-700 dark:text-blue-300",
      },
      orange: {
        subtle: "bg-orange-50/30 dark:bg-orange-900/10 border-orange-200/30 dark:border-orange-800/30",
        active: "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700",
        border: "border-orange-300 dark:border-orange-600",
        text: "text-orange-700 dark:text-orange-300",
      },
      green: {
        subtle: "bg-green-50/30 dark:bg-green-900/10 border-green-200/30 dark:border-green-800/30",
        active: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700",
        border: "border-green-300 dark:border-green-600",
        text: "text-green-700 dark:text-green-300",
      },
      purple: {
        subtle: "bg-purple-50/30 dark:bg-purple-900/10 border-purple-200/30 dark:border-purple-800/30",
        active: "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",
        border: "border-purple-300 dark:border-purple-600",
        text: "text-purple-700 dark:text-purple-300",
      },
    };

    return colors[color] || colors.teal;
  };

  return (
    <div className="space-y-2">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        const hasContent = section.value.trim().length > 0;
        const colorClasses = getColorClasses(section.color);

        return (
          <div key={section.id} className="relative">
            {!isActive ? (
              // Subtle, suggestive section placeholder
              <button
                type="button"
                onClick={() => handleSectionClick(section.id)}
                className={`w-full text-left p-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-sm ${
                  hasContent
                    ? `${colorClasses.active} ${colorClasses.border}`
                    : `${colorClasses.subtle} hover:${colorClasses.active}`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${
                      hasContent 
                        ? colorClasses.text
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    }`}
                    style={hasContent ? {
                      backgroundColor: section.color === 'teal' ? 'rgba(204, 251, 241, 0.3)' :
                                    section.color === 'blue' ? 'rgba(219, 234, 254, 0.3)' :
                                    section.color === 'orange' ? 'rgba(255, 237, 213, 0.3)' :
                                    section.color === 'green' ? 'rgba(220, 252, 231, 0.3)' :
                                    'rgba(243, 232, 255, 0.3)'
                    } : {}}
                    >
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${hasContent ? colorClasses.text : "text-gray-500 dark:text-gray-400"}`}>
                        {section.title}
                      </div>
                      {hasContent ? (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {section.value.substring(0, 60)}...
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                          {section.placeholder}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform ${
                      isActive ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </button>
            ) : (
              // Active section with autocomplete
              <div className={`p-4 rounded-lg border-2 ${colorClasses.active} ${colorClasses.border} shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${colorClasses.text}`}
                      style={{
                        backgroundColor: section.color === 'teal' ? 'rgba(204, 251, 241, 0.5)' :
                                      section.color === 'blue' ? 'rgba(219, 234, 254, 0.5)' :
                                      section.color === 'orange' ? 'rgba(255, 237, 213, 0.5)' :
                                      section.color === 'green' ? 'rgba(220, 252, 231, 0.5)' :
                                      'rgba(243, 232, 255, 0.5)'
                      }}
                    >
                      {section.icon}
                    </div>
                    <h4 className={`font-semibold text-sm ${colorClasses.text}`}>
                      {section.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseSection}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={section.value}
                    onChange={(e) => handleSectionChange(section.id, e.target.value)}
                    placeholder={section.placeholder}
                    rows={section.id === "hpi" || section.id === "plan" ? 4 : 3}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 transition-colors resize-none ${colorClasses.border}`}
                    style={{
                      '--tw-ring-color': section.color === 'teal' ? '#14b8a6' :
                                        section.color === 'blue' ? '#3b82f6' :
                                        section.color === 'orange' ? '#f97316' :
                                        section.color === 'green' ? '#22c55e' :
                                        '#a855f7'
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = section.color === 'teal' ? '#14b8a6' :
                                                   section.color === 'blue' ? '#3b82f6' :
                                                   section.color === 'orange' ? '#f97316' :
                                                   section.color === 'green' ? '#22c55e' :
                                                   '#a855f7';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                    }}
                    autoFocus
                  />
                  
                  {section.suggestions.length > 0 && section.value.length >= 1 && (
                    <SuggestionsDropdown
                      query={section.value}
                      suggestions={section.suggestions}
                      onSelect={(suggestion) => {
                        const words = section.value.trim().split(/\s+/);
                        const newValue = words.slice(0, -1).join(' ') + 
                                       (words.length > 1 ? ' ' : '') + 
                                       suggestion.value;
                        handleSectionChange(section.id, newValue);
                      }}
                    />
                  )}
                  
                  {section.suggestions.length > 0 && section.value.length === 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      <Sparkles size={12} />
                      <span>Start typing to see auto-suggestions</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Combined preview */}
      {value && value.trim() && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Combined Note Preview:
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono text-xs">
            {value}
          </div>
        </div>
      )}
    </div>
  );
}

