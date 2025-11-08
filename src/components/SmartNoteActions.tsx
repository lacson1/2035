import { useState, useEffect, useMemo } from "react";
import { Calendar, ArrowRight, Sparkles, X } from "lucide-react";
import { Patient } from "../types";

interface SmartNoteActionsProps {
  text: string;
  patient?: Patient;
  onCreateFollowUp: (data: { date?: string; reason: string; notes?: string }) => void;
  onCreateReferral: (data: { specialty: string; reason: string; priority?: string; notes?: string }) => void;
  onClose?: () => void;
}

export default function SmartNoteActions({
  text,
  onCreateFollowUp,
  onCreateReferral,
  onClose,
}: SmartNoteActionsProps) {
  const [showActions, setShowActions] = useState(false);

  // Detect keywords and extract information
  const detectedActions = useMemo(() => {
    const lowerText = text.toLowerCase();
    const actions: {
      type: "follow-up" | "referral";
      confidence: number;
      data: any;
    }[] = [];

    // Follow-up detection patterns
    const followUpPatterns = [
      /follow.?up/i,
      /f\/u/i,
      /return in (\d+)\s*(weeks?|months?|days?)/i,
      /schedule follow.?up/i,
      /recheck in/i,
      /review in/i,
      /follow.?up appointment/i,
    ];

    const hasFollowUp = followUpPatterns.some(pattern => pattern.test(text));
    if (hasFollowUp) {
      // Extract reason from surrounding context
      const lines = text.split('\n');
      const followUpLine = lines.find(line => followUpPatterns.some(p => p.test(line)));
      const reason = followUpLine || text.substring(Math.max(0, text.indexOf('follow') - 50), text.indexOf('follow') + 100);

      actions.push({
        type: "follow-up",
        confidence: 0.8,
        data: {
          reason: reason.trim().substring(0, 200) || "Follow-up consultation",
          notes: text.substring(0, 500),
        },
      });
    }

    // Referral detection patterns
    const referralPatterns = [
      /refer to/i,
      /referral to/i,
      /refer patient to/i,
      /consult with/i,
      /send to/i,
      /transfer to/i,
    ];

    const specialtyKeywords: Record<string, string[]> = {
      cardiology: ['cardiology', 'cardiac', 'heart', 'cardiologist'],
      dermatology: ['dermatology', 'dermatologist', 'skin'],
      endocrinology: ['endocrinology', 'endocrinologist', 'diabetes', 'thyroid'],
      gastroenterology: ['gastroenterology', 'gastroenterologist', 'gi', 'gastro'],
      neurology: ['neurology', 'neurologist', 'neurological'],
      oncology: ['oncology', 'oncologist', 'cancer'],
      orthopedics: ['orthopedics', 'orthopedic', 'orthopedist', 'bone', 'joint'],
      psychiatry: ['psychiatry', 'psychiatrist', 'mental health', 'psychiatric'],
      pulmonology: ['pulmonology', 'pulmonologist', 'lung', 'respiratory'],
      urology: ['urology', 'urologist', 'urological'],
    };

    const hasReferral = referralPatterns.some(pattern => pattern.test(text));
    if (hasReferral) {
      // Detect specialty
      let detectedSpecialty = "";
      let priority: "routine" | "urgent" | "stat" | "emergency" = "routine";

      for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          detectedSpecialty = specialty;
          break;
        }
      }

      // Detect priority
      if (/\b(urgent|asap|as soon as possible)\b/i.test(text)) {
        priority = "urgent";
      } else if (/\b(stat|immediate|emergency)\b/i.test(text)) {
        priority = "stat";
      }

      // Extract reason
      const lines = text.split('\n');
      const referralLine = lines.find(line => referralPatterns.some(p => p.test(line)));
      const reason = referralLine 
        ? referralLine.replace(/refer.*?to/i, '').trim().substring(0, 200)
        : "Specialist consultation";

      if (detectedSpecialty || reason.length > 10) {
        actions.push({
          type: "referral",
          confidence: detectedSpecialty ? 0.9 : 0.6,
          data: {
            specialty: detectedSpecialty || "other",
            reason: reason || "Specialist consultation",
            priority,
            notes: text.substring(0, 500),
          },
        });
      }
    }

    return actions.sort((a, b) => b.confidence - a.confidence);
  }, [text]);

  useEffect(() => {
    setShowActions(detectedActions.length > 0 && text.length > 20);
  }, [detectedActions, text]);

  if (!showActions || detectedActions.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Quick Actions Available
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {detectedActions.map((action, index) => (
          <div key={index} className="flex items-center gap-2">
            {action.type === "follow-up" ? (
              <>
                <button
                  onClick={() => {
                    onCreateFollowUp(action.data);
                    setShowActions(false);
                  }}
                  className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm text-blue-700 dark:text-blue-300"
                >
                  <Calendar size={14} />
                  <span>Create Follow-Up Appointment</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onCreateReferral(action.data);
                    setShowActions(false);
                  }}
                  className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm text-blue-700 dark:text-blue-300"
                >
                  <ArrowRight size={14} />
                  <span>
                    Create Referral {action.data.specialty && `to ${action.data.specialty}`}
                  </span>
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
        💡 Detected from your note text. Click to create with pre-filled information.
      </p>
    </div>
  );
}

