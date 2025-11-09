import { useState, useEffect, useRef } from "react";
import { 
  Video, Phone, Calendar, Clock, User, Mic, MicOff, VideoOff, MessageSquare, 
  X, Play, Trash2, Monitor, MonitorOff, Wifi, WifiOff, Search, Filter,
  FileText, CheckCircle, AlertCircle, Maximize2, Minimize2, Send, Download, Save
} from "lucide-react";
import { Patient } from "../types";
import { useAutoSave } from "../hooks/useAutoSave";
import { persistData, loadPersistedData } from "../utils/persistence";
import { createSnapshot, recoverFromSnapshot, hasUnsavedChanges, setupBeforeUnloadWarning } from "../utils/dataRecovery";

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
  postSessionNotes?: string;
  recordingUrl?: string;
}

interface ChatMessage {
  id: string;
  sender: "provider" | "patient";
  message: string;
  timestamp: number;
}

interface TelemedicineProps {
  patient: Patient;
  onSessionScheduled?: (session: TelemedicineSession) => void;
  onSessionUpdated?: (session: TelemedicineSession) => void;
}

export default function Telemedicine({ patient, onSessionScheduled, onSessionUpdated }: TelemedicineProps) {
  const [open, setOpen] = useState(false);
  const [showPostSessionNotes, setShowPostSessionNotes] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "fair" | "poor">("excellent");
  const [callDuration, setCallDuration] = useState(0);
  const [activeSession, setActiveSession] = useState<TelemedicineSession | null>(null);
  // Load sessions from persistence on mount
  const [sessions, setSessions] = useState<TelemedicineSession[]>(() => {
    const saved = loadPersistedData<TelemedicineSession[]>(`telemedicine-sessions-${patient.id}`);
    return saved || [
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
        postSessionNotes: "Patient reported improvement in symptoms. Follow-up scheduled in 2 weeks.",
      },
    ];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "video" | "phone">("all");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "video" as "video" | "phone",
    provider: "",
    notes: "",
    duration: "30",
  });

  // Patient preparation checklist with persistence
  const [preparationChecklist, setPreparationChecklist] = useState<{
    internetChecked: boolean;
    deviceTested: boolean;
    locationQuiet: boolean;
    documentsReady: boolean;
  }>(() => {
    const saved = loadPersistedData<{
      internetChecked: boolean;
      deviceTested: boolean;
      locationQuiet: boolean;
      documentsReady: boolean;
    }>(`telemedicine-checklist-${patient.id}`);
    return saved || {
      internetChecked: false,
      deviceTested: false,
      locationQuiet: false,
      documentsReady: false,
    };
  });

  // Auto-save sessions
  useAutoSave({
    key: `telemedicine-sessions-${patient.id}`,
    data: sessions,
    enabled: true,
    debounceMs: 2000,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Auto-save checklist
  useAutoSave({
    key: `telemedicine-checklist-${patient.id}`,
    data: preparationChecklist,
    enabled: true,
    debounceMs: 1000,
  });

  // Auto-save chat messages during active call
  useAutoSave({
    key: `telemedicine-chat-${activeSession?.id}`,
    data: chatMessages,
    enabled: isCallActive && chatMessages.length > 0,
    debounceMs: 500,
  });

  // Create recovery snapshots
  useEffect(() => {
    if (sessions.length > 0) {
      createSnapshot(`telemedicine-sessions-${patient.id}`, sessions);
    }
  }, [sessions, patient.id]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const cleanup = setupBeforeUnloadWarning(
      `telemedicine-sessions-${patient.id}`,
      sessions
    );
    return cleanup;
  }, [sessions, patient.id]);

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
        // Simulate connection quality changes
        if (prev % 30 === 0) {
          const qualities: Array<"excellent" | "good" | "fair" | "poor"> = ["excellent", "good", "fair", "poor"];
          setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        }
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case "excellent": return "text-green-400";
      case "good": return "text-green-300";
      case "fair": return "text-yellow-400";
      case "poor": return "text-red-400";
    }
  };

  const handleStartCall = (session?: TelemedicineSession) => {
    if (session) {
      const updatedSession = { ...session, status: "in-progress" as const, startTime: Date.now() };
      setActiveSession(updatedSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? updatedSession : s))
      );
      if (onSessionUpdated) {
        onSessionUpdated(updatedSession);
      }
    } else {
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
    setChatMessages([]);
    setIsChatOpen(false);
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
        recordingUrl: isRecording ? `recording-${activeSession.id}.mp4` : undefined,
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
    setIsScreenSharing(false);
    setIsRecording(false);
    setCallDuration(0);
    setChatMessages([]);
    setIsChatOpen(false);
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

      setSessions((prev) => {
        const updated = [newSession, ...prev];
        // Persist immediately
        persistData(updated, {
          key: `telemedicine-sessions-${patient.id}`,
          ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        return updated;
      });

    if (onSessionScheduled) {
      onSessionScheduled(newSession);
    }

    setFormData({ date: "", time: "", type: "video", provider: "", notes: "", duration: "30" });
    setOpen(false);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "provider",
        message: chatInput.trim(),
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, newMessage]);
      setChatInput("");
    }
  };

  const handleSavePostSessionNotes = (sessionId: string, notes: string) => {
    const updated = sessions.find((s) => s.id === sessionId);
    if (updated) {
      const updatedSession = { ...updated, postSessionNotes: notes };
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );
      if (onSessionUpdated) {
        onSessionUpdated(updatedSession);
      }
    }
    setShowPostSessionNotes(null);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.date.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    const matchesType = typeFilter === "all" || session.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const scheduledSessions = filteredSessions.filter((s) => s.status === "scheduled");
  const completedSessions = filteredSessions.filter((s) => s.status === "completed");
  const canStartNow = scheduledSessions.length > 0 && scheduledSessions[0].date <= new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Telemedicine Sessions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage video consultations and remote patient care
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Calendar size={18} /> Schedule Session
            </button>
            {!isCallActive && (
              <button
                onClick={() => handleStartCall()}
                className="flex items-center gap-2 px-4 py-2.5 bg-success-500 text-white rounded-xl hover:bg-success-600 text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Video size={18} /> Start Immediate Call
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Call Interface */}
      {isCallActive && (
        <div className="card p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-green-500 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-lg">Call in Progress</span>
              {activeSession && (
                <span className="text-gray-300 text-sm">
                  • {activeSession.provider}
                </span>
              )}
              <div className={`flex items-center gap-1 ml-2 ${getConnectionQualityColor()}`}>
                <Wifi size={16} />
                <span className="text-xs capitalize">{connectionQuality}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white font-mono text-xl font-semibold bg-gray-800 px-3 py-1.5 rounded-lg">
                {formatDuration(callDuration)}
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">Recording</span>
                </div>
              )}
              <button
                onClick={handleEndCall}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 font-medium shadow-lg transition-all"
              >
                <X size={18} /> End Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
            {/* Patient Video */}
            <div className="bg-gray-800 rounded-xl aspect-video flex items-center justify-center relative border-2 border-gray-700 overflow-hidden shadow-xl">
              <div className="text-center z-10">
                <User size={64} className="text-gray-400 mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">{patient.name}</p>
                <p className="text-gray-400 text-sm">Patient</p>
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center rounded-xl z-20">
                  <VideoOff size={40} className="text-gray-400" />
                </div>
              )}
              {isScreenSharing && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Monitor size={12} /> Sharing
                </div>
              )}
            </div>

            {/* Provider Video */}
            <div className="bg-gray-800 rounded-xl aspect-video flex items-center justify-center relative border-2 border-teal-500 overflow-hidden shadow-xl">
              <div className="text-center z-10">
                <User size={64} className="text-teal-400 mx-auto mb-3" />
                <p className="text-white font-semibold text-lg">{activeSession?.provider || "Dr. Provider"}</p>
                <p className="text-gray-400 text-sm">Provider</p>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isAudioEnabled
                  ? "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"
                  : "bg-red-600 text-white hover:bg-red-700 hover:scale-105"
              }`}
              title={isAudioEnabled ? "Mute" : "Unmute"}
            >
              {isAudioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isVideoEnabled
                  ? "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"
                  : "bg-red-600 text-white hover:bg-red-700 hover:scale-105"
              }`}
              title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isScreenSharing
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                  : "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"
              }`}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? <MonitorOff size={22} /> : <Monitor size={22} />}
            </button>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700 hover:scale-105"
                  : "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <div className="w-5 h-5 bg-white rounded"></div>
              ) : (
                <div className="w-5 h-5 border-2 border-white rounded"></div>
              )}
            </button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isChatOpen
                  ? "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105"
                  : "bg-gray-700 text-white hover:bg-gray-600 hover:scale-105"
              }`}
              title="Toggle chat"
            >
              <MessageSquare size={22} />
            </button>
          </div>

          {/* Chat Panel */}
          {isChatOpen && (
            <div className="mt-4 bg-gray-800 rounded-xl border border-gray-700 p-4 h-64 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Chat</h4>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No messages yet</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "provider" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          msg.sender === "provider"
                            ? "bg-teal-600 text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Patient Preparation Checklist */}
      {!isCallActive && scheduledSessions.length > 0 && (
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <CheckCircle size={18} />
            Pre-Session Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(preparationChecklist).map(([key, checked]) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    setPreparationChecklist((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .replace("Internet Checked", "Internet connection tested")
                    .replace("Device Tested", "Device camera/microphone tested")
                    .replace("Location Quiet", "Quiet, private location")
                    .replace("Documents Ready", "Medical documents ready")}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {!isCallActive && filteredSessions.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Sessions */}
      {scheduledSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar size={18} />
            Scheduled Sessions ({scheduledSessions.length})
          </h4>
          {scheduledSessions.map((session) => (
            <div
              key={session.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {session.type === "video" ? (
                    <Video size={24} className="text-teal-600 dark:text-teal-400 mt-1" />
                  ) : (
                    <Phone size={24} className="text-green-600 dark:text-green-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="font-semibold">{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm">{session.time}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {session.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <User size={16} className="text-gray-500" />
                      <span className="font-medium">{session.provider}</span>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{session.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canStartNow && session.id === scheduledSessions[0].id && (
                    <button
                      onClick={() => handleStartCall(session)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-success-500 text-white rounded-xl hover:bg-success-600 font-medium transition-all"
                      title="Start this session now"
                    >
                      <Play size={16} /> Start
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelSession(session.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Cancel session"
                  >
                    <Trash2 size={18} />
                  </button>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      session.status === "scheduled"
                        ? "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle size={18} />
            Completed Sessions ({completedSessions.length})
          </h4>
          {completedSessions.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {session.type === "video" ? (
                    <Video size={24} className="text-teal-600 dark:text-teal-400 mt-1" />
                  ) : (
                    <Phone size={24} className="text-green-600 dark:text-green-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="font-semibold">{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm">{session.time}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {session.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <User size={16} className="text-gray-500" />
                      <span className="font-medium">{session.provider}</span>
                    </div>
                    {session.postSessionNotes && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Notes:</strong> {session.postSessionNotes}
                        </p>
                      </div>
                    )}
                    {session.recordingUrl && (
                      <div className="mt-2">
                        <button className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                          <Download size={16} />
                          Download Recording
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!session.postSessionNotes && (
                    <button
                      onClick={() => setShowPostSessionNotes(session.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium transition-all"
                    >
                      <FileText size={16} /> Add Notes
                    </button>
                  )}
                  <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {session.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSessions.length === 0 && (
        <div className="card p-12 text-center">
          <Video size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No telemedicine sessions found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Schedule a session to get started"}
          </p>
        </div>
      )}

      {/* Schedule Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Schedule Telemedicine Session</h4>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "video" })}
                    className={`flex-1 p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.type === "video"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 shadow-md"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Video size={24} />
                    <span className="font-medium">Video Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "phone" })}
                    className={`flex-1 p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.type === "phone"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 shadow-md"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Phone size={24} />
                    <span className="font-medium">Phone Call</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Provider</label>
                <input
                  type="text"
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Duration (minutes)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reason for visit, symptoms, special instructions..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Session Notes Modal */}
      {showPostSessionNotes && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPostSessionNotes(null);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Post-Session Notes</h4>
              <button
                onClick={() => setShowPostSessionNotes(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <textarea
              placeholder="Add notes about the session, patient condition, follow-up recommendations..."
              rows={6}
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none mb-4"
              defaultValue={sessions.find((s) => s.id === showPostSessionNotes)?.postSessionNotes || ""}
              id="post-session-notes-input"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPostSessionNotes(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById("post-session-notes-input") as HTMLTextAreaElement;
                  handleSavePostSessionNotes(showPostSessionNotes, input.value);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 font-medium shadow-sm hover:shadow-md transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
