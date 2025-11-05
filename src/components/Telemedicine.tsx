import { useState, useEffect, useRef } from "react";
import { Video, Phone, Calendar, Clock, User, Mic, MicOff, VideoOff, MessageSquare, X, Play, Trash2 } from "lucide-react";
import { Patient } from "../types";

interface TelemedicineSession {
  id: string;
  date: string;
  time: string;
  duration: string;
  provider: string;
  type: "video" | "phone";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes?: string;
  startTime?: number;
  endTime?: number;
}

interface TelemedicineProps {
  patient: Patient;
  onSessionScheduled?: (session: TelemedicineSession) => void;
  onSessionUpdated?: (session: TelemedicineSession) => void;
}

export default function Telemedicine({ patient, onSessionScheduled, onSessionUpdated }: TelemedicineProps) {
  const [open, setOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeSession, setActiveSession] = useState<TelemedicineSession | null>(null);
  const [sessions, setSessions] = useState<TelemedicineSession[]>([
    {
      id: "tele-001",
      date: "2025-01-18",
      time: "14:00",
      duration: "30 min",
      provider: "Dr. Johnson",
      type: "video",
      status: "scheduled",
    },
    {
      id: "tele-002",
      date: "2025-01-10",
      time: "10:30",
      duration: "25 min",
      provider: "Dr. Johnson",
      type: "video",
      status: "completed",
    },
  ]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "video" as "video" | "phone",
    provider: "",
    notes: "",
    duration: "30",
  });

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartCall = (session?: TelemedicineSession) => {
    if (session) {
      // Start from scheduled session
      const updatedSession = { ...session, status: "in-progress" as const, startTime: Date.now() };
      setActiveSession(updatedSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? updatedSession : s))
      );
      if (onSessionUpdated) {
        onSessionUpdated(updatedSession);
      }
    } else {
      // Start immediate call
      const newSession: TelemedicineSession = {
        id: `tele-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        duration: "0 min",
        provider: "Dr. Current User",
        type: "video",
        status: "in-progress",
        startTime: Date.now(),
      };
      setActiveSession(newSession);
      setSessions((prev) => [newSession, ...prev]);
    }
    setIsCallActive(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    if (activeSession) {
      const endTime = Date.now();
      const durationMs = endTime - (activeSession.startTime || endTime);
      const durationMins = Math.floor(durationMs / 60000);
      
      const completedSession = {
        ...activeSession,
        status: "completed" as const,
        endTime,
        duration: `${durationMins} min`,
      };
      
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? completedSession : s))
      );
      
      if (onSessionUpdated) {
        onSessionUpdated(completedSession);
      }
      
      setActiveSession(null);
    }
    setIsCallActive(false);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setCallDuration(0);
  };

  const handleCancelSession = (sessionId: string) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      const cancelledSession = sessions.find((s) => s.id === sessionId);
      if (cancelledSession) {
        const updated = { ...cancelledSession, status: "cancelled" as const };
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updated : s))
        );
        if (onSessionUpdated) {
          onSessionUpdated(updated);
        }
      }
    }
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: TelemedicineSession = {
      id: `tele-${Date.now()}`,
      date: formData.date,
      time: formData.time,
      duration: `${formData.duration} min`,
      provider: formData.provider,
      type: formData.type,
      status: "scheduled",
      notes: formData.notes || undefined,
    };

    setSessions((prev) => [newSession, ...prev]);

    if (onSessionScheduled) {
      onSessionScheduled(newSession);
    }

    setFormData({ date: "", time: "", type: "video", provider: "", notes: "", duration: "30" });
    setOpen(false);
  };

  const scheduledSessions = sessions.filter((s) => s.status === "scheduled");
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const canStartNow = scheduledSessions.length > 0 && scheduledSessions[0].date <= new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Telemedicine Sessions</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 text-sm"
            >
              <Calendar size={18} /> Schedule Session
            </button>
            {!isCallActive && (
              <button
                onClick={() => handleStartCall()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <Video size={18} /> Start Immediate Call
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Call Interface */}
      {isCallActive && (
        <div className="p-6 bg-gray-900 rounded-lg border-2 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Call in Progress</span>
              {activeSession && (
                <span className="text-white text-sm">
                  • {activeSession.provider}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white font-mono text-lg">
                {formatDuration(callDuration)}
              </div>
              <button
                onClick={handleEndCall}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <X size={18} /> End Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Patient Video */}
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative border-2 border-gray-700">
              <div className="text-center">
                <User size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-white font-medium">{patient.name}</p>
                <p className="text-gray-400 text-sm">Patient</p>
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center rounded-lg">
                  <VideoOff size={32} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Provider Video */}
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative border-2 border-teal-500">
              <div className="text-center">
                <User size={48} className="text-teal-400 mx-auto mb-2" />
                <p className="text-white font-medium">{activeSession?.provider || "Dr. Provider"}</p>
                <p className="text-gray-400 text-sm">Provider</p>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-3 rounded-full transition ${
                isAudioEnabled
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
              title={isAudioEnabled ? "Mute" : "Unmute"}
            >
              {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3 rounded-full transition ${
                isVideoEnabled
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button 
              className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Chat"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Sessions */}
      {scheduledSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Scheduled Sessions</h4>
          {scheduledSessions.map((session) => (
            <div
              key={session.id}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700"
            >
              <div className="flex items-center gap-4 flex-1">
                {session.type === "video" ? (
                  <Video size={20} className="text-teal-600 dark:text-teal-400" />
                ) : (
                  <Phone size={20} className="text-green-600 dark:text-green-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar size={14} className="text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">{new Date(session.date).toLocaleDateString()}</span>
                    <Clock size={14} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-sm">{session.time}</span>
                    <span className="text-xs text-gray-500">({session.duration})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-gray-600 dark:text-gray-400" />
                    <span>{session.provider}</span>
                  </div>
                  {session.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{session.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canStartNow && session.id === scheduledSessions[0].id && (
                  <button
                    onClick={() => handleStartCall(session)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    title="Start this session now"
                  >
                    <Play size={14} /> Start
                  </button>
                )}
                <button
                  onClick={() => handleCancelSession(session.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Cancel session"
                >
                  <Trash2 size={16} />
                </button>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    session.status === "scheduled"
                      ? "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">Completed Sessions</h4>
          {completedSessions.slice(0, 5).map((session) => (
            <div
              key={session.id}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 opacity-75"
            >
              <div className="flex items-center gap-4 flex-1">
                {session.type === "video" ? (
                  <Video size={20} className="text-teal-600 dark:text-teal-400" />
                ) : (
                  <Phone size={20} className="text-green-600 dark:text-green-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar size={14} className="text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">{new Date(session.date).toLocaleDateString()}</span>
                    <Clock size={14} className="text-gray-600 dark:text-gray-400" />
                    <span className="text-sm">{session.time}</span>
                    <span className="text-xs text-gray-500">({session.duration})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-gray-600 dark:text-gray-400" />
                    <span>{session.provider}</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {session.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No telemedicine sessions scheduled
        </p>
      )}

      {/* Schedule Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Schedule Telemedicine Session</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "video" })}
                    className={`flex-1 p-3 border rounded-md flex items-center justify-center gap-2 ${
                      formData.type === "video"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <Video size={18} />
                    <span className="text-base">Video Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "phone" })}
                    className={`flex-1 p-3 border rounded-md flex items-center justify-center gap-2 ${
                      formData.type === "phone"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <Phone size={18} />
                    <span className="text-base">Phone Call</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Provider</label>
                <input
                  type="text"
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Duration (minutes)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reason for visit, symptoms, etc..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

